import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/auth.css";
import "./styles/register-biz.css"; 

import { 
 LuTriangleAlert, LuKey, LuTag, LuGlobe, 
 LuUser, LuMail, LuCalendar, LuLock, 
 LuHotel, LuCompass, LuCar, LuImage, LuClipboardCheck, 
 LuGraduationCap, LuFileText, LuMapPin, LuSparkles, 
 LuBinoculars, LuWaves, LuShieldCheck, LuLeaf, LuSend, LuWrench, LuMap,LuHandshake,LuPhone,LuLandmark,LuHash 
} from "react-icons/lu";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({
 iconUrl: icon, shadowUrl: iconShadow,
 iconSize: [25, 41], iconAnchor: [12, 41],
});

/* ════════════ CONSTANTS ════════════════════════════════════ */
const COUNTRY_CURRENCIES = {
 "Sri Lanka": "LKR",
 "United States":"USD",
 "United Kingdom":"GBP",
 "Australia": "AUD",
 "Canada": "CAD",
 "Europe": "EUR",
 "India": "INR",
};

const AMENITIES = ["Free WiFi", "A/C", "Swimming Pool", "Free Parking", "Restaurant/Bar", "Pet Friendly"];
const BIKE_TYPES = ["Bike", "Tuk Tuk"];

const LOGIN_CAROUSEL_IMAGES = [
 "/images/login-slide-1.jpeg",
 "/images/login-slide-2.jpeg",
 "/images/login-slide-3.jpeg",
 "/images/login-slide-4.jpeg",
 "/images/login-slide-5.jpeg",
 "/images/login-slide-6.jpeg",
];

/* ════════════ MAP HELPER ═══════════════════════════════════ */
function LocationPicker({ lat, lng, onChange }) {
 useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
 return <Marker position={[lat, lng]} />;
}

/* ════════════ MAIN COMPONENT ══════════════════════════════ */
export default function Register() {
 const navigate = useNavigate();
 const { login } = useContext(AuthContext);

 /* ── Base form state ── */
 const [form, setForm] = useState({
 username: "", email: "", country: "", dateOfBirth: "", currency: "LKR", password: "", confirmPassword: "",
 accountType: "user",
 });
 const [passwordError, setPasswordError] = useState("");
 const [submitting, setSubmitting] = useState(false);

 /* ── Business extension state ── */
 const [category, setCategory] = useState("");
 const [biz, setBiz] = useState({
 // Hotel
 hotelName: "", ownerName: "", managerName: "", propertyType: "Hotel",
 description: "", address: "", city: "", district: "", phone: "",
 latitude: 7.8731, longitude: 80.7718, amenities: [],
 brn: "", bankAccountName: "", bankName: "", bankBranch: "", bankAccountNumber: "",
 // Guide
 fullName: "", dateOfBirth: "", baseCity: "", operatingRegions: "",
 languages: "", guideType: "National Guide", experience: "",
 bio: "", nicNumber: "", tourismBoardReg: "",
 vehicleType: "", vehicleModel: "", vehicleYear: "", vehicleAC: "No",
 // Transport
 serviceType: "Hire", driverName: "",
 vehicleMake: "", yearOfManufacture: "", transmission: "Auto",
 passengerCapacity: "", luggageCapacity: "",
 airConditioned: "No", airportTransfer: "No", driverNIC: "",
 });

 /* ── File state ── */
 const [files, setFiles] = useState({
 coverImage: null, gallery: [],
 profilePicture: null, licenseScan: null, vehiclePhotos: [],
 driverProfilePicture: null, licensePlatePhoto: null,
 drivingLicense: null, revenueLicense: null,
 driverNICFront: null, driverNICBack: null,
 exteriorPhotos: [], interiorPhotos: [],
 });

 /* ═══════════ HANDLERS ══════════════════════════════════════ */
 const handleChange = e => {
 const { name, value } = e.target;
 if (name === "country") {
 setForm(p => ({ ...p, country: value, currency: COUNTRY_CURRENCIES[value] || "LKR" }));
 } else {
 setForm(p => ({ ...p, [name]: value }));
 }
 if (name === "password") {
 if (!value) setPasswordError("");
 else if (value.length < 12) setPasswordError("Must be at least 12 characters.");
 else if (!/[A-Z]/.test(value)) setPasswordError("Must include an uppercase letter.");
 else if (!/[a-z]/.test(value)) setPasswordError("Must include a lowercase letter.");
 else if (!/\d/.test(value)) setPasswordError("Must include a number.");
 else if (!/[^A-Za-z0-9]/.test(value)) setPasswordError("Must include a special symbol.");
 else setPasswordError("");
 }
 };

 const handleBizChange = e => {
 const { name, value } = e.target;
 setBiz(p => ({ ...p, [name]: value }));
 };

 const handleAmenity = label =>
 setBiz(p => ({
 ...p,
 amenities: p.amenities.includes(label)
 ? p.amenities.filter(a => a !== label)
 : [...p.amenities, label],
 }));

 const handleFile = (name, val) => setFiles(p => ({ ...p, [name]: val }));
 const handleMapClick = (lat, lng) => setBiz(p => ({ ...p, latitude: lat, longitude: lng }));


 /* ═══════════ SUBMIT — DIRECT REGISTRATION ═══════════════════ */
 const handleSubmit = async e => {
 e.preventDefault();
 if (passwordError || !form.password) {
 toast.error("Please ensure your password meets all requirements.", {
 icon: <LuTriangleAlert size={18} style={{ color: "#ef4444" }} />
 });
 return;
 }
 if (form.password !== form.confirmPassword) {
 toast.error("Passwords do not match. Please re-enter.", {
 icon: <LuKey size={18} style={{ color: "#ef4444" }} />
 });
 return;
 }
 if (form.accountType === "business" && !category) {
 toast.error("Please select a partner category.", {
 icon: <LuTag size={18} style={{ color: "#ef4444" }} />
 });
 return;
 }

 setSubmitting(true);
 const toastId = toast.loading("Creating your account…");
 try {
 let data;

 if (form.accountType !== "business") {
 /* Traveller — plain JSON */
 const response = await API.post("/auth/register", form);
 data = response.data;
 } else {
 /* Business — FormData with files (Multer on server handles uploads) */
 if (form.country !== "Sri Lanka") {
 toast.error("Business registration is only available for Sri Lanka-based users.", { 
 id: toastId,
 icon: <LuGlobe size={18} style={{ color: "#ef4444" }} />
 });
 setSubmitting(false);
 return;
 }
 const fd = new FormData();
 Object.entries(form).forEach(([k, v]) => fd.append(k, v));
 fd.append("category", category);
 Object.entries(biz).forEach(([k, v]) => {
 if (k === "amenities") fd.append("amenities", JSON.stringify(v));
 else if (!["bankAccountName","bankName","bankBranch","bankAccountNumber"].includes(k)) fd.append(k, v);
 });
 fd.append("bankDetails", JSON.stringify({
 accountName: biz.bankAccountName, bank: biz.bankName,
 branch: biz.bankBranch, accountNumber: biz.bankAccountNumber,
 }));
 ["coverImage","profilePicture","licenseScan","driverProfilePicture",
 "licensePlatePhoto","drivingLicense","revenueLicense","driverNICFront","driverNICBack",
 ].forEach(f => { if (files[f]) fd.append(f, files[f]); });
 ["gallery","vehiclePhotos","exteriorPhotos","interiorPhotos"].forEach(field =>
 (files[field] || []).forEach(file => fd.append(field, file))
 );
 const response = await API.post("/auth/register", fd, { headers: { "Content-Type": "multipart/form-data" } });
 data = response.data;
 }

 toast.success(
 form.accountType === "business"
 ? "Partner registration submitted! Our team will review your application."
 : "Account created successfully! Welcome to CeylonRoam.",
 { id: toastId, duration: 5000 }
 );
 login(data);
 navigate("/");
 } catch (err) {
 toast.error(err.response?.data?.message || err.message, { id: toastId });
 } finally {
 setSubmitting(false);
 }
 };

 /* ─────────── Helpers ─────────────────────────────────────── */
 const isBusiness = form.accountType === "business" && form.country === "Sri Lanka";
 const isNonSLBiz = form.accountType === "business" && form.country && form.country !== "Sri Lanka";
 const isBikeType = BIKE_TYPES.includes(biz.vehicleType);

 /* ═══════════ HOTEL FORM ════════════════════════════════════ */
 const renderHotel = () => (
 <>
 <BizSection title="Basic Information" icon={<LuHotel size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Hotel Name *" icon={<LuHotel size={18}/>}><input name="hotelName" value={biz.hotelName} onChange={handleBizChange} required /></BizField>
 <BizField label="Owner Name *" icon={<LuUser size={18}/>}><input name="ownerName" value={biz.ownerName} onChange={handleBizChange} required /></BizField>
 <BizField label="Manager Name" icon={<LuUser size={18}/>}><input name="managerName" value={biz.managerName} onChange={handleBizChange} /></BizField>
 <BizField label="Property Type *" icon={<LuHotel size={18}/>}>
 <select name="propertyType" value={biz.propertyType} onChange={handleBizChange}>
 {["Hotel","Villa","Resort","Cabana"].map(v => <option key={v}>{v}</option>)}
 </select>
 </BizField>
 </div>
 <BizField label="Description *" icon={<LuFileText size={18}/>}><textarea name="description" value={biz.description} onChange={handleBizChange} rows={3} required /></BizField>
 </BizSection>

 <BizSection title="Location & Contact" icon={<LuMapPin size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Full Address *" icon={<LuMapPin size={18}/>}><input name="address" value={biz.address} onChange={handleBizChange} required /></BizField>
 <BizField label="City *" icon={<LuMapPin size={18}/>}><input name="city" value={biz.city} onChange={handleBizChange} required /></BizField>
 <BizField label="District *" icon={<LuMapPin size={18}/>}><input name="district" value={biz.district} onChange={handleBizChange} required /></BizField>
 <BizField label="Phone *" icon={<LuPhone size={18}/>}><input name="phone" value={biz.phone} onChange={handleBizChange} required /></BizField>
 </div>
 <BizField label="Pick on Map" icon={<LuFileText size={18}/>}>
 <MapContainer center={[biz.latitude, biz.longitude]} zoom={7} className="rbiz-map">
 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 <LocationPicker lat={biz.latitude} lng={biz.longitude} onChange={handleMapClick} />
 </MapContainer>
 <div className="rbiz-coords">LAT {biz.latitude.toFixed(4)} · LNG {biz.longitude.toFixed(4)}</div>
 </BizField>
 </BizSection>

 <BizSection title="Amenities" icon={<LuSparkles size={20}/>}>
 <div className="rbiz-checkbox-grid">
 {AMENITIES.map(a => (
 <label key={a} className="rbiz-check-pill">
 <input type="checkbox" checked={biz.amenities.includes(a)} onChange={() => handleAmenity(a)} /> {a}
 </label>
 ))}
 </div>
 </BizSection>

 <BizSection title="Media Uploads" icon={<LuImage size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Cover Image *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("coverImage", e.target.files[0])} required /></BizField>
 <BizField label="Gallery (max 5)" icon={<LuImage size={18}/>}><input type="file" accept="image/*" multiple onChange={e => handleFile("gallery", Array.from(e.target.files).slice(0,5))} /></BizField>
 </div>
 </BizSection>

 <BizSection title="Legal & Payouts" icon={<LuClipboardCheck size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Business Reg. No. (BRN) *" icon={<LuFileText size={18}/>}><input name="brn" value={biz.brn} onChange={handleBizChange} required /></BizField>
 <BizField label="Account Holder Name *" icon={<LuUser size={18}/>}><input name="bankAccountName" value={biz.bankAccountName} onChange={handleBizChange} required /></BizField>
 <BizField label="Bank *" icon={<LuLandmark size={18}/>}><input name="bankName" value={biz.bankName} onChange={handleBizChange} required /></BizField>
 <BizField label="Branch *" icon={<LuMapPin size={18}/>}><input name="bankBranch" value={biz.bankBranch} onChange={handleBizChange} required /></BizField>
 <BizField label="Account Number *" icon={<LuHash size={18}/>}><input name="bankAccountNumber" value={biz.bankAccountNumber} onChange={handleBizChange} required /></BizField>
 </div>
 </BizSection>
 </>
 );

 /* ═══════════ GUIDE FORM ════════════════════════════════════ */
 const renderGuide = () => (
 <>
 <BizSection title="Basic Info" icon={<LuUser size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Full Name *" icon={<LuUser size={18}/>}><input name="fullName" value={biz.fullName} onChange={handleBizChange} required /></BizField>
 <BizField label="Profile Picture *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("profilePicture", e.target.files[0])} required /></BizField>
 </div>
 </BizSection>

 <BizSection title="Location & Coverage" icon={<LuMapPin size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Base City *" icon={<LuMapPin size={18}/>}><input name="baseCity" value={biz.baseCity} onChange={handleBizChange} required /></BizField>
 <BizField label="Operating Regions" icon={<LuMap size={18}/>}><input name="operatingRegions" value={biz.operatingRegions} onChange={handleBizChange} placeholder="e.g. Cultural Triangle, South Coast" /></BizField>
 </div>
 </BizSection>

 <BizSection title="Skills & Experience" icon={<LuGraduationCap size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Languages *" icon={<LuGlobe size={18}/>}><input name="languages" value={biz.languages} onChange={handleBizChange} placeholder="e.g. English, Sinhala" required /></BizField>
 <BizField label="Guide Type *" icon={<LuUser size={18}/>}>
 <select name="guideType" value={biz.guideType} onChange={handleBizChange}>
 {["National Guide","Chauffeur Guide","Adventure/Trekking Guide"].map(v => <option key={v}>{v}</option>)}
 </select>
 </BizField>
 <BizField label="Experience (years) *" icon={<LuGraduationCap size={18}/>}><input type="number" name="experience" value={biz.experience} onChange={handleBizChange} min={0} required /></BizField>
 </div>
 <BizField label="Bio / About Me *" icon={<LuFileText size={18}/>}><textarea name="bio" value={biz.bio} onChange={handleBizChange} rows={3} required /></BizField>
 </BizSection>

 {biz.guideType === "Chauffeur Guide" && (
 <BizSection title="Vehicle (Chauffeur)" icon={<LuCar size={20}/>} conditional>
 <div className="rbiz-two-col">
 <BizField label="Vehicle Type *" icon={<LuCar size={18}/>}><input name="vehicleType" value={biz.vehicleType} onChange={handleBizChange} placeholder="e.g. Sedan, SUV" required /></BizField>
 <BizField label="Model & Year *" icon={<LuCar size={18}/>}><input name="vehicleModel" value={biz.vehicleModel} onChange={handleBizChange} placeholder="e.g. Toyota Corolla 2020" required /></BizField>
 <BizField label="Air Conditioned?" icon={<LuLeaf size={18}/>}>
 <select name="vehicleAC" value={biz.vehicleAC} onChange={handleBizChange}>
 <option>Yes</option><option>No</option>
 </select>
 </BizField>
 <BizField label="Vehicle Photos (max 5)" icon={<LuImage size={18}/>}><input type="file" accept="image/*" multiple onChange={e => handleFile("vehiclePhotos", Array.from(e.target.files).slice(0,5))} /></BizField>
 </div>
 </BizSection>
 )}

 <BizSection title="Legal Documents" icon={<LuFileText size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="NIC Number *" icon={<LuFileText size={18}/>}><input name="nicNumber" value={biz.nicNumber} onChange={handleBizChange} required /></BizField>
 <BizField label="Tourism Board Reg. *" icon={<LuFileText size={18}/>}><input name="tourismBoardReg" value={biz.tourismBoardReg} onChange={handleBizChange} required /></BizField>
 <BizField label="License Scan (PDF/Image) *" icon={<LuFileText size={18}/>}><input type="file" accept="image/*,.pdf" onChange={e => handleFile("licenseScan", e.target.files[0])} required /></BizField>
 </div>
 </BizSection>
 </>
 );

 /* ═══════════ TRANSPORT FORM ════════════════════════════════ */
 const renderTransport = () => (
 <>
 <BizSection title="Service Type" icon={<LuCar size={20}/>}>
 <div className="rbiz-radio-row">
 {["Hire","Rent"].map(v => (
 <label key={v} className={`rbiz-radio-pill ${biz.serviceType === v ? "active" : ""}`}>
 <input type="radio" name="serviceType" value={v} checked={biz.serviceType === v} onChange={handleBizChange} />
 {v === "Hire" ? " Hire (Driver Included)" : " Rent (Self-Drive)"}
 </label>
 ))}
 </div>
 </BizSection>

 <BizSection title="Owner & Driver Info" icon={<LuUser size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Owner Name *" icon={<LuUser size={18}/>}><input name="ownerName" value={biz.ownerName} onChange={handleBizChange} required /></BizField>
 <BizField label="Driver Name *" icon={<LuUser size={18}/>}><input name="driverName" value={biz.driverName} onChange={handleBizChange} required /></BizField>
 <BizField label="Phone *" icon={<LuPhone size={18}/>}><input name="phone" value={biz.phone} onChange={handleBizChange} required /></BizField>
 <BizField label="Driver Photo *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("driverProfilePicture", e.target.files[0])} required /></BizField>
 </div>
 </BizSection>

 <BizSection title="Vehicle Specs" icon={<LuWrench size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Vehicle Type *" icon={<LuCar size={18}/>}>
 <select name="vehicleType" value={biz.vehicleType} onChange={handleBizChange} required>
 <option value="">Select type</option>
 {["Bike","Tuk Tuk","Mini Car","Sedan/Cab","Passenger Van","SUV","Bus"].map(v => <option key={v}>{v}</option>)}
 </select>
 </BizField>
 <BizField label="Make *" icon={<LuCar size={18}/>}><input name="vehicleMake" value={biz.vehicleMake} onChange={handleBizChange} placeholder="e.g. Toyota" required /></BizField>
 <BizField label="Model *" icon={<LuCar size={18}/>}><input name="vehicleModel" value={biz.vehicleModel} onChange={handleBizChange} placeholder="e.g. HiAce" required /></BizField>
 <BizField label="Year *" icon={<LuCalendar size={18}/>}><input type="number" name="yearOfManufacture" value={biz.yearOfManufacture} onChange={handleBizChange} placeholder="2018" required /></BizField>
 {!isBikeType && (
 <>
 <BizField label="Passenger Capacity" icon={<LuUser size={18}/>}><input type="number" name="passengerCapacity" value={biz.passengerCapacity} onChange={handleBizChange} min={1} /></BizField>
 <BizField label="Luggage Capacity" icon={<LuCar size={18}/>}><input name="luggageCapacity" value={biz.luggageCapacity} onChange={handleBizChange} placeholder="e.g. 3 large bags" /></BizField>
 <BizField label="Air Conditioned?" icon={<LuLeaf size={18}/>}>
 <select name="airConditioned" value={biz.airConditioned} onChange={handleBizChange}>
 <option>Yes</option><option>No</option>
 </select>
 </BizField>
 </>
 )}
 {biz.serviceType === "Rent" && (
 <BizField label="Transmission *" icon={<LuWrench size={18}/>}>
 <select name="transmission" value={biz.transmission} onChange={handleBizChange}>
 <option>Auto</option><option>Manual</option>
 </select>
 </BizField>
 )}
 </div>
 </BizSection>

 <BizSection title="Service Area" icon={<LuMap size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Base City *" icon={<LuMapPin size={18}/>}><input name="baseCity" value={biz.baseCity} onChange={handleBizChange} required /></BizField>
 <BizField label="Airport Drops / Pickups?" icon={<LuMapPin size={18}/>}>
 <select name="airportTransfer" value={biz.airportTransfer} onChange={handleBizChange}>
 <option>Yes</option><option>No</option>
 </select>
 </BizField>
 </div>
 </BizSection>

 <BizSection title="Legal Documents" icon={<LuFileText size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Driver NIC Number *" icon={<LuFileText size={18}/>}><input name="driverNIC" value={biz.driverNIC} onChange={handleBizChange} required /></BizField>
 <BizField label="License Plate Photo *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("licensePlatePhoto", e.target.files[0])} required /></BizField>
 <BizField label="Driving License *" icon={<LuFileText size={18}/>}><input type="file" accept="image/*,.pdf" onChange={e => handleFile("drivingLicense", e.target.files[0])} required /></BizField>
 <BizField label="Revenue License / Insurance *" icon={<LuFileText size={18}/>}><input type="file" accept="image/*,.pdf" onChange={e => handleFile("revenueLicense", e.target.files[0])} required /></BizField>
 <BizField label="NIC Front *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("driverNICFront", e.target.files[0])} required /></BizField>
 <BizField label="NIC Back *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" onChange={e => handleFile("driverNICBack", e.target.files[0])} required /></BizField>
 </div>
 </BizSection>

 <BizSection title="Vehicle Photos" icon={<LuImage size={20}/>}>
 <div className="rbiz-two-col">
 <BizField label="Exterior Photos (max 5) *" icon={<LuImage size={18}/>}><input type="file" accept="image/*" multiple onChange={e => handleFile("exteriorPhotos", Array.from(e.target.files).slice(0,5))} required /></BizField>
 <BizField label="Interior Photos (max 5)" icon={<LuImage size={18}/>}><input type="file" accept="image/*" multiple onChange={e => handleFile("interiorPhotos", Array.from(e.target.files).slice(0,5))} /></BizField>
 </div>
 </BizSection>
 </>
 );

 /* ═══════════ RENDER ════════════════════════════════════════ */
 return (
 <div className="auth-page">

 {/* ══ LEFT — Visual Panel ══ */}
 <div className="auth-visual">
 {LOGIN_CAROUSEL_IMAGES.map((src, idx) => (
 <img
 key={src}
 className="auth-visual-img auth-visual-slide"
 src={src}
 alt={`Sri Lanka travel scene ${idx + 1}`}
 style={{ "--slide-index": idx }}
 />
 ))}
 <div className="auth-visual-overlay" />
 <div className="auth-visual-content">
 <Link to="/" className="auth-visual-logo">Ceylon<span>Roam.</span></Link>
 <div>
 <p className="auth-visual-quote">Start your<br /><em>Sri Lankan journey</em><br />today.</p>
 <div className="auth-visual-chips">
 <div className="auth-chip"><LuSparkles size={16} /> AI-Powered Plans</div>
 <div className="auth-chip"><LuBinoculars size={16} /> Wildlife Safaris</div>
 <div className="auth-chip"><LuWaves size={16} /> Beach Escapes</div>
 </div>
 </div>
 <div className="auth-visual-footer">
 <div className="auth-visual-avatar-row">
 {["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80",
 "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
 "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
 ].map((src, i) => (
 <div key={i} className="auth-visual-avatar"><img src={src} alt="traveller" /></div>
 ))}
 </div>
 <p className="auth-visual-footer-text">Free to join. No credit card needed.</p>
 </div>
 </div>
 </div>

 {/* ══ RIGHT — Form Panel ══ */}
 <div className="auth-form-panel">
 <div className="auth-form-box" style={{ maxWidth: isBusiness ? 640 : 440 }}>

 <Link to="/" className="auth-mobile-logo">Ceylon<span>Roam.</span></Link>

 {/* ══════ REGISTRATION FORM ══════ */}
 <div className="auth-heading">
 <p className="auth-eyebrow">Create your account</p>
 <h1 className="auth-h1">Join<br />CeylonRoam</h1>
 <p className="auth-sub">Free forever. AI itineraries, curated packages, and more.</p>
 </div>

 <form className="auth-form" onSubmit={handleSubmit}>

 {/* ── BASE FIELDS ── */}
 <div className="auth-field">
 <label className="auth-label">Username</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuUser size={18} /></span>
 <input className="auth-input" name="username" placeholder="e.g. amal_roams" onChange={handleChange} required />
 </div>
 </div>

 <div className="auth-field">
 <label className="auth-label">Email address</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuMail size={18} /></span>
 <input className="auth-input" name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
 </div>
 </div>

 <div className="auth-field">
 <label className="auth-label">Country</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuGlobe size={18} /></span>
 <select className="auth-input" name="country" value={form.country} onChange={handleChange} required>
 <option value="" disabled>Select your country</option>
 {Object.keys(COUNTRY_CURRENCIES).map(c => (
 <option key={c} value={c}>{c}</option>
 ))}
 <option value="Other">Other (Defaults to LKR)</option>
 </select>
 </div>
 </div>

 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
 <div className="auth-field">
 <label className="auth-label">Date of Birth</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuCalendar size={18} /></span>
 <input className="auth-input" name="dateOfBirth" type="date"
 max={new Date().toISOString().split("T")[0]}
 min="1900-01-01"
 onChange={handleChange} required />
 </div>
 </div></div>

 <div className="auth-field">
 <label className="auth-label">Password</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuLock size={18} /></span>
 <input className="auth-input" name="password" type="password" placeholder="Create a strong password" onChange={handleChange} required />
 </div>
 {passwordError && <p className="rbiz-pw-error"><LuTriangleAlert size={14} style={{ marginRight: '4px' }}/> {passwordError}</p>}
 </div>

 <div className="auth-field">
 <label className="auth-label">Confirm password</label>
 <div className="auth-input-wrap">
 <span className="auth-input-icon"><LuKey size={18} /></span>
 <input className="auth-input" name="confirmPassword" type="password" placeholder="Re-enter your password" onChange={handleChange} />
 </div>
 </div>

 {/* ── ACCOUNT TYPE ── */}
 <div className="auth-field">
 <label className="auth-label">Account type</label>
 <select className="auth-select" name="accountType" value={form.accountType} onChange={handleChange}>
 <option value="user">Traveller (Personal)</option>
 <option value="business" disabled={!!form.country && form.country !== "Sri Lanka"}>
 Business / Operator{form.country && form.country !== "Sri Lanka" ? " (Sri Lanka only)" : ""}
 </option>
 </select>
 </div>

 {/* ── Sri Lanka gate warning ── */}
 {isNonSLBiz && (
 <div className="rbiz-gate-warn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <LuGlobe size={18} />
 <div>
 Business registration is only available for users based in <strong>Sri Lanka</strong>.
 Please select "Traveller (Personal)" or change your country.
 </div>
 </div>
 )}

 {/* ══════════ BUSINESS EXTENSION ══════════ */}
 {isBusiness && (
 <div className="rbiz-extension">
 <div className="rbiz-extension-header">
 <span className="rbiz-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
 <LuHandshake size={14} /> Partner Programme
 </span>
 <p>Your account will be set to <strong>Pending</strong> while our team reviews your application.</p>
 </div>

 {/* Category selector */}
 <div className="rbiz-cat-grid">
 {[
 { id:"Hotel", icon: <LuHotel size={24} />, label:"Hotel / Accommodation" },
 { id:"Guide", icon: <LuCompass size={24} />, label:"Tour Guide" },
 { id:"Transport", icon: <LuCar size={24} />, label:"Transport Service" },
 ].map(c => (
 <button key={c.id} type="button"
 className={`rbiz-cat-btn ${category === c.id ? "active" : ""}`}
 onClick={() => setCategory(c.id)}>
 <span className="rbiz-cat-icon">{c.icon}</span>
 {c.label}
 </button>
 ))}
 </div>

 {!category && (
 <p className="rbiz-select-hint"> Select a partner category above to continue.</p>
 )}

 {category === "Hotel" && renderHotel()}
 {category === "Guide" && renderGuide()}
 {category === "Transport" && renderTransport()}
 </div>
 )}

 {/* ── SUBMIT ── */}
 <button type="submit" className="auth-submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
 {submitting
 ? <><span className="rbiz-spinner" /> Submitting…</>
 : form.accountType === "business"
 ? <><LuSend size={18} /> Submit {category || "Business"} Partner Registration</>
 : "Create My Account →"}
 </button>

 </form>

 <div className="auth-divider">or</div>
 <p className="auth-bottom-text">
 Already have an account? <Link to="/login">Sign in</Link>
 </p>
 <div className="auth-trust">
 <div className="auth-trust-item"><LuLock size={16} /> Secure &amp; encrypted</div>
 <div className="auth-trust-item"><LuShieldCheck size={16} /> Privacy first</div>
 <div className="auth-trust-item"><LuLeaf size={16} /> No spam</div>
 </div>

 </div>
 </div>
 </div>
 );
}

/* ── Layout micro-components ─────────────────────────────── */
function BizSection({ title, icon, children, conditional }) {
 return (
 <div className={`rbiz-section ${conditional ? "rbiz-conditional" : ""}`}>
 <h4 className="rbiz-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 {icon && <span style={{ color: 'var(--ink-60)', display: 'flex', alignItems: 'center' }}>{icon}</span>}
 {title}
 </h4>
 {children}
 </div>
 );
}

function BizField({ label, icon, children }) {
 return (
 <div className="rbiz-field">
 <label className="rbiz-label">{label}</label>
 <div className="rbiz-input-wrap">
 {icon && <span className="rbiz-input-icon">{icon}</span>}
 {children}
 </div>
 </div>
 );
}