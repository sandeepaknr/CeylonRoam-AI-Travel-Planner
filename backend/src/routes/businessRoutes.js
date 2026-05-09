const router = require("express").Router();
const bizCtrl = require("../controllers/businessController");


router.post("/", bizCtrl.registerBusiness);
router.post("/request", bizCtrl.requestBusinessRegistration);
router.get("/businesses", bizCtrl.getAllBusinesses);
router.get("/business-details", bizCtrl.getDetailedBusinesses);
router.delete("/business/suspend/:id", bizCtrl.suspendBusiness);
router.get("/pending-requests", bizCtrl.getPendingRequests);
router.post("/approve", bizCtrl.approveBusiness);
router.put("/:id", bizCtrl.updateBusiness);
router.get("/user/:userId", bizCtrl.getUserBusiness);
router.get("/package-info/:packageId", bizCtrl.getBusinessByPackage);
router.get("/stats/:userId", bizCtrl.getBusinessStats);

module.exports = router;