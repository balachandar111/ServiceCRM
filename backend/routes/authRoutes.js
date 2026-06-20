const express = require("express");

const router = express.Router();

const {

  registerSuperAdmin,

  loginSuperAdmin,login

} = require(
  "../controllers/authController"
);

router.post(
  "/super-admin/register",
  registerSuperAdmin
);



router.post(
 "/login",
 login
);

module.exports = router;