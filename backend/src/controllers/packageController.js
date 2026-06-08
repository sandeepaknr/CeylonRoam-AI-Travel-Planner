const Package  = require('../models/Package');
const Category = require('../models/Category');
const mongoose = require('mongoose');

/* ── helpers ──────────────────────────────────────────────── */
const parseArr = val =>
  typeof val === 'string'
    ? val.split(',').map(s => s.trim()).filter(Boolean)
    : Array.isArray(val) ? val : [];

/* ─────────────────────────────────────────────────────────────
   POST /api/packages
   Handles both listingType: 'Service' and listingType: 'Package'
   ───────────────────────────────────────────────────────────── */
exports.createPackage = async (req, res) => {
  try {
    const {
      name, description, price, category, location, creator,
      listingType,
      // Service fields
      serviceCategory, languages, specialization,
      pricingType, includedKM, extraKMCharge,
      // Package fields
      itinerary, inclusions, duration,
      // Map pin
      latitude, longitude,
    } = req.body;

    const imagePaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const imagePath  = imagePaths.length > 0 ? imagePaths[0] : null;
    const type      = listingType || 'Service';

    // ── Safe numeric parsers (FormData sends everything as strings) ──
    const safeNum = v => {
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    // ── category: empty string from FormData must become undefined,
    //    otherwise Mongoose throws "Cast to ObjectId failed for value ''"
    const categoryId = category && category.trim() !== '' ? category : undefined;

    const doc = new Package({
      name,
      description,
      price:       safeNum(price),      // guard against NaN
      category:    categoryId,          // undefined = omitted from doc (schema has no required)
      location,
      creator,
      image:       imagePath,
      listingType: type,

      // Map pin coordinates
      latitude:    latitude  && latitude  !== '' ? safeNum(latitude)  : null,
      longitude:   longitude && longitude !== '' ? safeNum(longitude) : null,

      // Service-only fields
      serviceCategory: serviceCategory || 'Hotel Package',
      languages:       parseArr(languages),
      specialization:  specialization  || '',
      pricingType:     pricingType     || '',
      includedKM:      includedKM  && String(includedKM).trim()  !== '' ? safeNum(includedKM)    : null,
      extraKMCharge:   extraKMCharge && String(extraKMCharge).trim() !== '' ? safeNum(extraKMCharge) : null,

      images:          imagePaths,

      // Package-only fields
      itinerary:  itinerary   || '',
      inclusions: parseArr(inclusions),
      duration:   duration    || '',
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('[createPackage]', err.message);   // visible in server logs
    res.status(500).json({ message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   PUT /api/packages/:id
   ───────────────────────────────────────────────────────────── */
exports.updatePackage = async (req, res) => {
  try {
    const {
      name, description, price, category, location,
      listingType,
      // Package fields
      itinerary, inclusions, duration,
      // Service fields
      serviceCategory, languages, specialization,
      pricingType, includedKM, extraKMCharge,
      // Location pin — FormData sends these as strings
      latitude, longitude,
    } = req.body;

    const safeNum = v => { const n = Number(v); return isNaN(n) ? null : n; };

    // Build update object with explicit safe parsing (mirrors createPackage)
    const updateData = {};

    if (name        !== undefined) updateData.name        = name;
    if (description !== undefined) updateData.description = description;
    if (location    !== undefined) updateData.location    = location;
    if (listingType !== undefined) updateData.listingType = listingType;

    // Price — FormData sends strings; guard NaN
    if (price !== undefined && price !== '') updateData.price = safeNum(price);

    // Category — empty string crashes Mongoose ObjectId cast
    if (category !== undefined) {
      updateData.category = category && category.trim() !== '' ? category : undefined;
    }

    // Map pin coordinates — FormData sends as strings, parse safely
    if (latitude  !== undefined && latitude  !== '') updateData.latitude  = safeNum(latitude);
    if (longitude !== undefined && longitude !== '') updateData.longitude = safeNum(longitude);

    // Package-only fields
    if (itinerary  !== undefined) updateData.itinerary  = itinerary;
    if (duration   !== undefined) updateData.duration   = duration;
    if (inclusions !== undefined) updateData.inclusions = parseArr(inclusions);

    // Service-only fields
    if (serviceCategory !== undefined) updateData.serviceCategory = serviceCategory;
    if (specialization  !== undefined) updateData.specialization  = specialization;
    if (languages       !== undefined) updateData.languages       = parseArr(languages);

    // Numeric vehicle fields
    if (includedKM    !== undefined && String(includedKM).trim()    !== '')
      updateData.includedKM    = safeNum(includedKM);
    if (extraKMCharge !== undefined && String(extraKMCharge).trim() !== '')
      updateData.extraKMCharge = safeNum(extraKMCharge);

    // pricingType — auto-set by serviceCategory if not explicitly sent
    if (pricingType !== undefined) {
      updateData.pricingType = pricingType;
    } else if (serviceCategory) {
      if (serviceCategory === 'Hire Vehicle') updateData.pricingType = 'Per KM';
      else if (['Guide','Chauffeur Guide','Rent Vehicle'].includes(serviceCategory))
        updateData.pricingType = 'Per Day';
    }

    // Images — only replace if new files uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => `/uploads/${f.filename}`);
      updateData.image  = updateData.images[0];
    }

    const updated = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },   // explicit $set prevents accidental field removal
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: 'Package not found' });
    res.json(updated);
  } catch (err) {
    console.error('[updatePackage]', err.message);
    res.status(500).json({ message: err.message });
  }
};


/* ─────────────────────────────────────────────────────────────
   DELETE /api/packages/:id
   ───────────────────────────────────────────────────────────── */
exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* ─────────────────────────────────────────────────────────────
   GET /api/packages
   Supports ?creator=  ?listingType=Service|Package filtering
   ───────────────────────────────────────────────────────────── */
exports.getAllPackages = async (req, res) => {
  try {
    const query = {};
    
    if (req.query.creator && req.query.creator !== 'undefined') {
      try {
        query.creator = new mongoose.Types.ObjectId(req.query.creator);
      } catch (e) {
        return res.status(400).json({ message: "Invalid creator ID format" });
      }
    }
    
    if (req.query.listingType && req.query.listingType !== 'undefined') {
      query.listingType = req.query.listingType;
    }

    console.log('[getAllPackages] Final Query:', query);

    const packages = await Package.find(query).populate('category creator', '-password');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/packages/:id
   ───────────────────────────────────────────────────────────── */
exports.getPackageById = async (req, res) => {
  try {
    // Atomically increment the view counter, then return the updated doc
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category creator', '-password');
    if (!pkg) return res.status(404).json({ message: 'Not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/packages/categories
   ───────────────────────────────────────────────────────────── */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   PATCH /api/packages/:id/featured
   Admin: toggle isFeatured on any listing
   ───────────────────────────────────────────────────────────── */
exports.toggleFeatured = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Listing not found' });
    pkg.isFeatured = !pkg.isFeatured;
    await pkg.save();
    res.json({ _id: pkg._id, isFeatured: pkg.isFeatured });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};