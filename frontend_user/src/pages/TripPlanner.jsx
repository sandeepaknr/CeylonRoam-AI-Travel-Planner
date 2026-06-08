import React, { useState, useContext, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Imported for navigation between pages
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LuSend } from "react-icons/lu";
import "./styles/tripplanner.css";

/* ----------------------------------------------------------------
 MODULE-LEVEL CONSTANTS (never re-created, no stale closures)
 ---------------------------------------------------------------- */
const todayDate = new Date().toISOString().split("T")[0];
const CHAT_API_URL = "http://127.0.0.1:5001/chat";

const KEYWORD_SUGGESTIONS = [
 "Beach", "Mountains", "Safari", "Ancient ruins",
 "Tea estates", "Surfing", "Camping", "Whale watching",
];

const TRANSPORT_OPTIONS = [
 { value: "Private Car", icon: "Car", name: "Private Car", note: "Most flexible" },
 { value: "Public Transport", icon: "Bus", name: "Bus / Train", note: "Budget-friendly" },
 { value: "Tuk Tuk", icon: "Tuk", name: "Tuk Tuk", note: "Classic Sri Lanka" },
 { value: "Bike", icon: "Bike", name: "Motorbike", note: "Adventurous" },
];

const DEFAULT_GREETING = [
 { from: "bot", text: "Ayubowan! I'm Roamy, your CeylonRoam AI travel assistant powered by Gemini. Ask me anything about traveling in Sri Lanka." },
];

/* --- Gemini chat fetch --------------------------------------- */
async function fetchAIReply(message, userName = "") {
 const res = await fetch(CHAT_API_URL, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ message, userName }),
 });
 if (!res.ok) throw new Error(`Server error ${res.status}`);
 const data = await res.json();
 if (data.status === "success") return data.reply;
 throw new Error(data.message || "Unknown error");
}

/* ----------------------------------------------------------------
 MAIN COMPONENT
 ---------------------------------------------------------------- */
export default function TripPlanner() {
 const { user } = useContext(AuthContext);
 const { selectedCurrency, formatPrice, convertToLKR, currencySymbol, loadingRates } = useContext(CurrencyContext);
 const navigate = useNavigate(); // Used to redirect to Login page

 /* -- Wizard step (0=Landing, 1-4=Wizard, 5=Loading, 6=Itinerary) -- */
 const [step, setStep] = useState(0);
 const [loading, setLoading] = useState(false);
 const [saveLoading, setSaveLoading] = useState(false);

 /* -- Form data – ALL API fields -- */
 const [formData, setFormData] = useState({
 budget: "",
 days: "",
 transport: "Private Car",
 members: "2",
 keywords: "",
 start_loc: "Colombo",
 preferred_region: "",
 start_date: todayDate,
 has_vulnerable: false,
 });

 /* -- Image upload -- */
 const fileInputRef = useRef(null);
 const [selectedImage, setSelectedImage] = useState(null);
 const [selectedImageURL, setSelectedImageURL] = useState(null);

 /* -- Popups -- */
 const [showDetectionPopup, setShowDetectionPopup] = useState(false);
 const [detectionData, setDetectionData] = useState(null);
 const [showBudgetPopup, setShowBudgetPopup] = useState(false);

 /* -- Itinerary result -- */
 const [plan, setPlan] = useState(null);

 /* -- Chatbot state -- */
 const chatStorageKey = `roamy_chat_${user?._id || user?.id || "guest"}`;
 const [chatOpen, setChatOpen] = useState(false);
 const [chatClosing, setChatClosing] = useState(false);
 const [chatInput, setChatInput] = useState("");
 const [isChatLoading, setIsChatLoading] = useState(false);
 const messagesEndRef = useRef(null);
 const statsRef = useRef(null);
 const [destinationCount, setDestinationCount] = useState(0);
 const [hasCountedDestinations, setHasCountedDestinations] = useState(false);

 /* Lazy-init messages safely */
 const [messages, setMessages] = useState(DEFAULT_GREETING);

 /* Reload history ONLY when user identity officially mounts/changes */
 useEffect(() => {
 try {
 const key = `roamy_chat_${user?._id || user?.id || "guest"}`;
 const saved = localStorage.getItem(key);
 if (saved) {
 setMessages(JSON.parse(saved));
 } else {
 setMessages(DEFAULT_GREETING);
 }
 } catch {
 setMessages(DEFAULT_GREETING);
 }
 }, [user]); // user is the only dependency

 /* Persist chat to localStorage when messages array is updated */
 useEffect(() => {
 try {
 const key = `roamy_chat_${user?._id || user?.id || "guest"}`;
 localStorage.setItem(key, JSON.stringify(messages));
 } catch { /* skip */ }
 }, [messages]); // only trigger when messages change

 /* Auto-scroll only when a NEW message is added */
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages.length]);

 /* Revoke preview object URL on unmount */
 useEffect(() => {
 return () => { if (selectedImageURL) URL.revokeObjectURL(selectedImageURL); };
 }, [selectedImageURL]);

 useEffect(() => {
 if (step !== 0 || hasCountedDestinations) return undefined;

 const startCounter = () => {
 setHasCountedDestinations(true);
 const duration = 1300;
 const startTime = performance.now();

 const tick = (now) => {
 const progress = Math.min((now - startTime) / duration, 1);
 const eased = 1 - Math.pow(1 - progress, 3);
 setDestinationCount(Math.round(eased * 200));
 if (progress < 1) requestAnimationFrame(tick);
 };

 requestAnimationFrame(tick);
 };

 const node = statsRef.current;
 if (!node || !("IntersectionObserver" in window)) {
 startCounter();
 return undefined;
 }

 const observer = new IntersectionObserver(
 entries => entries.forEach(entry => {
 if (entry.isIntersecting) {
 startCounter();
 observer.disconnect();
 }
 }),
 { threshold: 0.45 }
 );

 observer.observe(node);
 return () => observer.disconnect();
 }, [step, hasCountedDestinations]);
 /* ------------------------------------------------------------
 HANDLERS
 ------------------------------------------------------------ */
 const handleChange = (e) => {
 const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
 setFormData({ ...formData, [e.target.name]: value });
 };

 const appendKeyword = (kw) => {
 const stripped = kw.replace(/^[^\w]+/, "").trim();
 if (!formData.keywords.toLowerCase().includes(stripped.toLowerCase())) {
 const current = formData.keywords ? formData.keywords + ", " : "";
 setFormData({ ...formData, keywords: current + stripped });
 }
 };

 /* Protected clicks for landing buttons */
 const handleManualPlanningClick = () => {
 if (!user) {
 toast.error("Please log in to plan your trip.");
 navigate("/login");
 return;
 }
 setStep(1);
 setSelectedImage(null);
 };

 const handlePhotoUploadClick = () => {
 if (!user) {
 toast.error("Please log in to use photo upload.");
 navigate("/login");
 return;
 }
 fileInputRef.current.click();
 };

 /* -- AI Image Upload ? Detection Popup -- */
 const handleImageUpload = async (e) => {
 const file = e.target.files[0];
 if (!file) return;
 setSelectedImage(file);
 const previewURL = URL.createObjectURL(file);
 setSelectedImageURL(previewURL);
 const imageFormData = new FormData();
 imageFormData.append("image", file);
 setLoading(true);
 try {
 const res = await fetch("http://127.0.0.1:5001/predict", { method: "POST", body: imageFormData });
 const data = await res.json();
 if (data.status === "success") {
 setDetectionData(data);
 setShowDetectionPopup(true);
 } else {
 toast.error(`AI could not recognise the image: ${data.error || data.message || "Unknown error"}`);
 }
 } catch {
 toast.error("Failed to connect to AI Server. Make sure Python server.py is running on port 5001.");
 } finally {
 setLoading(false);
 }
 };

 /* -- "Plan Trip Here" in Detection Popup -- */
 const handleConfirmDetection = () => {
 if (!detectionData) return;
 const autoKeywords = `${detectionData.category.replace("/", ", ")}, ${detectionData.predicted_place}, ${detectionData.district}`;
 setFormData({
 ...formData,
 keywords: autoKeywords,
 // Otherwise, render as a standard link
 preferred_region: detectionData.district,
 });
 setShowDetectionPopup(false);
 setStep(1);
 };

 /* -- Generate Plan -- */
 const handleSubmit = async (forceFree = false) => {
 setLoading(true);
 setShowBudgetPopup(false);
 setStep(5); // show loading screen

 try {
 const combinedKeywords = formData.preferred_region
 ? formData.keywords + ", " + formData.preferred_region
 : formData.keywords;

 const payload = { ...formData, keywords: combinedKeywords };
 payload.budget = convertToLKR(formData.budget); // Ensure backend receives raw LKR
 if (forceFree) payload.force_free_places = true;

 const res = await API.post("/ai/generate-plan", payload);

 if (res.data?.status === "budget_insufficient") {
 setShowBudgetPopup(true);
 setStep(4);
 return;
 }

 if (res.data && Array.isArray(res.data.itinerary)) {
 setPlan(res.data);
 setStep(6);
 } else {
 toast.error("Plan generation failed: Invalid data received from server.");
 setStep(4);
 }
 } catch (err) {
 console.error(err);
 const msg = err.response?.data?.message || "";
 if (msg.toLowerCase().includes("budget")) {
 setShowBudgetPopup(true);
 setStep(4);
 } else {
 toast.error("AI Plan generation failed! Check your backend terminal for errors.");
 setStep(4);
 }
 } finally {
 setLoading(false);
 }
 };

 /* -- Save Trip -- */
 const handleSaveTrip = async () => {
 if (!user) { toast.error("Please log in to save your trip."); return; }
 setSaveLoading(true);
 const toastId = toast.loading("Saving your trip...");
 try {
 await API.post("/ai/save", {
 userId: user._id || user.id,
 planData: {
 tripTitle: plan.tripTitle || "Sri Lanka AI Trip",
 totalEstimatedCost: plan.totalEstimatedCost,
 fullDescription: plan.fullStory || "",
 itinerary: plan.itinerary,
 },
 formData,
 });
 toast.success("Trip saved to My Trips.", { id: toastId });
 } catch {
 toast.error("Failed to save the trip. Please try again.", { id: toastId });
 } finally {
 setSaveLoading(false);
 }
 };

 /* -- Chatbot toggle -- */
 const handleChatToggle = () => {
 if (chatOpen) {
 setChatClosing(true);
 setTimeout(() => { setChatOpen(false); setChatClosing(false); }, 280);
 } else {
 setChatOpen(true);
 }
 };

 /* -- Send chat message (shared for text input + quick replies) -- */
 const sendChatMessage = useCallback(async (text) => {
 const trimmed = text.trim();
 if (!trimmed || isChatLoading) return;

 setMessages(prev => [...prev, { from: "user", text: trimmed }]);
 setChatInput("");
 setIsChatLoading(true);

 const userName = user?.name || user?.username || user?.firstName || "";

 try {
 const reply = await fetchAIReply(trimmed, userName);
 setMessages(prev => [...prev, { from: "bot", text: reply }]);
 } catch (err) {
 console.error("Chat error:", err);
 setMessages(prev => [
 ...prev,
 { from: "bot", text: "Sorry, I couldn't reach the AI right now. Please check that the Python server is running on port 5001." },
 ]);
 } finally {
 setIsChatLoading(false);
 }
 }, [isChatLoading, user]);

 const handleSendMessage = useCallback(() => {
 sendChatMessage(chatInput);
 }, [chatInput, sendChatMessage]);

 const handleQuickReply = useCallback((qr) => {
 sendChatMessage(qr);
 }, [sendChatMessage]);

 /* ------------------------------------------------------------
 POPUP: AI Detection
 ------------------------------------------------------------ */
 const renderDetectionPopup = () => {
 if (!showDetectionPopup || !detectionData) return null;
 const confidencePct = detectionData.confidence ? Math.round(detectionData.confidence) : null;

 return (
 <div className="popup-overlay" onClick={() => setShowDetectionPopup(false)}>
 <div className="popup-card detection-popup" onClick={e => e.stopPropagation()}>
 <div className="popup-header">
 <div className="popup-header-icon">AI</div>
 <div>
 <div className="popup-label">AI Vision · Detection Result</div>
 <h3 className="popup-title">We Found Your Vibe!</h3>
 </div>
 <button className="popup-close-btn" onClick={() => setShowDetectionPopup(false)}>&times;</button>
 </div>

 <div className="detection-body">
 {selectedImageURL && (
 <div className="detection-image-wrap">
 <img src={selectedImageURL} alt="Uploaded" className="detection-image" />
 {confidencePct !== null && (
 <div className="confidence-badge">{confidencePct}% match</div>
 )}
 </div>
 )}
 <div className="detection-info">
 <div className="detect-row">
 <span className="detect-key">Place</span>
 <span className="detect-val">{detectionData.predicted_place}</span>
 </div>
 <div className="detect-row">
 <span className="detect-key">District</span>
 <span className="detect-val">{detectionData.district}</span>
 </div>
 <div className="detect-row">
 <span className="detect-key">Category</span>
 <span className="detect-val">{detectionData.category?.replace("/", " · ")}</span>
 </div>
 {detectionData.description && (
 <p className="detect-description">{detectionData.description}</p>
 )}
 </div>
 </div>

 <div className="popup-actions">
 <button
 className="btn btn-secondary"
 onClick={() => { setShowDetectionPopup(false); fileInputRef.current.click(); }}
 >
 Try Another Photo
 </button>
 <button className="btn btn-generate" onClick={handleConfirmDetection}>
 Plan Trip Here
 </button>
 </div>
 </div>
 </div>
 );
 };

 /* ------------------------------------------------------------
 POPUP: Budget Insufficient
 ------------------------------------------------------------ */
 const renderBudgetPopup = () => {
 if (!showBudgetPopup) return null;
 return (
 <div className="popup-overlay" onClick={() => setShowBudgetPopup(false)}>
 <div className="popup-card budget-popup" onClick={e => e.stopPropagation()}>
 <div className="popup-header">
 <div className="popup-header-icon budget-icon">Budget</div>
 <div>
 <div className="popup-label" style={{ color: "var(--sunset-red)" }}>Budget Alert</div>
 <h3 className="popup-title">Budget Too Low for This Trip</h3>
 </div>
 <button className="popup-close-btn" onClick={() => setShowBudgetPopup(false)}>&times;</button>
 </div>

 <p className="popup-body-text">
 Your current budget of <strong>{currencySymbol} {Number(formData.budget).toLocaleString()}</strong> isn't enough
 to cover hotels and transport for <strong>{formData.days} day(s)</strong> in the selected region.
 What would you like to do?
 </p>

 <div className="budget-options">
 <button
 className="budget-option-card"
 onClick={() => { setShowBudgetPopup(false); setStep(2); }}
 >
 <span className="b-opt-icon">Plan</span>
 <div>
 <div className="b-opt-title">Increase Budget & Try Again</div>
 <div className="b-opt-sub">Go back and enter a higher budget</div>
 </div>
 </button>
 <button
 className="budget-option-card budget-opt-free"
 onClick={() => handleSubmit(true)}
 >
 <span className="b-opt-icon">Plan</span>
 <div>
 <div className="b-opt-title">Generate with ONLY Free Places</div>
 <div className="b-opt-sub">Build a plan using free attractions only</div>
 </div>
 </button>
 </div>
 </div>
 </div>
 );
 };

 /* ------------------------------------------------------------
 STEP 0 – LANDING HERO
 ------------------------------------------------------------ */
 const renderLanding = () => (
 <div className="hero-landing-content">
 <div className="hero-badge"><span>AI</span> Sri Lanka's Smartest Trip Planner</div>
 <h1 className="hero-title">
 Plan Your<br /><em>Perfect Sri Lanka</em><br />Adventure
 </h1>
 <p className="hero-subtitle">
 AI-powered itineraries, smart budgeting, and day-by-day routes, crafted just for you in seconds.
 </p>

 <div className="hero-choices">
 {/* Updated Button 1 */}
 <button className="choice-card" onClick={handleManualPlanningClick}>
 <div className="choice-icon">AI</div>
 <div className="choice-text">
 <h3>Tell Us Your Interests</h3>
 <p>Type in your dream activities and we'll build a custom itinerary</p>
 </div>
 </button>

 <div style={{ position: "relative" }}>
 <input
 type="file"
 accept="image/*"
 ref={fileInputRef}
 style={{ display: "none" }}
 onChange={handleImageUpload}
 />
 {/* Updated Button 2 */}
 <button
 className="choice-card photo-card"
 onClick={handlePhotoUploadClick}
 disabled={loading}
 >
 <div className="choice-icon">{loading ? "..." : "AI"}</div>
 <div className="choice-text">
 <h3>{loading ? "Analysing Photo…" : "Upload a Photo"}</h3>
 <p>Let our AI detect your vibe from an image and plan accordingly</p>
 </div>
 </button>
 </div>
 </div>

 <div className="hero-stats" ref={statsRef}>
 <div className="hero-stat"><div className="hero-stat-num">{destinationCount}+</div><div className="hero-stat-label">Destinations</div></div>
 <div className="hero-stat"><div className="hero-stat-num">AI</div><div className="hero-stat-label">Powered</div></div>
 <div className="hero-stat"><div className="hero-stat-num">Free</div><div className="hero-stat-label">Always</div></div>
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 1 – Interests (start_loc + preferred_region + keywords)
 ------------------------------------------------------------ */
 const renderStep1 = () => (
 <div className="step-box">
 <div className="step-icon-wrap" aria-label="Step 01">
 <span className="step-icon-top">STEP</span>
 <span className="step-icon-num">01</span>
 </div>
 <h2 className="step-title">Where & What Do You Love?</h2>
 <p className="step-subtitle">Tell us your starting city, preferred area, and the experiences you're after.</p>

 <div className="input-group">
 <label className="input-label">Starting City</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="start_loc" type="text" placeholder="e.g. Colombo, Kandy, Galle…"
 value={formData.start_loc} onChange={handleChange} className="field-input" />
 </div>
 </div>

 <div className="input-group">
 <label className="input-label">Preferred Area <span className="opt-label">(Optional)</span></label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="preferred_region" type="text" placeholder="e.g. Down South, Ella, Cultural Triangle…"
 value={formData.preferred_region} onChange={handleChange} className="field-input" />
 </div>
 </div>

 <div className="input-group">
 <label className="input-label">Your Interests</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <textarea name="keywords" placeholder="e.g. Surfing, Tea estates, Ancient temples, Wildlife…"
 value={formData.keywords} onChange={handleChange} className="field-textarea" />
 </div>
 <div className="tag-suggestions">
 {KEYWORD_SUGGESTIONS.map(tag => (
 <button key={tag} className="tag-pill" type="button" onClick={() => appendKeyword(tag)}>{tag}</button>
 ))}
 </div>
 </div>

 <div className="btn-row">
 <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
 <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!formData.keywords.trim()}>
 Next
 </button>
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 2 – Budget
 ------------------------------------------------------------ */
 const renderStep2 = () => (
 <div className="step-box">
 <div className="step-icon-wrap" aria-label="Step 02">
 <span className="step-icon-top">STEP</span>
 <span className="step-icon-num">02</span>
 </div>
 <h2 className="step-title">What's Your Total Budget?</h2>
 <p className="step-subtitle">Enter your total trip budget in {selectedCurrency}. We'll handle the smart allocation.</p>

 <div className="input-group">
 <label className="input-label">Total Budget ({selectedCurrency})</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="budget" type="number" placeholder={`e.g. ${selectedCurrency === "LKR" ? "150000" : "500"}`}
 value={formData.budget} onChange={handleChange} className="field-input" min="1" />
 </div>
 </div>

 {formData.budget && (
 <div className="budget-hint-chip">
 ˜ {currencySymbol} {Math.round(Number(formData.budget) / (Number(formData.days) || 3)).toLocaleString()} per day
 {formData.days ? ` for ${formData.days} days` : " (set days next)"}
 </div>
 )}

 <div className="btn-row">
 <button className="btn btn-secondary" onClick={() => setStep(selectedImage ? 0 : 1)}>Back</button>
 <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!formData.budget}>Next</button>
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 3 – Dates + Vulnerable toggle
 ------------------------------------------------------------ */
 const renderStep3 = () => (
 <div className="step-box">
 <div className="step-icon-wrap" aria-label="Step 03">
 <span className="step-icon-top">STEP</span>
 <span className="step-icon-num">03</span>
 </div>
 <h2 className="step-title">When & How Long?</h2>
 <p className="step-subtitle">Pick your trip start date and total number of days.</p>

 <div className="input-group">
 <label className="input-label">Trip Start Date</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="start_date" type="date" min={todayDate}
 value={formData.start_date} onChange={handleChange} className="field-input" />
 </div>
 </div>

 <div className="input-group">
 <label className="input-label">Number of Days</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="days" type="number" placeholder="e.g. 5"
 value={formData.days} onChange={handleChange} className="field-input" min="1" max="30" />
 </div>
 </div>

 <div
 className={`toggle-card ${formData.has_vulnerable ? "active" : ""}`}
 onClick={() => setFormData({ ...formData, has_vulnerable: !formData.has_vulnerable })}
 >
 <div className="toggle-card-info">
 <div className="toggle-card-emoji">Info</div>
 <div className="toggle-card-text">
 <h4>Seniors or Kids in the Group?</h4>
 <p>We'll flag difficult terrain and recommend accessible routes</p>
 </div>
 </div>
 <div className="toggle-pill" />
 </div>

 <div className="btn-row">
 <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
 <button
 className="btn btn-primary"
 onClick={() => setStep(4)}
 disabled={!formData.start_date || !formData.days}
 >
 Next
 </button>
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 4 – Group & Transport
 ------------------------------------------------------------ */
 const renderStep4 = () => (
 <div className="step-box">
 <div className="step-icon-wrap" aria-label="Step 04">
 <span className="step-icon-top">STEP</span>
 <span className="step-icon-num">04</span>
 </div>
 <h2 className="step-title">Group & Transport</h2>
 <p className="step-subtitle">How many travellers, and how will you get around Sri Lanka?</p>

 <div className="input-group">
 <label className="input-label">Number of Travellers</label>
 <div className="input-icon-wrap">
 <span className="input-icon"></span>
 <input name="members" type="number"
 value={formData.members} onChange={handleChange} className="field-input" min="1" max="20" />
 </div>
 </div>

 <div className="input-group">
 <label className="input-label">Mode of Transport</label>
 <div className="transport-grid">
 {TRANSPORT_OPTIONS.map(opt => (
 <button
 key={opt.value}
 type="button"
 className={`transport-card ${formData.transport === opt.value ? "selected" : ""}`}
 onClick={() => setFormData({ ...formData, transport: opt.value })}
 >
 <span className="t-icon">{opt.icon}</span>
 <div className="t-name">{opt.name}</div>
 <div className="t-note">{opt.note}</div>
 </button>
 ))}
 </div>
 </div>

 <div className="btn-row">
 <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
 <button
 className="btn btn-generate"
 onClick={() => handleSubmit(false)}
 disabled={loading}
 >
 {loading
 ? <><span className="btn-spinner"></span> Generating…</>
 : "Generate My Trip"}
 </button>
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 5 – Generating / Loading
 ------------------------------------------------------------ */
 const renderGenerating = () => (
 <div className="step-box generating-overlay">
 <div className="lottie-placeholder">Loading</div>
 <h2 className="generating-title">Crafting Your Adventure…</h2>
 <p className="generating-sub">
 Our AI is analysing hundreds of Sri Lankan destinations, hotels, and routes
 to build your perfect {formData.days}-day itinerary.
 </p>
 <div className="gen-dots">
 <div className="gen-dot" />
 <div className="gen-dot" />
 <div className="gen-dot" />
 </div>
 </div>
 );

 /* ------------------------------------------------------------
 STEP 6 – Itinerary Result
 ------------------------------------------------------------ */
 const renderItinerary = () => {
 if (!plan) return null;
 return (
 <div className="itinerary-wrapper">
 <div className="itinerary-banner">
 <h1 className="itinerary-trip-title">{plan.tripTitle || "Sri Lanka Adventure"}</h1>
 <div className="cost-badges">
        {/* ── Total cost in selected currency ── */}
        <div className="cost-badge spent">
          <span className="cost-badge-label">Total Trip Cost</span>
          <span className="cost-badge-value">{formatPrice(plan.totalEstimatedCost)}</span>
          {selectedCurrency !== "LKR" && (
            <span className="cost-badge-lkr">≈ LKR {Number(plan.totalEstimatedCost).toLocaleString()}</span>
          )}
        </div>
        {/* ── Remaining budget in selected currency ── */}
        {plan.remainingBudget != null && Number(plan.remainingBudget) >= 0 && (
          <div className="cost-badge remain">
            <span className="cost-badge-label">Remaining Budget</span>
            <span className="cost-badge-value">{formatPrice(plan.remainingBudget)}</span>
            {selectedCurrency !== "LKR" && (
              <span className="cost-badge-lkr">≈ LKR {Number(plan.remainingBudget).toLocaleString()}</span>
            )}
          </div>
        )}
        {/* ── Currency badge when non-LKR ── */}
        {selectedCurrency !== "LKR" && (
          <div className="cost-badge currency-note">
            <span className="cost-badge-label">Currency</span>
            <span className="cost-badge-value">{selectedCurrency}</span>
            <span className="cost-badge-lkr">{loadingRates ? "loading rates..." : "live rate applied"}</span>
          </div>
        )}
      </div>
 </div>

 {plan.fullStory && (
 <div className="expert-card">
 <div className="expert-avatar">Guide</div>
 <div className="expert-body">
 <div className="expert-label">Travel Expert's Note</div>
 <div className="expert-name">CeylonRoam AI · Your Personal Guide</div>
 <div className="expert-text markdown-body">
 <ReactMarkdown 
 remarkPlugins={[remarkGfm]}
 components={{
 // Intercept <a> tags (links) from AI output and render them as custom elements
 a: ({ node, ...props }) => {
 // Otherwise, render as a standard link
 if (props.href && props.href.includes("google.com/maps")) {
 return (
 <a 
 href={props.href} 
 target="_blank" 
 rel="noopener noreferrer" 
 className="map-btn"
 style={{ 
 display: "inline-flex", 
 marginTop: "8px", 
 marginBottom: "8px",
 textDecoration: "none" 
 }}
 >
 View Route Map
 </a>
 );
 }
 // Otherwise, render as a standard link
 return (
 <a 
 {...props} 
 target="_blank" 
 rel="noopener noreferrer" 
 style={{ color: "var(--ocean-mid)", textDecoration: "underline" }} 
 />
 );
 }
 }}
>
 {/* Strip 'Map Link:' text from AI output and show only the Button */}
 {plan.fullStory?.replace(/Map Link:\s*/gi, '')}
</ReactMarkdown>
 </div>
 </div>
 </div>
 )}

 <div className="timeline-container">
 {plan.itinerary.map((day, i) => (
 <DayCard key={i} day={day} />
 ))}
 </div>

 <div className="itinerary-actions">
 <button
 className="btn btn-secondary"
 style={{ flex: 1 }}
 onClick={() => { setStep(0); setPlan(null); setSelectedImage(null); setSelectedImageURL(null); }}
 >
 Start Over
 </button>
 <button className="btn btn-save" onClick={handleSaveTrip} disabled={saveLoading}>
 {saveLoading ? <><span className="btn-spinner" />Saving…</> : "Save to My Trips"}
 </button>
 </div>
 </div>
 );
 };

 /* ------------------------------------------------------------
 FLOATING CHATBOT
 ------------------------------------------------------------ */
 const renderChatbot = () => (
 <>
 {(chatOpen || chatClosing) && (
 <div className={`chat-widget ${chatClosing ? "closing" : ""}`}>
 <div className="chat-header">
 <div className="chat-header-avatar">AI</div>
 <div className="chat-header-info">
 <h4>CeylonRoam AI</h4>
 <p>Your Sri Lanka Travel Assistant</p>
 </div>
 
 {/* Added Clear Chat button */}
 <button 
 onClick={() => {
 toast(
 (t) => (
 <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
 Clear chat history?
 <button
 onClick={() => {
 setMessages(DEFAULT_GREETING);
 localStorage.removeItem(`roamy_chat_${user?._id || user?.id || "guest"}`);
 toast.dismiss(t.id);
 toast.success("Chat cleared!");
 }}
 style={{ marginLeft: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
 >
 Clear
 </button>
 <button
 onClick={() => toast.dismiss(t.id)}
 style={{ background: "rgba(255,255,255,0.1)", color: "#E7F9FC", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
 >
 Cancel
 </button>
 </span>
 ),
 { duration: 6000 }
 );
 }} 
 style={{ marginLeft: "auto", background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
 title="Clear Chat"
 >
 AI
 </button>
 <div className="chat-online-dot" style={{ marginLeft: "10px" }} />
 </div>

 <div className="chat-messages">
 {messages.map((msg, i) => (
 <div key={i} className={`msg-bubble ${msg.from} markdown-body`}>
 <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
 </div>
 ))}
 {isChatLoading && (
 <div className="typing-indicator">
 <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 <div className="quick-replies">
 {["Best time to visit", "Train routes", "Food tips", "Visa info"].map(qr => (
 <button key={qr} className="quick-reply-btn" onClick={() => handleQuickReply(qr)}>{qr}</button>
 ))}
 </div>

 <div className="chat-input-row">
 <input
 className="chat-text-input"
 placeholder="Ask me anything…"
 value={chatInput}
 onChange={e => setChatInput(e.target.value)}
 onKeyDown={e => e.key === "Enter" && handleSendMessage()}
 />
 <button
 className="chat-send-btn"
 onClick={handleSendMessage}
 disabled={!chatInput.trim() || isChatLoading}
 aria-label="Send message"
 >
 <LuSend size={18} />
 </button>
 </div>
 </div>
 )}

 <button
 className={`chat-fab ${chatOpen ? "open" : ""}`}
 onClick={handleChatToggle}
 aria-label="Chat with AI assistant"
 >
 {chatOpen ? "x" : "AI"}
 {!chatOpen && <span className="chat-badge">AI</span>}
 </button>
 </>
 );

 /* ------------------------------------------------------------
 PROGRESS BAR DOTS (Steps 1-4 only)
 ------------------------------------------------------------ */
 const progressPct = (step >= 1 && step <= 4) ? ((step - 1) / 3) * 100 : 0;

 const renderProgressBar = () => (
 <>
 <div className="progress-track">
 <div className="progress-fill" style={{ width: `${progressPct}%` }} />
 </div>
 <div className="steps-dots">
 {[1, 2, 3, 4].map(s => (
 <div key={s} className={`step-dot ${step === s ? "active" : step > s ? "done" : ""}`} />
 ))}
 </div>
 </>
 );

 /* ------------------------------------------------------------
 MAIN RETURN — crystal-clear step routing
 ------------------------------------------------------------ */
 return (
 <div className={`planner-hero ${step === 0 ? "step-landing" : "step-dashboard"}`}>
 {/* Decorative background blobs */}
 <div className="blob blob-1" />
 <div className="blob blob-2" />
 {step === 0 && <div className="blob blob-3" />}

 {/* Modals — always rendered on top when active */}
 {renderDetectionPopup()}
 {renderBudgetPopup()}

 {/* -- STEP 0: Landing Hero -- */}
 {step === 0 && renderLanding()}

 {/* -- STEPS 1-4: Wizard -- */}
 {step >= 1 && step <= 4 && (
 <>
 <div className="dashboard-header">
 <div className="dash-logo">CeylonRoam</div>
 <div className="dash-step-label">Step {step} of 4</div>
 </div>

 {renderProgressBar()}

 <div className="wizard-card">
 {step === 1 && renderStep1()}
 {step === 2 && renderStep2()}
 {step === 3 && renderStep3()}
 {step === 4 && renderStep4()}
 </div>
 </>
 )}

 {/* -- STEP 5: Generating (Loading) -- */}
 {step === 5 && (
 <div className="wizard-card">
 {renderGenerating()}
 </div>
 )}

 {/* -- STEP 6: Itinerary Result -- */}
 {step === 6 && renderItinerary()}

 {/* -- Floating Chatbot (always visible) -- */}
 {renderChatbot()}
 </div>
 );
}

/* ----------------------------------------------------------------
 DAY CARD – collapsible sub-component
 ---------------------------------------------------------------- */
function DayCard({ day }) {
 const [expanded, setExpanded] = useState(true);

 const holidayWarn = day.warnings?.includes("Holiday")
 ? day.warnings.split("Weather:")[0].trim() : "";
 const weatherWarn = day.warnings?.includes("Weather:")
 ? "Weather: " + day.warnings.split("Weather:")[1] : "";

 const activities = Array.isArray(day.activities)
 ? day.activities.map(act => {
 if (typeof act === "string") {
            // Primary: standard format "Name (Distance: Xkm, Time: Yhrs)[AccessWarn]"
            const m = act.match(/^(.+?)\s*\(Distance:\s*([\d.]+)km,\s*Time:\s*([\d.]+)hrs\)(.*)\u0024/);
            if (m) return { name: m[1].trim(), dist: m[2], time: m[3], accessWarn: m[4].trim() };
            // Fallback: legacy "undefined" format - extract name and time only
            const m2 = act.match(/^(.+?)\s*\(Distance:\s*(?:undefined|N\/A)[^,]*,\s*Time:\s*([\d.]+)hrs\)(.*)\u0024/);
            if (m2) return { name: m2[1].trim(), dist: null, time: m2[2], accessWarn: m2[3].trim() };
            return { name: act };
 }
 return {
 name: act.Name || act.name,
 dist: act.Distance_to_Hotel,
 time: act.Visit_Time,
 accessWarn: act.Access_Warning || act.access_warning,
 };
 })
 : [];

 return (
 <div className="day-card">
 <div className="day-header" onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer" }}>
 <div>
 <div className="day-num">Day {day.day}</div>
 <div className="day-date">{day.date}</div>
 </div>
 <div className="day-region">{day.destination}</div>
 <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", marginLeft: "auto" }}>
 {expanded ? "-" : "+"}
 </span>
 </div>

 {expanded && (
 <div className="day-body">
 {holidayWarn && <div className="warn-banner holiday">{holidayWarn}</div>}
 {weatherWarn && <div className="warn-banner weather">{weatherWarn}</div>}

 {activities.length > 0 && (
 <>
 <div className="places-section-title">Today's Stops</div>
 {activities.map((act, idx) => (
 <div className="place-item" key={idx}>
 <div className="place-dot" />
 <div>
 <div className="place-name">{act.name}</div>
 {(act.dist || act.time) && (
 <div className="place-meta">
 {act.dist && `${act.dist} km`}
 {act.dist && act.time && " · "}
 {act.time && `${act.time} hrs`}
 </div>
 )}
 {act.accessWarn && <div className="place-access-warn">{act.accessWarn}</div>}
 </div>
 </div>
 ))}
 </>
 )}

 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
 {day.accommodation && <div className="hotel-chip">{day.accommodation}</div>}
 {day.mapUrl && (
 <a href={day.mapUrl} target="_blank" rel="noopener noreferrer" className="map-btn">
 AI Route Map
 </a>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
