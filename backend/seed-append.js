require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User           = require("./src/models/User");
const Category       = require("./src/models/Category");
const Location       = require("./src/models/Location");
const Package        = require("./src/models/Package");
const Business       = require("./src/models/Business");
const Booking        = require("./src/models/Booking");
const Payment        = require("./src/models/Payment");
const Review         = require("./src/models/Review");
const Trip           = require("./src/models/Trip");
const SavedPackage   = require("./src/models/SavedPackage");
const SearchHistory  = require("./src/models/SearchHistory");
const BusinessRequest= require("./src/models/BusinessRequest");
const Slip           = require("./src/models/Slip");

const img = (id) => `https://picsum.photos/seed/${id}/800/600`;

async function append() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — appending 5 more per collection...\n");

  const hash = await bcrypt.hash("password123", 10);

  // ── 5 More Categories ────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: "Ayurveda & Wellness",  description: "Traditional Sri Lankan healing and spa" },
    { name: "Water Sports",         description: "Surfing, diving, snorkelling & more" },
    { name: "Elephant Experiences", description: "Ethical elephant encounters" },
    { name: "Photography Tours",    description: "Guided tours for photography enthusiasts" },
    { name: "Culinary Tours",       description: "Sri Lankan food, spice and cooking experiences" },
  ]);

  // ── 5 More Locations ─────────────────────────────────────────
  const locs = await Location.insertMany([
    { name: "Ella",          description: "Scenic mountain village with waterfalls" },
    { name: "Mirissa",       description: "Whale watching capital of Sri Lanka" },
    { name: "Trincomalee",   description: "Eastern harbour city and beaches" },
    { name: "Anuradhapura",  description: "Ancient capital with sacred stupas" },
    { name: "Arugam Bay",    description: "World-class surf destination on the east coast" },
  ]);

  // ── 5 More Business Users ────────────────────────────────────
  const bizUsers = await User.insertMany([
    { username: "EllaEcoLodge",     email: "eco@ella.lk",        password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1983-04-20"), jobRole: "Lodge Owner",    currency: "LKR" },
    { username: "TrincoWaterSports",email: "water@trinco.lk",    password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1987-09-14"), jobRole: "Sports Operator",currency: "LKR" },
    { username: "SpiceRouteGuides", email: "spice@route.lk",     password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1979-02-08"), jobRole: "Tour Guide",    currency: "LKR" },
    { username: "AyurvedaHealingLK",email: "heal@ayurveda.lk",   password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1975-11-30"), jobRole: "Wellness Center",currency: "LKR" },
    { username: "SurfArugamBay",    email: "surf@arugam.lk",     password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1992-06-25"), jobRole: "Surf Instructor",currency: "LKR" },
  ]);

  // ── 5 More Traveller Users ───────────────────────────────────
  const travellers = await User.insertMany([
    { username: "LucasBianchi",  email: "lucas@mail.it",   password: hash, accountType: "user", country: "Italy",        dateOfBirth: new Date("1990-03-15"), jobRole: "Photographer", currency: "EUR" },
    { username: "ClaireMartin",  email: "claire@fr.com",   password: hash, accountType: "user", country: "France",       dateOfBirth: new Date("1994-07-22"), jobRole: "Chef",         currency: "EUR" },
    { username: "JinhoKim",      email: "jinho@kr.com",    password: hash, accountType: "user", country: "South Korea",  dateOfBirth: new Date("1996-11-08"), jobRole: "Student",      currency: "KRW" },
    { username: "MiaSchmidt",    email: "mia@berlin.de",   password: hash, accountType: "user", country: "Germany",      dateOfBirth: new Date("1989-05-19"), jobRole: "Journalist",   currency: "EUR" },
    { username: "CarlosRodriguez",email: "carlos@mx.com",  password: hash, accountType: "user", country: "Mexico",       dateOfBirth: new Date("1991-08-03"), jobRole: "Entrepreneur", currency: "MXN" },
  ]);

  // ── 5 More Business Requests ─────────────────────────────────
  await BusinessRequest.insertMany([
    { owner: bizUsers[0]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Ella Eco Lodge", ownerName: "Ruwan Perera", managerName: "Dilani Silva", propertyType: "Villa", description: "Eco-friendly lodge with stunning valley views in Ella", address: "22 Passara Road", city: "Ella", district: "Badulla", phone: "0552345678", latitude: 6.8667, longitude: 81.0466, amenities: ["WiFi","Organic Restaurant","Yoga Deck","Nature Trails"], brn: "BRN003" } },
    { owner: bizUsers[1]._id, category: "Transport", status: "approved",
      transportDetails: { serviceType: "Hire", ownerName: "Mahesh Cooray", driverName: "Priyantha Bandara", phone: "0261234567", vehicleType: "Passenger Van", vehicleMake: "Nissan", vehicleModel: "Caravan", yearOfManufacture: "2019", transmission: "Manual", passengerCapacity: "12", luggageCapacity: "8", airConditioned: "Yes", baseCity: "Trincomalee", airportTransfer: "No", driverNIC: "870914123V" } },
    { owner: bizUsers[2]._id, category: "Guide", status: "approved",
      guideDetails: { fullName: "Niroshan Wickramasinghe", dateOfBirth: "1979-02-08", baseCity: "Colombo", operatingRegions: "Island-wide", languages: "English, Sinhala, French", guideType: "National Guide", experience: 15, bio: "Culinary and spice route specialist with 15 years of experience", nicNumber: "790208789V", tourismBoardReg: "TBR003" } },
    { owner: bizUsers[3]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Ayurveda Healing Retreat", ownerName: "Dr. Sampath Gunawardena", managerName: "Chamari Perera", propertyType: "Resort", description: "Traditional Ayurvedic healing resort near Bentota", address: "8 River Road", city: "Bentota", district: "Galle", phone: "0342345678", latitude: 6.4200, longitude: 80.0000, amenities: ["WiFi","Ayurveda Treatments","Yoga","Organic Garden","River Views"], brn: "BRN004" } },
    { owner: bizUsers[4]._id, category: "Guide", status: "pending",
      guideDetails: { fullName: "Shanaka Dharmapriya", dateOfBirth: "1992-06-25", baseCity: "Arugam Bay", operatingRegions: "Eastern Province", languages: "English, Sinhala", guideType: "Adventure/Trekking Guide", experience: 6, bio: "Surf instructor and eastern coast adventure guide", nicNumber: "920625321V", tourismBoardReg: "TBR004" } },
  ]);

  // ── 5 More Packages ──────────────────────────────────────────
  const pkgs = await Package.insertMany([
    { name: "Ella Valley View Suite",       description: "Eco lodge suite with panoramic views of Ella Gap, lush greenery and misty mornings.",               price: 14500, category: cats[0]._id, location: "Ella",        creator: bizUsers[0]._id, image: img("ella1"),    images: [img("ella1"),    img("ella2")],              listingType: "Service", serviceCategory: "Hotel Package", isFeatured: true,  views: 198 },
    { name: "Trinco Snorkelling Adventure", description: "Half-day guided snorkelling at Pigeon Island National Park, gear and boat included.",               price: 6500,  category: cats[1]._id, location: "Trincomalee", creator: bizUsers[1]._id, image: img("snorkel1"), images: [img("snorkel1"), img("snorkel2")],            listingType: "Service", serviceCategory: "Guide",         languages: ["English","Sinhala"], specialization: "Marine & Water Sports", isFeatured: false, views: 134 },
    { name: "Spice Garden & Cooking Class", description: "Visit a working spice garden, learn to cook 5 authentic Sri Lankan dishes with a local chef.",      price: 7200,  category: cats[4]._id, location: "Kandy",      creator: bizUsers[2]._id, image: img("spice1"),   images: [img("spice1"),   img("spice2"), img("spice3")], listingType: "Service", serviceCategory: "Guide",         languages: ["English","French"], specialization: "Culinary & Food Tourism", isFeatured: true,  views: 267 },
    { name: "7-Day Complete Sri Lanka",     description: "The ultimate island circuit: Colombo, Sigiriya, Kandy, Ella, Yala and Galle in 7 days.",            price: 125000,category: cats[0]._id, location: "Colombo",    creator: bizUsers[2]._id, image: img("srilanka1"), images: [img("srilanka1"),img("srilanka2"),img("srilanka3")], listingType: "Package", itinerary: "Day 1: Colombo. Day 2: Sigiriya. Day 3: Kandy. Day 4: Ella. Day 5: Yala Safari. Day 6: Mirissa. Day 7: Galle.", inclusions: ["All Hotels","All Breakfasts","Guide","AC Transport","Entrance Fees"], duration: "7 Days / 6 Nights", isFeatured: true, views: 589 },
    { name: "Arugam Bay Surf Lesson",       description: "2-hour beginner surf lesson at the world-famous Arugam Bay main point break, board included.",      price: 4800,  category: cats[1]._id, location: "Arugam Bay", creator: bizUsers[4]._id, image: img("surf1"),    images: [img("surf1"),    img("surf2")],              listingType: "Service", serviceCategory: "Guide",         languages: ["English"], specialization: "Surfing & Water Sports", isFeatured: false, views: 221 },
  ]);

  // ── 5 More Businesses ────────────────────────────────────────
  await Business.insertMany([
    { name: "Ella Eco Lodge",         owner: bizUsers[0]._id, description: "Eco-friendly lodge in scenic Ella",              category: "Hotel",      location: locs[0]._id, longitude: 81.0466, latitude: 6.8667,  address: "22 Passara Road, Ella",              contact: "0552345678", email: "eco@ella.lk"       },
    { name: "Trinco Water Sports",    owner: bizUsers[1]._id, description: "Water sports and snorkelling in Trincomalee",     category: "Guides",     location: locs[2]._id, longitude: 81.2330, latitude: 8.5874,  address: "Nilaveli Beach, Trincomalee",        contact: "0261234567", email: "water@trinco.lk"   },
    { name: "Spice Route Guides",     owner: bizUsers[2]._id, description: "Culinary and spice tour specialists",             category: "Guides",     location: locs[1]._id, longitude: 80.6337, latitude: 7.2906,  address: "45 Peradeniya Road, Kandy",          contact: "0771234560", email: "spice@route.lk"    },
    { name: "Ayurveda Healing Retreat",owner:bizUsers[3]._id, description: "Traditional Ayurvedic retreat near Bentota",     category: "Hotel",      location: locs[0]._id, longitude: 80.0000, latitude: 6.4200,  address: "8 River Road, Bentota",              contact: "0342345678", email: "heal@ayurveda.lk"  },
    { name: "Surf Arugam Bay",        owner: bizUsers[4]._id, description: "Surf school and lessons at Arugam Bay",          category: "Guides",     location: locs[4]._id, longitude: 81.8380, latitude: 6.8398,  address: "Main Point, Arugam Bay",             contact: "0712345678", email: "surf@arugam.lk"    },
  ]);

  // ── 5 More Bookings ──────────────────────────────────────────
  const bookings = await Booking.insertMany([
    { packageId: pkgs[0]._id, customerId: travellers[0]._id, startDate: new Date("2026-07-01"), endDate: new Date("2026-07-03"), numberOfDays: 2, chargePerUnit: 14500, totalCharge: 29000,  status: "Confirmed",  adminCommission: 2900,   providerEarnings: 26100  },
    { packageId: pkgs[1]._id, customerId: travellers[1]._id, startDate: new Date("2026-07-08"), endDate: new Date("2026-07-08"), numberOfDays: 1, chargePerUnit: 6500,  totalCharge: 6500,   status: "Completed",  adminCommission: 650,    providerEarnings: 5850   },
    { packageId: pkgs[2]._id, customerId: travellers[2]._id, startDate: new Date("2026-07-15"), endDate: new Date("2026-07-15"), numberOfDays: 1, chargePerUnit: 7200,  totalCharge: 7200,   status: "Confirmed",  adminCommission: 720,    providerEarnings: 6480   },
    { packageId: pkgs[3]._id, customerId: travellers[3]._id, startDate: new Date("2026-08-01"), endDate: new Date("2026-08-07"), numberOfDays: 7, chargePerUnit: 125000,totalCharge: 125000, status: "Confirmed",  adminCommission: 12500,  providerEarnings: 112500 },
    { packageId: pkgs[4]._id, customerId: travellers[4]._id, startDate: new Date("2026-07-20"), endDate: new Date("2026-07-20"), numberOfDays: 1, chargePerUnit: 4800,  totalCharge: 4800,   status: "Pending",    adminCommission: 480,    providerEarnings: 4320   },
  ]);

  // ── 5 More Payments ──────────────────────────────────────────
  await Payment.insertMany([
    { bookingId: bookings[0]._id, customerId: travellers[0]._id, amount: 29000,  currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-006", status: "Completed", paidAt: new Date("2026-06-28") },
    { bookingId: bookings[1]._id, customerId: travellers[1]._id, amount: 6500,   currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-007", status: "Completed", paidAt: new Date("2026-07-07") },
    { bookingId: bookings[2]._id, customerId: travellers[2]._id, amount: 7200,   currency: "LKR", paymentMethod: "Bank Transfer", transactionId: "TXN-BT-008", status: "Completed", paidAt: new Date("2026-07-14") },
    { bookingId: bookings[3]._id, customerId: travellers[3]._id, amount: 125000, currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-009", status: "Completed", paidAt: new Date("2026-07-28") },
    { bookingId: bookings[4]._id, customerId: travellers[4]._id, amount: 4800,   currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-010", status: "Pending",   paidAt: new Date("2026-07-19") },
  ]);

  // ── 5 More Reviews ───────────────────────────────────────────
  await Review.insertMany([
    { packageId: pkgs[0]._id, userId: travellers[0]._id, userName: "LucasBianchi",   rating: 5, comment: "Ella Eco Lodge is pure magic. Woke up to clouds below us every morning. Photography paradise!" },
    { packageId: pkgs[1]._id, userId: travellers[1]._id, userName: "ClaireMartin",   rating: 4, comment: "Pigeon Island snorkelling was incredible. Colourful coral and fish everywhere. Highly recommend!" },
    { packageId: pkgs[2]._id, userId: travellers[2]._id, userName: "JinhoKim",       rating: 5, comment: "Best cooking class of my life. Made rice and curry, hoppers and pol sambol. Absolutely delicious!" },
    { packageId: pkgs[3]._id, userId: travellers[3]._id, userName: "MiaSchmidt",     rating: 5, comment: "The 7-day circuit is perfect. Every destination is carefully planned. Worth every rupee!" },
    { packageId: pkgs[4]._id, userId: travellers[4]._id, userName: "CarlosRodriguez", rating: 4, comment: "Great surf lesson at Arugam Bay. Patient instructor, stood up on my first session!" },
  ]);

  // ── 5 More Trips ─────────────────────────────────────────────
  await Trip.insertMany([
    { userId: travellers[0]._id, tripTitle: "Photography Tour 4 Days", totalEstimatedCost: "LKR 55000", fullPlanDescription: "Capture Sri Lanka's most photogenic spots with golden hour shoots.", budget: "55000", days: 4, members: 1, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-07-01", destination: "Ella",        activities: ["Nine Arches Bridge at dawn","Little Adam's Peak hike"], accommodation: "Ella Eco Lodge" },
        { day: 2, date: "2026-07-02", destination: "Haputale",    activities: ["Lipton's Seat sunrise","Dambatenne Tea Factory"], accommodation: "Haputale Guest House" },
        { day: 3, date: "2026-07-03", destination: "Sigiriya",    activities: ["Rock fortress golden hour","Mirror Wall detail shots"], accommodation: "Sigiriya Village" },
        { day: 4, date: "2026-07-04", destination: "Dambulla",    activities: ["Cave temple at dawn","Local market photography"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[1]._id, tripTitle: "East Coast Beach Escape", totalEstimatedCost: "LKR 48000", fullPlanDescription: "Explore the pristine and less-touristy east coast beaches.", budget: "48000", days: 3, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-08-12", destination: "Trincomalee", activities: ["Fort Frederick","Koneswaram Temple","Nilaveli Beach"], accommodation: "Trinco Beach Hotel" },
        { day: 2, date: "2026-08-13", destination: "Arugam Bay",  activities: ["Surfing","Elephant Rock viewpoint"], accommodation: "Siam View Beach Hotel" },
        { day: 3, date: "2026-08-14", destination: "Batticaloa",  activities: ["Batticaloa Lagoon boat ride","Dutch Fort"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[2]._id, tripTitle: "Ayurveda & Wellness 5 Days", totalEstimatedCost: "LKR 72000", fullPlanDescription: "Rejuvenate with authentic Ayurvedic treatments and yoga sessions.", budget: "72000", days: 5, members: 1, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-09-10", destination: "Bentota",     activities: ["Arrival & welcome consultation","Herbal bath"], accommodation: "Ayurveda Healing Retreat" },
        { day: 2, date: "2026-09-11", destination: "Bentota",     activities: ["Morning yoga","Abhyanga massage","River safari"], accommodation: "Ayurveda Healing Retreat" },
        { day: 3, date: "2026-09-12", destination: "Bentota",     activities: ["Shirodhara treatment","Meditation session"], accommodation: "Ayurveda Healing Retreat" },
        { day: 4, date: "2026-09-13", destination: "Hikkaduwa",   activities: ["Snorkelling","Glass bottom boat"], accommodation: "Hikkaduwa Beach Hotel" },
        { day: 5, date: "2026-09-14", destination: "Galle",       activities: ["Fort walk","Departure from Galle"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[3]._id, tripTitle: "Sri Lanka Foodie Trail", totalEstimatedCost: "LKR 41000", fullPlanDescription: "A culinary journey through Sri Lanka's spices, street food and cooking traditions.", budget: "41000", days: 3, members: 2, transport: "Bus",
      itinerary: [
        { day: 1, date: "2026-10-01", destination: "Colombo",     activities: ["Pettah Market spice tour","Dinner at Ministry of Crab"], accommodation: "Cinnamon Grand Colombo" },
        { day: 2, date: "2026-10-02", destination: "Kandy",       activities: ["Spice Garden visit","Cooking class - rice & curry"], accommodation: "Kandy Hills Resort" },
        { day: 3, date: "2026-10-03", destination: "Matale",      activities: ["Matale Spice Garden","Sri Muthumariamman temple"], accommodation: "Departure" },
      ]
    },
    { userId: travellers[4]._id, tripTitle: "Ancient Kingdoms Route", totalEstimatedCost: "LKR 33000", fullPlanDescription: "Trace the ancient civilizations of Sri Lanka through its UNESCO heritage sites.", budget: "33000", days: 3, members: 1, transport: "Bus",
      itinerary: [
        { day: 1, date: "2026-11-05", destination: "Anuradhapura",activities: ["Ruwanwelisaya Stupa","Sacred Bodhi Tree","Jetavanaramaya"], accommodation: "Tissawa Hotel" },
        { day: 2, date: "2026-11-06", destination: "Polonnaruwa", activities: ["Ancient City tour","Gal Vihara","Parakrama Samudra"], accommodation: "Heritage Hotel Polonnaruwa" },
        { day: 3, date: "2026-11-07", destination: "Dambulla",    activities: ["Cave Temple of the Golden Rock","Rangiri Dambulla Cave Temple"], accommodation: "Departure" },
      ]
    },
  ]);

  // ── 5 More Saved Packages ────────────────────────────────────
  await SavedPackage.insertMany([
    { userId: travellers[0]._id, packageId: pkgs[3]._id, savedAt: new Date("2026-06-01") },
    { userId: travellers[1]._id, packageId: pkgs[2]._id, savedAt: new Date("2026-06-03") },
    { userId: travellers[2]._id, packageId: pkgs[4]._id, savedAt: new Date("2026-06-05") },
    { userId: travellers[3]._id, packageId: pkgs[1]._id, savedAt: new Date("2026-06-07") },
    { userId: travellers[4]._id, packageId: pkgs[0]._id, savedAt: new Date("2026-06-09") },
  ]);

  // ── 5 More Search Histories ──────────────────────────────────
  await SearchHistory.insertMany([
    { userId: travellers[0]._id, keywords: "ella eco lodge valley view",   budget: 35000,  days: 2, transport: "Car",   members: 1 },
    { userId: travellers[1]._id, keywords: "trinco snorkelling pigeon island", budget: 15000, days: 1, transport: "Van", members: 3 },
    { userId: travellers[2]._id, keywords: "ayurveda retreat bentota",     budget: 80000,  days: 5, transport: "Car",   members: 1 },
    { userId: travellers[3]._id, keywords: "7 day sri lanka tour package", budget: 150000, days: 7, transport: "Van",   members: 2 },
    { userId: travellers[4]._id, keywords: "arugam bay surf lesson",       budget: 10000,  days: 1, transport: "Bus",   members: 1 },
  ]);

  // ── 5 More Slips ─────────────────────────────────────────────
  await Slip.insertMany([
    { bookingId: bookings[0]._id, packageId: pkgs[0]._id, customerId: travellers[0]._id, sellerId: bizUsers[0]._id, packageName: pkgs[0].name, customerName: "LucasBianchi",   amount: 29000,  startDate: new Date("2026-07-01"), endDate: new Date("2026-07-03") },
    { bookingId: bookings[1]._id, packageId: pkgs[1]._id, customerId: travellers[1]._id, sellerId: bizUsers[1]._id, packageName: pkgs[1].name, customerName: "ClaireMartin",   amount: 6500,   startDate: new Date("2026-07-08"), endDate: new Date("2026-07-08") },
    { bookingId: bookings[2]._id, packageId: pkgs[2]._id, customerId: travellers[2]._id, sellerId: bizUsers[2]._id, packageName: pkgs[2].name, customerName: "JinhoKim",       amount: 7200,   startDate: new Date("2026-07-15"), endDate: new Date("2026-07-15") },
    { bookingId: bookings[3]._id, packageId: pkgs[3]._id, customerId: travellers[3]._id, sellerId: bizUsers[3]._id, packageName: pkgs[3].name, customerName: "MiaSchmidt",     amount: 125000, startDate: new Date("2026-08-01"), endDate: new Date("2026-08-07") },
    { bookingId: bookings[4]._id, packageId: pkgs[4]._id, customerId: travellers[4]._id, sellerId: bizUsers[4]._id, packageName: pkgs[4].name, customerName: "CarlosRodriguez",amount: 4800,   startDate: new Date("2026-07-20"), endDate: new Date("2026-07-20") },
  ]);

  console.log("✅ Append complete! Added 5 more to each collection.");
  console.log("  Total per collection is now ~10 records.");
  await mongoose.disconnect();
}

append().catch((err) => { console.error("Append failed:", err.message); process.exit(1); });
