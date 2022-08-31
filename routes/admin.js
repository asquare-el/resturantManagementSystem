const express = require("express");
require("dotenv").config();
const router = express.Router();
const admin = require("../controller/admin");
const { checkAdmin } = require("../middleware/checkAdmin");
const auth = require("../middleware/index");
const {
  validateRegister,
  validatelogin,
  validateResturant,
  validateDish,
} = require("../middleware/validate");

router.post("/login", validatelogin, admin.login);
router.post(
  "/add-resturant",
  validateResturant,
  auth.authenticateToken,
  checkAdmin,
  admin.addResturant
);
router.post(
  "/:id/add-dish",
  validateDish,
  auth.authenticateToken,
  checkAdmin,
  admin.addDish
);
router.post(
  "/create-subadmin",
  validateRegister,
  auth.authenticateToken,
  checkAdmin,
  admin.createSubadmin
);
router.post(
  "/create-user",
  validateRegister,
  auth.authenticateToken,
  checkAdmin,
  admin.createUser
);
router.post(
  "/fetch-subadmin",
  auth.authenticateToken,
  checkAdmin,
  admin.fetchSubadmin
);
router.post("/fetch-user", auth.authenticateToken, checkAdmin, admin.fetchUser);
router.post(
  "/fetch-address",
  auth.authenticateToken,
  checkAdmin,
  admin.fetchAddress
);

module.exports = router;
