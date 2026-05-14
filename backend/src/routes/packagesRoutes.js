const express = require('express');
const router  = express.Router();
const upload  = require('../middlewares/upload');
const {
    createPackage,
    updatePackage,
    deletePackage,
    getAllPackages,
    getPackageById,
    getCategories,
    toggleFeatured,
} = require('../controllers/packageController');

router.get('/',           getAllPackages);
router.get('/categories', getCategories);

// ── Admin actions (must be before /:id wildcard) ──
router.patch('/:id/featured', toggleFeatured);

router.get('/:id',  getPackageById);
router.post('/',    upload.array('images', 5), createPackage);
router.put('/:id',  upload.array('images', 5), updatePackage);
router.delete('/:id', deletePackage);

module.exports = router;