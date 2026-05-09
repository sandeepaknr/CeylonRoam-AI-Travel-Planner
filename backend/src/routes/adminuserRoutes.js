const express    = require("express");
const router     = express.Router();
const adminController = require("../controllers/adminuserController");

router.get("/users",                  adminController.getAllUsers);
router.delete("/users/suspend/:id",   adminController.suspendUser);
router.delete("/users/delete/:id",    adminController.deleteUserCascade);

module.exports = router;