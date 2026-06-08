require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User            = require("./src/models/User");
const Category        = require("./src/models/Category");
const Location        = require("./src/models/Location");
const Package         = require("./src/models/Package");
const Business        = require("./src/models/Business");
const Booking         = require("./src/models/Booking");
const Payment         = require("./src/models/Payment");
const Review          = require("./src/models/Review");
const Trip            = require("./src/models/Trip");
const SavedPackage    = require("./src/models/SavedPackage");
const SearchHistory   = require("./src/models/SearchHistory");
const BusinessRequest = require("./src/models/BusinessRequest");
const Slip            = require("./src/models/Slip");

const img = (id) => `https://picsum.photos/seed/${id}/800/600`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — appending batch 3 (5 more each)...");
  const hash = await bcrypt.hash("password123", 10);

  // 5 more Categories
  const cats = await Category.insertMany([
    { name: "Camping & Glamping", description: "Outdoor overnight stays in nature" },
    { name: "Whale Watching",     description: "Seasonal blue whale and dolphin tours" },
    { name: "Trekking & Hiking",  description: "Mountain and forest trail adventures" },
    { name: "Village Experiences",description: "Authentic rural Sri Lankan village life" },
    { name: "Night Safari",       description: "Nocturnal wildlife encounters" },
  ]);

  // 5 more Locations
  const locs = await Location.insertMany([
    { name: "Yala",          description: "Famous leopard country national park" },
    { name: "Wilpattu",      description: "Oldest national park with leopards and sloth bears" },
    { name: "Horton Plains", description: "Cloud forest plateau with World's End cliff" },
    { name: "Hikkaduwa",     description: "Popular reef beach for surfing and snorkelling" },
    { name: "Pinnawala",     description: "Home of the famous elephant orphanage" },
  ]);

  // 5 more Business Users
  const biz = await User.insertMany([
    { username: "YalaSafariCamp",   email: "safari@yala.lk",      password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1976-08-12"), jobRole: "Safari Operator", currency: "LKR" },
    { username: "HortonTrekkers",   email: "trek@horton.lk",      password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1984-03-05"), jobRole: "Trekking Guide",  currency: "LKR" },
    { username: "VillageStayLK",    email: "stay@village.lk",     password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1981-10-22"), jobRole: "Homestay Host",   currency: "LKR" },
    { username: "HikkaDiveCentre",  email: "dive@hikka.lk",       password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1989-07-19"), jobRole: "Dive Instructor", currency: "LKR" },
    { username: "MirissaWhales",    email: "whales@mirissa.lk",   password: hash, accountType: "business", country: "Sri Lanka", dateOfBirth: new Date("1986-01-30"), jobRole: "Boat Captain",    currency: "LKR" },
  ]);

  // 5 more Travellers
  const trav = await User.insertMany([
    { username: "EmmaDavis",     email: "emma@ca.com",      password: hash, accountType: "user", country: "Canada",       dateOfBirth: new Date("1993-05-14"), jobRole: "Nurse",          currency: "CAD" },
    { username: "OliverSmith",   email: "oliver@nz.com",    password: hash, accountType: "user", country: "New Zealand",  dateOfBirth: new Date("1991-09-28"), jobRole: "Farmer",         currency: "NZD" },
    { username: "SofiaLopez",    email: "sofia@es.com",     password: hash, accountType: "user", country: "Spain",        dateOfBirth: new Date("1996-03-07"), jobRole: "Architect",      currency: "EUR" },
    { username: "AhmedKhalil",   email: "ahmed@ae.com",     password: hash, accountType: "user", country: "UAE",          dateOfBirth: new Date("1988-11-15"), jobRole: "Manager",        currency: "AED" },
    { username: "IsabellaRossi", email: "isabella@it.com",  password: hash, accountType: "user", country: "Italy",        dateOfBirth: new Date("1994-07-31"), jobRole: "Fashion Designer",currency: "EUR" },
  ]);

  // 5 more Business Requests
  await BusinessRequest.insertMany([
    { owner: biz[0]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Yala Safari Camp", ownerName: "Bandula Rajapaksa", managerName: "Tharaka Perera", propertyType: "Cabana", description: "Tented safari camp on the Yala buffer zone", address: "Yala Buffer Zone, Tissamaharama", city: "Tissamaharama", district: "Hambantota", phone: "0472345678", latitude: 6.3725, longitude: 81.5218, amenities: ["Bush Dinners","Game Drives","WiFi","Pool"], brn: "BRN005" } },
    { owner: biz[1]._id, category: "Guide", status: "approved",
      guideDetails: { fullName: "Chaminda Seneviratne", dateOfBirth: "1984-03-05", baseCity: "Nuwara Eliya", operatingRegions: "Central Highlands", languages: "English, Sinhala", guideType: "Adventure/Trekking Guide", experience: 12, bio: "Mountain and cloud forest trekking specialist based in Nuwara Eliya", nicNumber: "840305567V", tourismBoardReg: "TBR005" } },
    { owner: biz[2]._id, category: "Hotel", status: "approved",
      hotelDetails: { hotelName: "Village Stay Polonnaruwa", ownerName: "Sisira Kumara", managerName: "Priyanka Kumari", propertyType: "Villa", description: "Authentic village homestay with rice paddy views", address: "Kaduruwela Village, Polonnaruwa", city: "Polonnaruwa", district: "Polonnaruwa", phone: "0272345678", latitude: 7.9403, longitude: 81.0188, amenities: ["Home Cooked Meals","Bicycle Hire","Paddy Field Walks","Cultural Shows"], brn: "BRN006" } },
    { owner: biz[3]._id, category: "Guide", status: "approved",
      guideDetails: { fullName: "Roshan Abeywickrama", dateOfBirth: "1989-07-19", baseCity: "Hikkaduwa", operatingRegions: "Southern Coast", languages: "English, Sinhala, German", guideType: "Adventure/Trekking Guide", experience: 8, bio: "PADI certified dive instructor specialising in reef and wreck dives", nicNumber: "890719234V", tourismBoardReg: "TBR006" } },
    { owner: biz[4]._id, category: "Transport", status: "pending",
      transportDetails: { serviceType: "Hire", ownerName: "Janaka Mendis", driverName: "Ruwan Mendis", phone: "0412345678", vehicleType: "Passenger Van", vehicleMake: "Toyota", vehicleModel: "HiAce", yearOfManufacture: "2021", transmission: "Auto", passengerCapacity: "14", luggageCapacity: "10", airConditioned: "Yes", baseCity: "Mirissa", airportTransfer: "Yes", driverNIC: "860130678V" } },
  ]);

  // 5 more Packages
  const pkgs = await Package.insertMany([
    { name: "Yala Leopard Safari (2 Days)", description: "Two-day luxury tented safari at Yala with 4x4 game drives morning and evening, famous for leopard sightings.", price: 42000, category: cats[4]._id, location: "Yala", creator: biz[0]._id, image: img("yala1"), images: [img("yala1"), img("yala2"), img("yala3")], listingType: "Package", itinerary: "Day 1: Afternoon game drive, bush dinner under stars. Day 2: Dawn drive, leopard tracking, departure.", inclusions: ["Tented Accommodation","All Meals","Game Drives","Naturalist Guide"], duration: "2 Days / 1 Night", isFeatured: true, views: 340 },
    { name: "Horton Plains Trek & World's End", description: "Early morning trek through cloud forest to World's End cliff with breathtaking 880m drop views.", price: 5800, category: cats[2]._id, location: "Horton Plains", creator: biz[1]._id, image: img("horton1"), images: [img("horton1"), img("horton2")], listingType: "Service", serviceCategory: "Guide", languages: ["English","Sinhala"], specialization: "Mountain Trekking", isFeatured: false, views: 175 },
    { name: "Polonnaruwa Village Homestay", description: "2-night authentic village stay with rice paddy walks, buffalo cart rides and traditional Sri Lankan cooking.", price: 9500, category: cats[3]._id, location: "Anuradhapura", creator: biz[2]._id, image: img("village1"), images: [img("village1"), img("village2")], listingType: "Service", serviceCategory: "Hotel Package", isFeatured: false, views: 112 },
    { name: "Hikkaduwa Reef Scuba Dive", description: "PADI guided scuba dive at Hikkaduwa Coral Sanctuary, suitable for beginners and experienced divers.", price: 8900, category: cats[1]._id, location: "Hikkaduwa", creator: biz[3]._id, image: img("scuba1"), images: [img("scuba1"), img("scuba2")], listingType: "Service", serviceCategory: "Guide", languages: ["English","German"], specialization: "Scuba & Reef Diving", isFeatured: true, views: 298 },
    { name: "Mirissa Whale Watching Cruise", description: "4-hour sunrise whale watching boat tour from Mirissa Harbour, highest blue whale sighting rate in the world.", price: 6200, category: cats[1]._id, location: "Mirissa", creator: biz[4]._id, image: img("whale1"), images: [img("whale1"), img("whale2")], listingType: "Service", serviceCategory: "Guide", languages: ["English"], specialization: "Marine Wildlife", isFeatured: true, views: 445 },
  ]);

  // 5 more Businesses
  await Business.insertMany([
    { name: "Yala Safari Camp",          owner: biz[0]._id, description: "Luxury tented safari camp at Yala",          category: "Hotel",     location: locs[0]._id, longitude: 81.5218, latitude: 6.3725, address: "Yala Buffer Zone, Tissamaharama", contact: "0472345678", email: "safari@yala.lk"    },
    { name: "Horton Trekkers",           owner: biz[1]._id, description: "Cloud forest trekking guides",               category: "Guides",    location: locs[2]._id, longitude: 80.7980, latitude: 6.8015, address: "Ohiya Road, Nuwara Eliya",        contact: "0522345678", email: "trek@horton.lk"    },
    { name: "Village Stay Polonnaruwa",  owner: biz[2]._id, description: "Rural village homestay experience",          category: "Hotel",     location: locs[0]._id, longitude: 81.0188, latitude: 7.9403, address: "Kaduruwela, Polonnaruwa",         contact: "0272345678", email: "stay@village.lk"   },
    { name: "Hikka Dive Centre",         owner: biz[3]._id, description: "PADI certified reef dive centre",            category: "Guides",    location: locs[3]._id, longitude: 80.1060, latitude: 6.1390, address: "Coral Gardens, Hikkaduwa",        contact: "0912345679", email: "dive@hikka.lk"     },
    { name: "Mirissa Whale Watching",    owner: biz[4]._id, description: "Whale and dolphin watching boat tours",      category: "Guides",    location: locs[0]._id, longitude: 80.4710, latitude: 5.9480, address: "Mirissa Harbour, Mirissa",        contact: "0412345678", email: "whales@mirissa.lk" },
  ]);

  // 5 more Bookings
  const bkgs = await Booking.insertMany([
    { packageId: pkgs[0]._id, customerId: trav[0]._id, startDate: new Date("2026-09-05"), endDate: new Date("2026-09-06"), numberOfDays: 2, chargePerUnit: 42000, totalCharge: 42000,  status: "Confirmed",  adminCommission: 4200,  providerEarnings: 37800 },
    { packageId: pkgs[1]._id, customerId: trav[1]._id, startDate: new Date("2026-09-10"), endDate: new Date("2026-09-10"), numberOfDays: 1, chargePerUnit: 5800,  totalCharge: 5800,   status: "Completed",  adminCommission: 580,   providerEarnings: 5220  },
    { packageId: pkgs[2]._id, customerId: trav[2]._id, startDate: new Date("2026-09-20"), endDate: new Date("2026-09-22"), numberOfDays: 2, chargePerUnit: 9500,  totalCharge: 19000,  status: "Confirmed",  adminCommission: 1900,  providerEarnings: 17100 },
    { packageId: pkgs[3]._id, customerId: trav[3]._id, startDate: new Date("2026-10-02"), endDate: new Date("2026-10-02"), numberOfDays: 1, chargePerUnit: 8900,  totalCharge: 8900,   status: "Completed",  adminCommission: 890,   providerEarnings: 8010  },
    { packageId: pkgs[4]._id, customerId: trav[4]._id, startDate: new Date("2026-10-08"), endDate: new Date("2026-10-08"), numberOfDays: 1, chargePerUnit: 6200,  totalCharge: 6200,   status: "Confirmed",  adminCommission: 620,   providerEarnings: 5580  },
  ]);

  // 5 more Payments
  await Payment.insertMany([
    { bookingId: bkgs[0]._id, customerId: trav[0]._id, amount: 42000, currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-011", status: "Completed", paidAt: new Date("2026-09-02") },
    { bookingId: bkgs[1]._id, customerId: trav[1]._id, amount: 5800,  currency: "LKR", paymentMethod: "Bank Transfer", transactionId: "TXN-BT-012", status: "Completed", paidAt: new Date("2026-09-08") },
    { bookingId: bkgs[2]._id, customerId: trav[2]._id, amount: 19000, currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-013", status: "Completed", paidAt: new Date("2026-09-18") },
    { bookingId: bkgs[3]._id, customerId: trav[3]._id, amount: 8900,  currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-014", status: "Completed", paidAt: new Date("2026-09-30") },
    { bookingId: bkgs[4]._id, customerId: trav[4]._id, amount: 6200,  currency: "LKR", paymentMethod: "Card",         transactionId: "TXN-PP-015", status: "Pending",   paidAt: new Date("2026-10-06") },
  ]);

  // 5 more Reviews
  await Review.insertMany([
    { packageId: pkgs[0]._id, userId: trav[0]._id, userName: "EmmaDavis",      rating: 5, comment: "Spotted 3 leopards on the morning drive! The tented camp was luxurious. Unforgettable experience." },
    { packageId: pkgs[1]._id, userId: trav[1]._id, userName: "OliverSmith",    rating: 5, comment: "World's End at sunrise was spiritual. Chaminda was brilliant — knew every plant and bird." },
    { packageId: pkgs[2]._id, userId: trav[2]._id, userName: "SofiaLopez",     rating: 4, comment: "Buffalo cart through the paddy fields was so authentic. Home-cooked rice and curry was delicious!" },
    { packageId: pkgs[3]._id, userId: trav[3]._id, userName: "AhmedKhalil",    rating: 5, comment: "Saw turtles and clown fish on the reef. Roshan is a superb instructor — very safe and fun." },
    { packageId: pkgs[4]._id, userId: trav[4]._id, userName: "IsabellaRossi",  rating: 5, comment: "Saw two blue whales and a dolphin pod! The crew was fantastic and the boat was very comfortable." },
  ]);

  // 5 more Trips
  await Trip.insertMany([
    { userId: trav[0]._id, tripTitle: "Safari & South Coast 5 Days", totalEstimatedCost: "LKR 92000", budget: "92000", days: 5, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-09-05", destination: "Colombo",   activities: ["Arrival","City tour","Pettah market"],           accommodation: "Colombo City Hotel" },
        { day: 2, date: "2026-09-06", destination: "Yala",      activities: ["Afternoon game drive","Bush dinner"],            accommodation: "Yala Safari Camp" },
        { day: 3, date: "2026-09-07", destination: "Yala",      activities: ["Dawn leopard drive","Depart for coast"],         accommodation: "Tangalle Beach Bungalow" },
        { day: 4, date: "2026-09-08", destination: "Mirissa",   activities: ["Whale watching cruise","Beach afternoon"],       accommodation: "Mirissa Beach Inn" },
        { day: 5, date: "2026-09-09", destination: "Galle",     activities: ["Fort walk","Shopping","Departure"],              accommodation: "Departure" },
      ], fullPlanDescription: "Safari meets southern beaches."
    },
    { userId: trav[1]._id, tripTitle: "Highlands & Trains 4 Days", totalEstimatedCost: "LKR 51000", budget: "51000", days: 4, members: 1, transport: "Train",
      itinerary: [
        { day: 1, date: "2026-10-10", destination: "Colombo",      activities: ["Arrival","Colombo Fort station"],             accommodation: "City Backpackers" },
        { day: 2, date: "2026-10-11", destination: "Nuwara Eliya", activities: ["Scenic train Kandy–Nuwara Eliya","Tea tour"], accommodation: "Grand Hotel NE" },
        { day: 3, date: "2026-10-12", destination: "Ella",         activities: ["Train to Ella","Nine Arches Bridge"],         accommodation: "Ella Eco Lodge" },
        { day: 4, date: "2026-10-13", destination: "Colombo",      activities: ["Train back","Departure"],                    accommodation: "Departure" },
      ], fullPlanDescription: "Best train journey in Asia."
    },
    { userId: trav[2]._id, tripTitle: "Beaches & Reefs 3 Days", totalEstimatedCost: "LKR 39000", budget: "39000", days: 3, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-11-01", destination: "Hikkaduwa",  activities: ["Reef snorkelling","Sunset beach"],             accommodation: "Hikkaduwa Beach Hotel" },
        { day: 2, date: "2026-11-02", destination: "Unawatuna",  activities: ["Jungle Beach swim","Rumassala Hill"],          accommodation: "Unawatuna Beach Resort" },
        { day: 3, date: "2026-11-03", destination: "Mirissa",    activities: ["Morning whale watching","Departure"],          accommodation: "Departure" },
      ], fullPlanDescription: "Three-beach coastal loop."
    },
    { userId: trav[3]._id, tripTitle: "Business & Culture 2 Days", totalEstimatedCost: "LKR 24000", budget: "24000", days: 2, members: 1, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-11-15", destination: "Colombo",    activities: ["Colombo City Tour","Dutch Hospital shopping","Cinnamon Grand dinner"], accommodation: "Shangri-La Colombo" },
        { day: 2, date: "2026-11-16", destination: "Kandy",      activities: ["Day trip to Kandy","Temple of Tooth","Departure"], accommodation: "Departure" },
      ], fullPlanDescription: "Short business trip with cultural highlights."
    },
    { userId: trav[4]._id, tripTitle: "Elephant & Nature 3 Days", totalEstimatedCost: "LKR 44000", budget: "44000", days: 3, members: 2, transport: "Car",
      itinerary: [
        { day: 1, date: "2026-12-01", destination: "Pinnawala",    activities: ["Elephant Orphanage","Feeding & bathing show"],  accommodation: "Pinnawala Hotel" },
        { day: 2, date: "2026-12-02", destination: "Udawalawe",    activities: ["Elephant Transit Home","4x4 safari"],           accommodation: "Safari Village Udawalawe" },
        { day: 3, date: "2026-12-03", destination: "Yala",         activities: ["Morning game drive","Depart Colombo"],          accommodation: "Departure" },
      ], fullPlanDescription: "Elephant-focused nature circuit."
    },
  ]);

  // 5 more Saved Packages
  await SavedPackage.insertMany([
    { userId: trav[0]._id, packageId: pkgs[4]._id, savedAt: new Date("2026-08-20") },
    { userId: trav[1]._id, packageId: pkgs[0]._id, savedAt: new Date("2026-08-22") },
    { userId: trav[2]._id, packageId: pkgs[3]._id, savedAt: new Date("2026-08-25") },
    { userId: trav[3]._id, packageId: pkgs[2]._id, savedAt: new Date("2026-08-28") },
    { userId: trav[4]._id, packageId: pkgs[1]._id, savedAt: new Date("2026-08-30") },
  ]);

  // 5 more Search Histories
  await SearchHistory.insertMany([
    { userId: trav[0]._id, keywords: "yala leopard safari tented camp",  budget: 50000,  days: 2, transport: "Car",   members: 2 },
    { userId: trav[1]._id, keywords: "horton plains world end trek",      budget: 12000,  days: 1, transport: "Car",   members: 1 },
    { userId: trav[2]._id, keywords: "village homestay rural sri lanka",  budget: 25000,  days: 2, transport: "Bus",   members: 2 },
    { userId: trav[3]._id, keywords: "hikkaduwa scuba diving reef",       budget: 20000,  days: 1, transport: "Car",   members: 1 },
    { userId: trav[4]._id, keywords: "mirissa whale watching boat tour",  budget: 10000,  days: 1, transport: "Bus",   members: 2 },
  ]);

  // 5 more Slips
  await Slip.insertMany([
    { bookingId: bkgs[0]._id, packageId: pkgs[0]._id, customerId: trav[0]._id, sellerId: biz[0]._id, packageName: pkgs[0].name, customerName: "EmmaDavis",      amount: 42000, startDate: new Date("2026-09-05"), endDate: new Date("2026-09-06") },
    { bookingId: bkgs[1]._id, packageId: pkgs[1]._id, customerId: trav[1]._id, sellerId: biz[1]._id, packageName: pkgs[1].name, customerName: "OliverSmith",    amount: 5800,  startDate: new Date("2026-09-10"), endDate: new Date("2026-09-10") },
    { bookingId: bkgs[2]._id, packageId: pkgs[2]._id, customerId: trav[2]._id, sellerId: biz[2]._id, packageName: pkgs[2].name, customerName: "SofiaLopez",     amount: 19000, startDate: new Date("2026-09-20"), endDate: new Date("2026-09-22") },
    { bookingId: bkgs[3]._id, packageId: pkgs[3]._id, customerId: trav[3]._id, sellerId: biz[3]._id, packageName: pkgs[3].name, customerName: "AhmedKhalil",    amount: 8900,  startDate: new Date("2026-10-02"), endDate: new Date("2026-10-02") },
    { bookingId: bkgs[4]._id, packageId: pkgs[4]._id, customerId: trav[4]._id, sellerId: biz[4]._id, packageName: pkgs[4].name, customerName: "IsabellaRossi",  amount: 6200,  startDate: new Date("2026-10-08"), endDate: new Date("2026-10-08") },
  ]);

  console.log("✅ Batch 3 complete — 5 more per collection added. Grand total ~15 each.");
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
