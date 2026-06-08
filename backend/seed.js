require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Location = require("./src/models/Location");
const Package = require("./src/models/Package");
const Business = require("./src/models/Business");
const Booking = require("./src/models/Booking");
const Payment = require("./src/models/Payment");
const Review = require("./src/models/Review");
const Trip = require("./src/models/Trip");
const SavedPackage = require("./src/models/SavedPackage");
const SearchHistory = require("./src/models/SearchHistory");
const BusinessRequest = require("./src/models/BusinessRequest");
const Slip = require("./src/models/Slip");

const img = (id) => `https://picsum.photos/seed/${id}/800/600`;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear all
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Location.deleteMany({}),
    Package.deleteMany({}), Business.deleteMany({}), Booking.deleteMany({}),
    Payment.deleteMany({}), Review.deleteMany({}), Trip.deleteMany({}),
    SavedPackage.deleteMany({}), SearchHistory.deleteMany({}),
    BusinessRequest.deleteMany({}), Slip.deleteMany({}),
  ]);
  console.log("Cleared all collections");

  const hash = await bcrypt.hash("password123", 10);

  // ── Categories ──────────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: "Cultural Tours",    description: "Heritage and cultural experiences" },
    { name: "Adventure",         description: "Thrilling outdoor activities" },
    { name: "Beach & Coastal",   description: "Seaside relaxation and water sports" },
    { name: "Wildlife Safari",   description: "National parks and animal encounters" },
    { name: "Hill Country",      description: "Tea estates and scenic highlands" },
  ]);

  // ── Locations ────────────────────────────────────────────────
  const locs = await Location.insertMany([
    { name: "Colombo",    description: "Capital city of Sri Lanka" },
    { name: "Kandy",      description: "Cultural capital in the hill country" },
    { name: "Sigiriya",   description: "Ancient rock fortress" },
    { name: "Galle",      description: "Southern coastal city with Dutch fort" },
    { name: "Nuwara Eliya", description: "Little England of Sri Lanka" },
  ]);

  // ── Business Users ───────────────────────────────────────────
  const bizUsers = await User.insertMany([
    { username: "SunsetHotelLK",   email: "sunset@hotel.lk",    password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1980-03-15"), jobRole: "Hotel Owner",    currency: "LKR" },
    { username: "LankaGuidesPro",  email: "guide@lankapro.lk",  password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1985-07-22"), jobRole: "Tour Guide",    currency: "LKR" },
    { username: "CeylonDrivesCo",  email: "drive@ceylonlk.com", password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1978-11-10"), jobRole: "Transport Owner", currency: "LKR" },
    { username: "KandyResortsLtd", email: "kandy@resorts.lk",   password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1982-05-30"), jobRole: "Resort Manager", currency: "LKR" },
    { username: "GalleToursLK",    email: "tours@galle.lk",     password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1990-01-18"), jobRole: "Tour Operator", currency: "LKR" },
  ]);

  // ── Regular Traveller Users ──────────────────────────────────
  const travellers = await User.insertMany([
    { username: "AmyWatson",    email: "amy@gmail.com",     password: hash, accountType: "user", country: "United Kingdom", dateOfBirth: new Date("1995-04-12"), jobRole: "Designer",   currency: "GBP" },
    { username: "RajanPatel",   email: "rajan@mail.com",    password: hash, accountType: "user", country: "India",          dateOfBirth: new Date("1992-09-25"), jobRole: "Engineer",  currency: "INR" },
    { username: "SarahMuller",  email: "sarah@web.de",      password: hash, accountType: "user", country: "Germany",        dateOfBirth: new Date("1988-12-03"), jobRole: "Teacher",   currency: "EUR" },
    { username: "TomBradley",   email: "tom@outlook.com",   password: hash, accountType: "user", country: "Australia",      dateOfBirth: new Date("1997-06-17"), jobRole: "Developer", currency: "AUD" },
    { username: "YukiTanaka",   email: "yuki@jp.com",       password: hash, accountType: "user", country: "Japan",          dateOfBirth: new Date("1993-02-28"), jobRole: "Analyst",   currency: "JPY" },
  ]);

  // ── Business Requests ────────────────────────────────────────
  await BusinessRequest.insertMany([
    { owner: bizUsers[0]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Sunset Beach Hotel", ownerName: "Nimal Perera", managerName: "Kamal Silva", propertyType: "Hotel", description: "Beachfront luxury hotel in Colombo", address: "1 Galle Road", city: "Colombo", district: "Colombo", phone: "0112345678", latitude: 6.9271, longitude: 79.8612, amenities: ["WiFi","Pool","Gym","Spa"], brn: "BRN001" } },
    { owner: bizUsers[1]._id, category: "Guide", status: "approved",
      guideDetails: { fullName: "Asanka Fernando", dateOfBirth: "1985-07-22", baseCity: "Kandy", operatingRegions: "Central Province", languages: "English, Sinhala, Tamil", guideType: "National Guide", experience: 10, bio: "Expert guide specializing in cultural and heritage tours", nicNumber: "852345678V", tourismBoardReg: "TBR001" } },
    { owner: bizUsers[2]._id, category: "Transport", status: "approved",
      transportDetails: { serviceType: "Hire", ownerName: "Pradeep Jayasinghe", driverName: "Chamara Wijeratne", phone: "0771234567", vehicleType: "SUV", vehicleMake: "Toyota", vehicleModel: "Prado", yearOfManufacture: "2020", transmission: "Auto", passengerCapacity: "6", luggageCapacity: "4", airConditioned: "Yes", baseCity: "Colombo", airportTransfer: "Yes", driverNIC: "801234567V" } },
    { owner: bizUsers[3]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Kandy Hills Resort", ownerName: "Dinesh Rathnayake", managerName: "Sunil Dias", propertyType: "Resort", description: "Hilltop resort with panoramic views of Kandy", address: "45 Rajapihilla Mawatha", city: "Kandy", district: "Kandy", phone: "0812345678", latitude: 7.2906, longitude: 80.6337, amenities: ["WiFi","Restaurant","Pool","Ayurveda"], brn: "BRN002" } },
    { owner: bizUsers[4]._id, category: "Guide", status: "pending",
      guideDetails: { fullName: "Lakmal Goonetilleke", dateOfBirth: "1990-01-18", baseCity: "Galle", operatingRegions: "Southern Province", languages: "English, Sinhala", guideType: "National Guide", experience: 5, bio: "Southern coast specialist with deep knowledge of Galle Fort", nicNumber: "900118456V", tourismBoardReg: "TBR002" } },
  ]);

  // ── Packages (Services + Tour Packages) ─────────────────────
  const pkgs = await Package.insertMany([
    { name: "Deluxe Sea View Room", description: "Luxury beachfront room with ocean views, king-size bed and private balcony.", price: 18500, category: cats[2]._id, location: "Colombo", creator: bizUsers[0]._id, image: img("hotel1"), images: [img("hotel1"), img("hotel2")], listingType: "Service", serviceCategory: "Hotel Package", isFeatured: true, views: 245 },
    { name: "Cultural Heritage Day Tour", description: "Full-day guided tour covering Temple of Tooth, Peradeniya Gardens and local craft villages.", price: 8500, category: cats[0]._id, location: "Kandy", creator: bizUsers[1]._id, image: img("kandy1"), images: [img("kandy1"), img("kandy2")], listingType: "Service", serviceCategory: "Guide", languages: ["English","Sinhala"], specialization: "Cultural Heritage", isFeatured: true, views: 312 },
    { name: "Airport to Colombo Transfer", description: "Comfortable AC SUV transfer from Bandaranaike Airport to any Colombo hotel.", price: 5500, category: cats[0]._id, location: "Colombo", creator: bizUsers[2]._id, image: img("suv1"), images: [img("suv1"), img("suv2")], listingType: "Service", serviceCategory: "Hire Vehicle", pricingType: "Per Day", isFeatured: false, views: 189 },
    { name: "3-Day Hill Country Escape", description: "Explore Nuwara Eliya tea plantations, Horton Plains and Gregory Lake with guided commentary.", price: 32000, category: cats[4]._id, location: "Nuwara Eliya", creator: bizUsers[3]._id, image: img("tea1"), images: [img("tea1"), img("tea2"), img("tea3")], listingType: "Package", itinerary: "Day 1: Arrival & Nuwara Eliya town. Day 2: Horton Plains & World's End. Day 3: Tea factory & departure.", inclusions: ["Accommodation","Breakfast","Guide","Transport"], duration: "3 Days / 2 Nights", isFeatured: true, views: 421 },
    { name: "Galle Fort History Walk", description: "Guided walking tour of the iconic 17th-century Dutch Galle Fort with museum visits.", price: 4500, category: cats[0]._id, location: "Galle", creator: bizUsers[4]._id, image: img("galle1"), images: [img("galle1"), img("galle2")], listingType: "Service", serviceCategory: "Guide", languages: ["English"], specialization: "Colonial History", isFeatured: false, views: 156 },
  ]);

  // ── Businesses ───────────────────────────────────────────────
  await Business.insertMany([
    { name: "Sunset Beach Hotel",     owner: bizUsers[0]._id, description: "Luxury beachfront hotel in Colombo",              category: "Hotel",       location: locs[0]._id, longitude: 79.8612, latitude: 6.9271,  address: "1 Galle Road, Colombo 3",           contact: "0112345678", email: "sunset@hotel.lk"    },
    { name: "Lanka Guides Pro",        owner: bizUsers[1]._id, description: "Professional guiding services island-wide",       category: "Guides",      location: locs[1]._id, longitude: 80.6337, latitude: 7.2906,  address: "12 Peradeniya Road, Kandy",          contact: "0771234560", email: "guide@lankapro.lk"  },
    { name: "Ceylon Drives Co",        owner: bizUsers[2]._id, description: "Premium chauffeur and vehicle hire services",     category: "Rent a Car",  location: locs[0]._id, longitude: 79.8500, latitude: 6.9200,  address: "34 Union Place, Colombo 2",          contact: "0771234567", email: "drive@ceylonlk.com" },
    { name: "Kandy Hills Resort",      owner: bizUsers[3]._id, description: "Hilltop resort with panoramic Kandy views",       category: "Hotel",       location: locs[1]._id, longitude: 80.6400, latitude: 7.3000,  address: "45 Rajapihilla Mawatha, Kandy",      contact: "0812345678", email: "kandy@resorts.lk"   },
    { name: "Galle Tours LK",          owner: bizUsers[4]._id, description: "Expert-led southern coastal tour experiences",    category: "Guides",      location: locs[3]._id, longitude: 80.2170, latitude: 6.0535,  address: "7 Church Street, Galle Fort",        contact: "0912345678", email: "tours@galle.lk"     },
  ]);

  // ── Bookings ─────────────────────────────────────────────────
  const bookings = await Booking.insertMany([
    { packageId: pkgs[0]._id, customerId: travellers[0]._id, startDate: new Date("2026-06-01"), endDate: new Date("2026-06-04"), numberOfDays: 3, chargePerUnit: 18500, totalCharge: 55500, status: "Confirmed",  adminCommission: 5550,  providerEarnings: 49950 },
    { packageId: pkgs[1]._id, customerId: travellers[1]._id, startDate: new Date("2026-06-05"), endDate: new Date("2026-06-05"), numberOfDays: 1, chargePerUnit: 8500,  totalCharge: 8500,  status: "Completed",  adminCommission: 850,   providerEarnings: 7650  },
    { packageId: pkgs[2]._id, customerId: travellers[2]._id, startDate: new Date("2026-06-10"), endDate: new Date("2026-06-10"), numberOfDays: 1, chargePerUnit: 5500,  totalCharge: 5500,  status: "Confirmed",  adminCommission: 550,   providerEarnings: 4950  },
    { packageId: pkgs[3]._id, customerId: travellers[3]._id, startDate: new Date("2026-06-15"), endDate: new Date("2026-06-17"), numberOfDays: 3, chargePerUnit: 32000, totalCharge: 96000, status: "Pending",    adminCommission: 9600,  providerEarnings: 86400 },
    { packageId: pkgs[4]._id, customerId: travellers[4]._id, startDate: new Date("2026-06-20"), endDate: new Date("2026-06-20"), numberOfDays: 1, chargePerUnit: 4500,  totalCharge: 4500,  status: "Completed",  adminCommission: 450,   providerEarnings: 4050  },
  ]);

  // ── Payments ─────────────────────────────────────────────────
  await Payment.insertMany([
    { bookingId: bookings[0]._id, customerId: travellers[0]._id, amount: 55500, currency: "LKR", paymentMethod: "Card",          transactionId: "TXN-PP-001", status: "Completed", paidAt: new Date("2026-05-28") },
    { bookingId: bookings[1]._id, customerId: travellers[1]._id, amount: 8500,  currency: "LKR", paymentMethod: "Card",          transactionId: "TXN-PP-002", status: "Completed", paidAt: new Date("2026-06-04") },
    { bookingId: bookings[2]._id, customerId: travellers[2]._id, amount: 5500,  currency: "LKR", paymentMethod: "Bank Transfer",  transactionId: "TXN-BT-003", status: "Completed", paidAt: new Date("2026-06-09") },
    { bookingId: bookings[3]._id, customerId: travellers[3]._id, amount: 96000, currency: "LKR", paymentMethod: "Card",          transactionId: "TXN-PP-004", status: "Pending",   paidAt: new Date("2026-06-14") },
    { bookingId: bookings[4]._id, customerId: travellers[4]._id, amount: 4500,  currency: "LKR", paymentMethod: "Card",          transactionId: "TXN-PP-005", status: "Completed", paidAt: new Date("2026-06-19") },
  ]);

  // ── Reviews ──────────────────────────────────────────────────
  await Review.insertMany([
    { packageId: pkgs[0]._id, userId: travellers[0]._id, userName: "AmyWatson",   rating: 5, comment: "Absolutely stunning views! The room was immaculate and staff extremely helpful." },
    { packageId: pkgs[1]._id, userId: travellers[1]._id, userName: "RajanPatel",  rating: 4, comment: "Asanka was an incredible guide. Very knowledgeable about Sri Lankan history." },
    { packageId: pkgs[2]._id, userId: travellers[2]._id, userName: "SarahMuller", rating: 5, comment: "Driver was punctual and very professional. Vehicle was clean and comfortable." },
    { packageId: pkgs[3]._id, userId: travellers[3]._id, userName: "TomBradley",  rating: 5, comment: "The hill country package exceeded expectations. Tea factory visit was the highlight!" },
    { packageId: pkgs[4]._id, userId: travellers[4]._id, userName: "YukiTanaka",  rating: 4, comment: "Wonderful walking tour. The Dutch colonial architecture is breathtaking." },
  ]);

  // ── AI Trip Plans ────────────────────────────────────────────
  await Trip.insertMany([
    { userId: travellers[0]._id, tripTitle: "Sri Lanka 5-Day Adventure", totalEstimatedCost: "LKR 85000", fullPlanDescription: "A curated 5-day cultural and coastal journey across Sri Lanka.", budget: "85000", days: 5, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-06-01", destination: "Colombo",    activities: ["City tour","Gangaramaya Temple","Pettah Market"], accommodation: "Sunset Beach Hotel" },
        { day: 2, date: "2026-06-02", destination: "Sigiriya",   activities: ["Lion Rock climb","Pidurangala Rock"], accommodation: "Sigiriya Village Hotel" },
        { day: 3, date: "2026-06-03", destination: "Kandy",      activities: ["Temple of Tooth","Peradeniya Gardens"], accommodation: "Kandy Hills Resort" },
        { day: 4, date: "2026-06-04", destination: "Nuwara Eliya", activities: ["Tea plantation","Gregory Lake","Horton Plains"], accommodation: "Grand Hotel" },
        { day: 5, date: "2026-06-05", destination: "Galle",      activities: ["Galle Fort walk","Unawatuna Beach"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[1]._id, tripTitle: "Heritage Trail 3 Days",     totalEstimatedCost: "LKR 45000", fullPlanDescription: "Explore ancient kingdoms and UNESCO sites across Sri Lanka.", budget: "45000", days: 3, members: 1, transport: "Bus",
      itinerary: [
        { day: 1, date: "2026-07-10", destination: "Anuradhapura", activities: ["Sacred Bodhi Tree","Ruwanwelisaya Stupa"], accommodation: "Tissawa Hotel" },
        { day: 2, date: "2026-07-11", destination: "Polonnaruwa",  activities: ["Ancient city tour","Gal Vihara Rock Temple"], accommodation: "Heritage Hotel" },
        { day: 3, date: "2026-07-12", destination: "Sigiriya",     activities: ["Rock Fortress","Dambulla Cave Temple"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[2]._id, tripTitle: "Southern Coast Explorer",   totalEstimatedCost: "LKR 62000", fullPlanDescription: "Beach hopping along Sri Lanka's stunning southern coastline.", budget: "62000", days: 4, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-08-05", destination: "Galle",        activities: ["Galle Fort","Lighthouse"], accommodation: "Fort Bazaar Hotel" },
        { day: 2, date: "2026-08-06", destination: "Mirissa",      activities: ["Whale watching","Beach relaxation"], accommodation: "Mirissa Beach Inn" },
        { day: 3, date: "2026-08-07", destination: "Tangalle",     activities: ["Turtle watching","Rekawa Lagoon"], accommodation: "Amanwella Resort" },
        { day: 4, date: "2026-08-08", destination: "Yala",         activities: ["Safari morning drive","Leopard spotting"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[3]._id, tripTitle: "Wildlife & Nature 4 Days",  totalEstimatedCost: "LKR 78000", fullPlanDescription: "Immerse in Sri Lanka's incredible wildlife biodiversity.", budget: "78000", days: 4, members: 3, transport: "Van",
      itinerary: [
        { day: 1, date: "2026-09-01", destination: "Pinnawala",    activities: ["Elephant Orphanage"], accommodation: "Pinnawala Hotel" },
        { day: 2, date: "2026-09-02", destination: "Udawalawe",    activities: ["Elephant Safari","Bird watching"], accommodation: "Udawalawe Safari Camp" },
        { day: 3, date: "2026-09-03", destination: "Yala",         activities: ["Morning & evening safari"], accommodation: "Yala National Park Lodge" },
        { day: 4, date: "2026-09-04", destination: "Mirissa",      activities: ["Whale watching tour"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[4]._id, tripTitle: "Tea Country & Trains",      totalEstimatedCost: "LKR 38000", fullPlanDescription: "Ride the iconic Kandy-Ella train through misty tea estates.", budget: "38000", days: 3, members: 2, transport: "Train",
      itinerary: [
        { day: 1, date: "2026-10-10", destination: "Kandy",        activities: ["Temple of Tooth","Cultural show"], accommodation: "Kandy Hills Resort" },
        { day: 2, date: "2026-10-11", destination: "Ella",         activities: ["Scenic train ride","Nine Arches Bridge"], accommodation: "Ella Flower Garden" },
        { day: 3, date: "2026-10-12", destination: "Nuwara Eliya", activities: ["Tea factory","Gregory Lake"], accommodation: "Departure" },
      ]
    },
  ]);

  // ── Saved Packages ───────────────────────────────────────────
  await SavedPackage.insertMany([
    { userId: travellers[0]._id, packageId: pkgs[1]._id, savedAt: new Date("2026-05-10") },
    { userId: travellers[0]._id, packageId: pkgs[3]._id, savedAt: new Date("2026-05-12") },
    { userId: travellers[1]._id, packageId: pkgs[0]._id, savedAt: new Date("2026-05-14") },
    { userId: travellers[2]._id, packageId: pkgs[3]._id, savedAt: new Date("2026-05-15") },
    { userId: travellers[3]._id, packageId: pkgs[4]._id, savedAt: new Date("2026-05-16") },
  ]);

  // ── Search History ───────────────────────────────────────────
  await SearchHistory.insertMany([
    { userId: travellers[0]._id, keywords: "beach hotel colombo", budget: 60000, days: 3, transport: "Car",   members: 2 },
    { userId: travellers[1]._id, keywords: "cultural tour kandy",  budget: 20000, days: 1, transport: "Bus",  members: 1 },
    { userId: travellers[2]._id, keywords: "airport transfer",     budget: 8000,  days: 1, transport: "Car",  members: 2 },
    { userId: travellers[3]._id, keywords: "hill country nuwara",  budget: 100000, days: 4, transport: "Van", members: 4 },
    { userId: travellers[4]._id, keywords: "galle fort history",   budget: 15000, days: 1, transport: "Car",  members: 2 },
  ]);

  // ── Slips ────────────────────────────────────────────────────
  await Slip.insertMany([
    { bookingId: bookings[0]._id, packageId: pkgs[0]._id, customerId: travellers[0]._id, sellerId: bizUsers[0]._id, packageName: pkgs[0].name, customerName: "AmyWatson",   amount: 55500, startDate: new Date("2026-06-01"), endDate: new Date("2026-06-04") },
    { bookingId: bookings[1]._id, packageId: pkgs[1]._id, customerId: travellers[1]._id, sellerId: bizUsers[1]._id, packageName: pkgs[1].name, customerName: "RajanPatel",  amount: 8500,  startDate: new Date("2026-06-05"), endDate: new Date("2026-06-05") },
    { bookingId: bookings[2]._id, packageId: pkgs[2]._id, customerId: travellers[2]._id, sellerId: bizUsers[2]._id, packageName: pkgs[2].name, customerName: "SarahMuller", amount: 5500,  startDate: new Date("2026-06-10"), endDate: new Date("2026-06-10") },
    { bookingId: bookings[3]._id, packageId: pkgs[3]._id, customerId: travellers[3]._id, sellerId: bizUsers[3]._id, packageName: pkgs[3].name, customerName: "TomBradley",  amount: 96000, startDate: new Date("2026-06-15"), endDate: new Date("2026-06-17") },
    { bookingId: bookings[4]._id, packageId: pkgs[4]._id, customerId: travellers[4]._id, sellerId: bizUsers[4]._id, packageName: pkgs[4].name, customerName: "YukiTanaka",  amount: 4500,  startDate: new Date("2026-06-20"), endDate: new Date("2026-06-20") },
  ]);

  console.log("✅ Seed complete!");
  console.log("  Categories:       5");
  console.log("  Locations:        5");
  console.log("  Business Users:   5");
  console.log("  Travellers:       5");
  console.log("  BusinessRequests: 5");
  console.log("  Packages:         5");
  console.log("  Businesses:       5");
  console.log("  Bookings:         5");
  console.log("  Payments:         5");
  console.log("  Reviews:          5");
  console.log("  Trips:            5");
  console.log("  SavedPackages:    5");
  console.log("  SearchHistory:    5");
  console.log("  Slips:            5");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
