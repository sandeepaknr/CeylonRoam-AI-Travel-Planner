require("dotenv").config();
const mongoose = require("mongoose");
const Package  = require("./src/models/Package");
const User     = require("./src/models/User");
const Category = require("./src/models/Category");

const img = (id) => `https://picsum.photos/seed/${id}/800/600`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — adding 2 packages per section (8 total)...");

  const biz  = await User.find({ accountType: "business" }).limit(5);
  if (!biz.length) { console.error("No business users found."); process.exit(1); }

  // Resolve category IDs by name
  const catDocs = await Category.find({});
  const cat = (name) => catDocs.find(c => c.name === name)?._id;

  await Package.insertMany([

    // ── ADVENTURE TOURS (2) ──────────────────────────────────
    {
      name: "3-Day White Water Rafting & Jungle Trek",
      description: "Tackle grade 3-4 rapids on the Kelani River, trek through Sinharaja rainforest canopy and abseil down a 60-metre jungle waterfall for the ultimate Sri Lanka adrenaline trip.",
      price: 58000,
      category: cat("Adventure"),
      location: "Kitulgala",
      creator: biz[0]._id,
      image: img("rafting1"),
      images: [img("rafting1"), img("rafting2"), img("rafting3")],
      listingType: "Package",
      itinerary: "Day 1: Colombo → Kitulgala — safety briefing, grade 3-4 white water rafting (Kelani River), cliff jumping. Day 2: Sinharaja Rainforest — guided canopy trek, endemic bird watching, waterfall abseil. Day 3: Zip-lining & jungle rope course → Colombo, departure.",
      inclusions: ["2-Night Eco Lodge","All Meals","Rafting Safety Gear","Certified Rafting Guide","Sinharaja Entry","Abseil Equipment","Zip-line"],
      duration: "3 Days / 2 Nights",
      isFeatured: true,
      views: 412,
    },
    {
      name: "2-Day Rock Climbing & Camping at Sigiriya",
      description: "Climb the ancient Lion Rock fortress at sunrise, then camp under the stars in the Sigiriya wilderness before tackling Pidurangala Rock's sheer face with a certified climbing guide.",
      price: 38000,
      category: cat("Adventure"),
      location: "Sigiriya",
      creator: biz[1]._id,
      image: img("rockclimb1"),
      images: [img("rockclimb1"), img("rockclimb2")],
      listingType: "Package",
      itinerary: "Day 1: Arrive Sigiriya — Sigiriya Rock fortress climb (sunrise), frescoes & mirror wall, afternoon Pidurangala rock climbing with guide, wilderness camp setup, bonfire dinner. Day 2: Dawn hike to Pidurangala summit, wildlife walk in Sigiriya forest, depart.",
      inclusions: ["1-Night Wilderness Camp","Camp Meals","Climbing Harness & Gear","Certified Guide","Sigiriya & Pidurangala Entries","Bonfire Dinner"],
      duration: "2 Days / 1 Night",
      isFeatured: false,
      views: 298,
    },

    // ── AYURVEDA & WELLNESS TOURS (2) ────────────────────────
    {
      name: "7-Day Deep Ayurveda Panchakarma Detox",
      description: "A medically supervised Panchakarma cleanse — the gold standard of Ayurvedic detoxification. Seven days of herbal treatments, therapeutic diets and daily yoga by the river at an authentic Ayurvedic retreat.",
      price: 185000,
      category: cat("Ayurveda & Wellness"),
      location: "Bentota",
      creator: biz[2]._id,
      image: img("panchakarma1"),
      images: [img("panchakarma1"), img("panchakarma2"), img("panchakarma3")],
      listingType: "Package",
      itinerary: "Day 1: Arrival, physician consultation & body constitution assessment (Prakriti). Day 2-3: Poorvakarma — body preparation with oil application & steam bath. Day 4-5: Virechana & Basti treatments (core Panchakarma). Day 6: Rasayana rejuvenation — herbal tonics, nourishing massage. Day 7: Final consultation, lifestyle guidance, departure.",
      inclusions: ["6-Night Ayurvedic Resort","Full Sattvic Board (3 Meals)","All Panchakarma Treatments","2x Daily Yoga","Doctor Consultations","Herbal Medicines","River Yoga Pavilion"],
      duration: "7 Days / 6 Nights",
      isFeatured: true,
      views: 534,
    },
    {
      name: "4-Day Mindfulness & Forest Bathing Retreat",
      description: "Reconnect with nature through Japanese Shinrin-yoku forest bathing in Sinharaja, silent meditation walks, sound healing and an organic farm-to-table cooking experience.",
      price: 76000,
      category: cat("Ayurveda & Wellness"),
      location: "Sinharaja",
      creator: biz[3]._id,
      image: img("forest_bath1"),
      images: [img("forest_bath1"), img("forest_bath2"), img("forest_bath3")],
      listingType: "Package",
      itinerary: "Day 1: Arrival at eco-retreat, grounding ceremony, evening sound bath with singing bowls. Day 2: Sinharaja forest bathing walk (3h, guided), afternoon yoga nidra, organic dinner. Day 3: Silent morning meditation, herb garden walk, Ayurvedic cooking class. Day 4: Sunrise breathwork session, departure blessing ceremony.",
      inclusions: ["3-Night Eco Retreat","All Organic Meals","Forest Bathing Guide","Daily Yoga & Meditation","Sound Healing Session","Cooking Class","Herbal Tea Ceremony"],
      duration: "4 Days / 3 Nights",
      isFeatured: false,
      views: 321,
    },

    // ── BEACH & COASTAL TOURS (2) ────────────────────────────
    {
      name: "5-Day Ultimate South Coast Beach Hop",
      description: "Surf Hikkaduwa, snorkel Unawatuna reef, watch whales in Mirissa, turtle-track in Rekawa and finish with Galle Fort's colonial charm — Sri Lanka's south coast at its finest.",
      price: 84000,
      category: cat("Beach & Coastal"),
      location: "Hikkaduwa",
      creator: biz[4]._id,
      image: img("beachhop1"),
      images: [img("beachhop1"), img("beachhop2"), img("beachhop3")],
      listingType: "Package",
      itinerary: "Day 1: Colombo → Hikkaduwa — coral reef snorkelling, beach sunset. Day 2: Hikkaduwa surfing lesson, Tsunami Museum, Negombo lunch. Day 3: Unawatuna — Jungle Beach, glass-bottom boat reef tour, Rumassala Hill. Day 4: Mirissa — blue whale watching cruise at dawn, dolphin sighting, Parrot Rock. Day 5: Rekawa turtle hatching (night visit) → Galle Fort walk, departure.",
      inclusions: ["4-Night Beachfront Accommodation","Daily Breakfast","Surf Lesson","Snorkelling Gear","Whale Watching Boat","Glass-Bottom Boat","Turtle Watch","Galle Fort Tour","AC Transport"],
      duration: "5 Days / 4 Nights",
      isFeatured: true,
      views: 601,
    },
    {
      name: "3-Day Trincomalee East Coast Paradise",
      description: "Explore Sri Lanka's best-kept secret — turquoise Nilaveli Beach, Pigeon Island's rainbow coral, the sacred Koneswaram cliff temple and hot springs in the jungle.",
      price: 55000,
      category: cat("Beach & Coastal"),
      location: "Trincomalee",
      creator: biz[0]._id,
      image: img("trinco_beach1"),
      images: [img("trinco_beach1"), img("trinco_beach2"), img("trinco_beach3")],
      listingType: "Package",
      itinerary: "Day 1: Colombo → Trincomalee — Koneswaram Kovil cliff temple, Fort Frederick, Lovers' Leap viewpoint, Uppuveli beach sunset. Day 2: Nilaveli — Pigeon Island National Park snorkelling (coral garden, reef sharks), beach afternoon. Day 3: Kanniya Hot Springs, Trinco Harbour, local seafood lunch → departure.",
      inclusions: ["2-Night Beachfront Hotel","Daily Breakfast","Boat to Pigeon Island","Snorkelling Gear & Guide","Temple & Fort Entries","Hot Springs Visit","AC Transport"],
      duration: "3 Days / 2 Nights",
      isFeatured: false,
      views: 387,
    },

    // ── NIGHT SAFARI TOURS (2) ───────────────────────────────
    {
      name: "2-Day Yala Night Safari & Leopard Tracking",
      description: "The only night safari experience in Yala — track leopards by spotlight, listen to elephants in the dark and sleep in a luxury tented camp as the jungle comes alive after dusk.",
      price: 95000,
      category: cat("Night Safari"),
      location: "Yala",
      creator: biz[1]._id,
      image: img("nightsafari1"),
      images: [img("nightsafari1"), img("nightsafari2"), img("nightsafari3")],
      listingType: "Package",
      itinerary: "Day 1: Colombo → Yala (4h) — check into luxury tented camp, afternoon 4x4 game drive (leopard, elephant, sloth bear), bush dinner under stars, night spotlight safari 9PM-11PM. Day 2: 5AM dawn drive (best leopard hour), breakfast in the bush, morning walk with naturalist, depart by noon.",
      inclusions: ["1-Night Luxury Tented Camp","Full Board","Afternoon Game Drive","Night Spotlight Safari","Dawn Game Drive","Bush Breakfast","Naturalist Guide","4x4 Jeep"],
      duration: "2 Days / 1 Night",
      isFeatured: true,
      views: 478,
    },
    {
      name: "3-Day Wilpattu Night Safari & Ancient Ruins",
      description: "Sri Lanka's oldest national park offers a completely different Big Five experience — dense forest, natural lakes (villus), sloth bears and leopards, with a night drive and Anuradhapura ancient city as a bonus.",
      price: 67000,
      category: cat("Night Safari"),
      location: "Wilpattu",
      creator: biz[2]._id,
      image: img("wilpattu1"),
      images: [img("wilpattu1"), img("wilpattu2"), img("wilpattu3")],
      listingType: "Package",
      itinerary: "Day 1: Colombo → Wilpattu — afternoon safari drive through dense forest & villus lakes (leopard, sloth bear, deer). Day 2: Dawn drive 5AM — best wildlife hour at waterholes, afternoon rest, night drive 7PM (spotlight leopard & eye-shine tracking). Day 3: Wilpattu → Anuradhapura — Sacred Bodhi Tree, Ruwanwelisaya Stupa → Colombo.",
      inclusions: ["2-Night Safari Lodge","Full Board","2x Day Game Drives","1x Night Spotlight Drive","Naturalist Guide","4x4 Safari Jeep","Anuradhapura Tour","All Park Fees"],
      duration: "3 Days / 2 Nights",
      isFeatured: false,
      views: 341,
    },
  ]);

  console.log("✅ 8 packages added: 2 each for Adventure, Ayurveda & Wellness, Beach & Coastal, Night Safari.");
  await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
