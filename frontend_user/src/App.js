import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import "./App.css";
import NaviBar from "./components/NaviBar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import BusinessTools from "./pages/BusinessTools";
import AddPackage from "./pages/AddPackage";
import AddService from "./pages/AddService";
import AddHotelRoom from "./pages/AddHotelRoom";
import ManagePackages from "./pages/ManagePackages";
import ExplorePage from "./pages/ExplorePage";
import ViewPackage from "./pages/ViewPackage";
import BusinessPlace from "./pages/BusinessPlace";
import TripPlanner from "./pages/TripPlanner";
import Profile from "./pages/UserProfile";
import MyTripPlans from "./pages/MyTripPlans";
import PaymentPage from "./pages/PaymentPage";
import MyBookings from "./pages/MyBookings";
import SellerBookings from "./pages/SellerBookings";
import RequestBusiness from "./pages/RequestBusiness";
import EditPassword from "./pages/EditPassword";
import Settings from "./pages/Settings";
import SavedPackage from "./pages/SavedPackages";
import TermsOfService from "./pages/TermsofService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CustomerCenter from "./pages/CustomerCenter";
import BookServices from "./pages/BookServices";
import BusinessBookings from "./pages/BusinessBookings";
import ProviderProfile from "./pages/ProviderProfile";
import "./pages/styles/glassmorphism-pages.css";




function AnimatedRoutes() {
 const location = useLocation();
 const isCardToDetail = location.pathname.startsWith("/viewpackage/") && location.state?.transition === "card-to-detail";
 const routeTransitionClass = isCardToDetail
 ? "page-transition-shell route-enter-from-card"
 : "page-transition-shell";

 return (
 <main className={routeTransitionClass} key={location.pathname}>
 <Routes location={location}>
 <Route path="/" element={<Home/>}/>
 <Route path="/register" element={<Register/>}/>
 <Route path="/login" element={<Login/>}/>
 <Route path="/forgot-password" element={<ForgotPassword/>}/>
 <Route path="/about" element={<About/>}/>
 <Route path="/contact" element={<Contact/>}/>
 <Route path="/services" element={<Services/>}/>
 <Route path="/businesstools" element={<BusinessTools/>}/>
 <Route path="/addpackage" element={<AddPackage/>}/>
 <Route path="/addservice" element={<AddService/>}/>
 <Route path="/add-hotel-room" element={<AddHotelRoom/>}/>
 <Route path="/managepackages" element={<ManagePackages/>}/>
 <Route path="/packages" element={<ExplorePage/>}/>
 <Route path="/viewpackage/:id" element={<ViewPackage/>}/>
 <Route path="/contact" element={<Contact/>}/>
 <Route path="/businessplace" element={<BusinessPlace/>}/>
 <Route path="/tripplan" element={<TripPlanner/>}/>
 <Route path="/userprofile" element={<Profile/>}/>
 <Route path="/mytripplans" element={<MyTripPlans/>}/>
 <Route path="/payment/:bookingId" element={<PaymentPage/>}/>
 <Route path="/mybooking" element={<MyBookings/>}/>
 <Route path="/seller-bookings" element={<SellerBookings />} />
 <Route path="/request-business" element={<RequestBusiness />} />
 <Route path="/editpassword" element={<EditPassword />} />
 <Route path="/settings" element={<Settings />} />
 <Route path="/savedpackages" element={<SavedPackage />} />
 <Route path="/terms" element={<TermsOfService />} />
 <Route path="/privacy" element={<PrivacyPolicy />} />
 <Route path="/help" element={<CustomerCenter />} />
 <Route path="/book-services" element={<BookServices />} />
 <Route path="/business-bookings" element={<BusinessBookings />} />
 <Route path="/provider-profile/:userId" element={<ProviderProfile />} />
 </Routes>
 </main>
 );
}


function App() {
 return (
 <PayPalScriptProvider options={{ "client-id": "AWRO0b19cCUj4TJObjNX1mEQYDrQtydelON6W_0-g7CrAVMI6uQYz9g6fjV16icfG0eIK-2gUlMNFCpH" }}>
 <BrowserRouter>
 <NaviBar />
 
 {/* ── react-hot-toast: Global notification hub ── */}
 <Toaster
 position="top-right"
 reverseOrder={false}
 gutter={10}
 containerStyle={{ top: 80 }}
 toastOptions={{
 duration: 4000,
 style: {
 background: "rgba(15, 23, 42, 0.92)",
 backdropFilter: "blur(16px)",
 WebkitBackdropFilter: "blur(16px)",
 color: "#E7F9FC",
 border: "1px solid rgba(255,255,255,0.1)",
 borderRadius: "14px",
 padding: "14px 18px",
 fontSize: "14px",
 fontFamily: "'Inter', sans-serif",
 boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
 maxWidth: "380px",
 },
 success: {
 duration: 3500,
 iconTheme: { primary: "#10b981", secondary: "#fff" },
 style: {
 background: "rgba(15, 23, 42, 0.92)",
 backdropFilter: "blur(16px)",
 WebkitBackdropFilter: "blur(16px)",
 color: "#E7F9FC",
 border: "1px solid rgba(16, 185, 129, 0.4)",
 borderRadius: "14px",
 padding: "14px 18px",
 fontSize: "14px",
 fontFamily: "'Inter', sans-serif",
 boxShadow: "0 8px 32px rgba(16, 185, 129, 0.2)",
 },
 },
 error: {
 duration: 5000,
 iconTheme: { primary: "#ef4444", secondary: "#fff" },
 style: {
 background: "rgba(15, 23, 42, 0.92)",
 backdropFilter: "blur(16px)",
 WebkitBackdropFilter: "blur(16px)",
 color: "#E7F9FC",
 border: "1px solid rgba(239, 68, 68, 0.4)",
 borderRadius: "14px",
 padding: "14px 18px",
 fontSize: "14px",
 fontFamily: "'Inter', sans-serif",
 boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
 },
 },
 loading: {
 iconTheme: { primary: "#f59e0b", secondary: "rgba(15,23,42,0.92)" },
 style: {
 background: "rgba(15, 23, 42, 0.92)",
 backdropFilter: "blur(16px)",
 WebkitBackdropFilter: "blur(16px)",
 color: "#E7F9FC",
 border: "1px solid rgba(245, 158, 11, 0.3)",
 borderRadius: "14px",
 padding: "14px 18px",
 fontSize: "14px",
 fontFamily: "'Inter', sans-serif",
 boxShadow: "0 8px 32px rgba(245, 158, 11, 0.15)",
 },
 },
 }}
 />
 <AnimatedRoutes />
 </BrowserRouter>
 </PayPalScriptProvider>
 );
}

export default App;
