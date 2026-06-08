require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const Booking         = require("./src/models/Booking");
const Payment         = require("./src/models/Payment");
const User            = require("./src/models/User");
const Package         = require("./src/models/Package");
const BusinessRequest = require("./src/models/BusinessRequest");

/* ── helpers ─────────────────────────────────────────────── */
// Return a random Date within a given month (year, month 0-indexed)
function rndDate(year, month, dayFrom = 1, dayTo = 28) {
  const d = dayFrom + Math.floor(Math.random() * (dayTo - dayFrom));
  return new Date(year, month, d, 10, 0, 0);
}
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected — seeding 6-month historical data...\n");

  /* ── Load existing refs ─────────────────────────────────── */
  const packages   = await Package.find({}).select("_id price serviceCategory");
  const travellers = await User.find({ accountType: "user" }).select("_id country");
  const bizUsers   = await User.find({ accountType: "business" }).select("_id");

  if (!packages.length || !travellers.length) {
    console.error("Run seed.js first to create base data."); process.exit(1);
  }

  /* ── 6 months: Nov 2025 → Apr 2026 ─────────────────────── */
  const MONTHS = [
    { year: 2025, month: 10, label: "Nov 2025", bookCount: 8,  bizReg: 2 },
    { year: 2025, month: 11, label: "Dec 2025", bookCount: 14, bizReg: 3 },
    { year: 2026, month: 0,  label: "Jan 2026", bookCount: 10, bizReg: 1 },
    { year: 2026, month: 1,  label: "Feb 2026", bookCount: 12, bizReg: 2 },
    { year: 2026, month: 2,  label: "Mar 2026", bookCount: 16, bizReg: 4 },
    { year: 2026, month: 3,  label: "Apr 2026", bookCount: 18, bizReg: 3 },
  ];

  const hash = await bcrypt.hash("password123", 10);
  const COUNTRIES = ["United Kingdom","Germany","Australia","France","Japan","Canada","India","USA","Italy","Spain"];
  const CURRENCIES = { "United Kingdom":"GBP","Germany":"EUR","Australia":"AUD","France":"EUR","Japan":"JPY","Canada":"CAD","India":"INR","USA":"USD","Italy":"EUR","Spain":"EUR" };

  let totalBookings = 0, totalPayments = 0, totalBizRegs = 0;

  for (const m of MONTHS) {
    console.log(`📅 Seeding ${m.label} — ${m.bookCount} bookings, ${m.bizReg} biz registrations...`);

    /* ── Bookings + Payments ─────────────────────────────── */
    const bookingDocs = [];
    for (let i = 0; i < m.bookCount; i++) {
      const pkg     = pick(packages);
      const traveller = pick(travellers);
      const days    = rnd(1, 7);
      const charge  = pkg.price * days;
      const status  = pick(["Confirmed","Confirmed","Completed","Completed","Completed"]);
      const created = rndDate(m.year, m.month);
      const start   = new Date(created); start.setDate(start.getDate() + rnd(3, 14));
      const end     = new Date(start);   end.setDate(end.getDate() + days);

      bookingDocs.push({
        packageId:       pkg._id,
        customerId:      traveller._id,
        startDate:       start,
        endDate:         end,
        numberOfDays:    days,
        chargePerUnit:   pkg.price,
        totalCharge:     charge,
        status,
        adminCommission:  parseFloat((charge * 0.10).toFixed(2)),
        providerEarnings: parseFloat((charge * 0.90).toFixed(2)),
        createdAt:       created,
      });
    }

    // insertMany with timestamps=false so createdAt is respected
    const inserted = await Booking.collection.insertMany(bookingDocs);
    const ids = Object.values(inserted.insertedIds);

    // Payments for all bookings
    const paymentDocs = bookingDocs.map((b, idx) => ({
      bookingId:     ids[idx],
      customerId:    b.customerId,
      amount:        b.totalCharge,
      currency:      "LKR",
      paymentMethod: pick(["Card","Card","Card","Bank Transfer"]),
      transactionId: `TXN-HIST-${m.year}-${m.month}-${idx}`,
      status:        b.status === "Completed" ? "Completed" : "Completed",
      paidAt:        b.createdAt,
      createdAt:     b.createdAt,
    }));
    await Payment.collection.insertMany(paymentDocs);

    totalBookings += m.bookCount;
    totalPayments += m.bookCount;

    /* ── Business Registrations (pending/approved users) ─── */
    const bizDocs = [];
    for (let i = 0; i < m.bizReg; i++) {
      const country = "Sri Lanka";
      const idx2 = totalBizRegs + i;
      bizDocs.push({
        username:    `BizOwner${m.year}${m.month}${i}`,
        email:       `bizowner${m.year}${m.month}${i}@ceylonroam.lk`,
        password:    hash,
        accountType: pick(["pending","pending","business"]),
        country,
        dateOfBirth: new Date("1985-06-15"),
        currency:    "LKR",
        createdAt:   rndDate(m.year, m.month),
      });
    }
    const bizInserted = await User.collection.insertMany(bizDocs);
    const bizIds = Object.values(bizInserted.insertedIds);

    // Matching BusinessRequests
    const brDocs = bizDocs.map((u, i) => ({
      owner:    bizIds[i],
      category: pick(["Hotel","Guide","Transport"]),
      status:   u.accountType === "business" ? "approved" : "pending",
      createdAt: u.createdAt,
    }));
    await BusinessRequest.collection.insertMany(brDocs);

    totalBizRegs += m.bizReg;
    console.log(`   ✅ Done — bookings: ${m.bookCount}, biz regs: ${m.bizReg}`);
  }

  /* ── Bump package view counts to reflect historical traffic ── */
  const viewBumps = [
    { min: 50,  max: 200 },  // base bump per package
  ];
  const allPkgs = await Package.find({}).select("_id views");
  for (const p of allPkgs) {
    const bump = rnd(80, 350);
    await Package.findByIdAndUpdate(p._id, { $inc: { views: bump } });
  }
  console.log(`\n📈 Package view counts bumped (+80 to +350 per package)`);

  console.log(`\n✅ Historical seed complete!`);
  console.log(`   Bookings inserted:            ${totalBookings}`);
  console.log(`   Payments inserted:            ${totalPayments}`);
  console.log(`   Business Registrations added: ${totalBizRegs}`);
  console.log(`   Months covered:               Nov 2025 → Apr 2026`);

  await mongoose.disconnect();
}

run().catch(e => { console.error("❌", e.message); process.exit(1); });
