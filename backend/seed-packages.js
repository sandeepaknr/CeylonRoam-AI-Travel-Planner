require("dotenv").config();
const mongoose = require("mongoose");
const Package = require("./src/models/Package");
const User    = require("./src/models/User");

const img = (id) => `https://picsum.photos/seed/${id}/800/600`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — adding 5 more packages...");

  // Grab existing business users to use as creators
  const biz = await User.find({ accountType: "business" }).limit(5);

  await Package.insertMany([
    {
      name: "Sigiriya Rock & Dambulla Cave Day Tour",
      description: "Visit the iconic 5th-century Lion Rock fortress and the ancient Dambulla Cave Temple with golden Buddha statues — two UNESCO sites in one day.",
      price: 9800,
      location: "Sigiriya",
      creator: biz[0]._id,
      image: img("sigiriya1"),
      images: [img("sigiriya1"), img("sigiriya2"), img("sigiriya3")],
      listingType: "Service",
      serviceCategory: "Guide",
      languages: ["English", "Sinhala"],
      specialization: "UNESCO Heritage Sites",
      isFeatured: true,
      views: 387,
    },
    {
      name: "Bentota River & Mangrove Safari",
      description: "Relaxing boat safari through Bentota lagoon and mangrove forests, spotting monitor lizards, kingfishers and exotic birds.",
      price: 4200,
      location: "Bentota",
      creator: biz[1]._id,
      image: img("bentota1"),
      images: [img("bentota1"), img("bentota2")],
      listingType: "Service",
      serviceCategory: "Guide",
      languages: ["English"],
      specialization: "River & Eco Safari",
      isFeatured: false,
      views: 143,
    },
    {
      name: "Nuwara Eliya Premium Chalet",
      description: "Cozy mountain chalet surrounded by tea estates in Little England of Sri Lanka. Wood fireplace, valley views and English breakfast included.",
      price: 22000,
      location: "Nuwara Eliya",
      creator: biz[2]._id,
      image: img("nuwara1"),
      images: [img("nuwara1"), img("nuwara2"), img("nuwara3")],
      listingType: "Service",
      serviceCategory: "Hotel Package",
      isFeatured: true,
      views: 276,
    },
    {
      name: "10-Day Ultimate Sri Lanka Grand Tour",
      description: "The most comprehensive Sri Lanka circuit — ancient cities, hill country trains, wildlife safari, whale watching and southern beaches in one epic journey.",
      price: 195000,
      location: "Colombo",
      creator: biz[3]._id,
      image: img("grandtour1"),
      images: [img("grandtour1"), img("grandtour2"), img("grandtour3"), img("grandtour4")],
      listingType: "Package",
      itinerary: "Day 1: Colombo arrival. Day 2: Sigiriya & Dambulla. Day 3: Polonnaruwa ancient city. Day 4: Kandy cultural tour. Day 5: Scenic train to Ella. Day 6: Horton Plains trek. Day 7: Nuwara Eliya tea estate. Day 8: Yala safari. Day 9: Mirissa whale watching. Day 10: Galle Fort & departure.",
      inclusions: ["All Hotels", "All Breakfasts & Dinners", "Private AC Vehicle", "Expert Guide", "All Entrance Fees", "Whale Watching", "Safari Game Drive"],
      duration: "10 Days / 9 Nights",
      isFeatured: true,
      views: 712,
    },
    {
      name: "Colombo City Tuk Tuk Food Tour",
      description: "Explore Colombo's vibrant street food scene by tuk tuk — Pettah market, Kottu Roti stalls, hoppers spots, and rooftop sunset cocktails.",
      price: 3800,
      location: "Colombo",
      creator: biz[4]._id,
      image: img("colombo1"),
      images: [img("colombo1"), img("colombo2")],
      listingType: "Service",
      serviceCategory: "Guide",
      languages: ["English", "Sinhala"],
      specialization: "Street Food & Culture",
      isFeatured: false,
      views: 201,
    },
  ]);

  console.log("✅ 5 more packages added successfully.");
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
