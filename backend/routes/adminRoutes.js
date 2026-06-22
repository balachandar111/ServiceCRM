const express =
require("express");

const router =
express.Router();

const {
protect
} = require(
"../middlewares/authMiddleware"
);

const {
authorizeRoles
} = require(
"../middlewares/roleMiddleware"
);

const {

createAdmin,

getAdmins,

getAdmin,

updateAdmin,

changeAdminStatus,

deleteAdmin,

adminLogin,  getAllAdmins,
  getAdminAnalytics,getAdminDashboard

} = require(
"../controllers/adminController"
);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post(
"/login",
adminLogin
);

/*
|--------------------------------------------------------------------------
| SUPER ADMIN ONLY
|--------------------------------------------------------------------------
*/

router.post(
"/",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
createAdmin
);
// routes/adminRoutes.js

router.get("/all-admins", getAllAdmins);

router.get(
  "/admin-analytics/:id",
  getAdminAnalytics
);
router.get(
  "/dashboard/:id",
  getAdminDashboard
);

router.get(
"/",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
getAdmins
);

router.get(
"/:id",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
getAdmin
);

router.put(
"/:id",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
updateAdmin
);

router.put(
"/status/:id",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
changeAdminStatus
);

router.delete(
"/:id",
protect,
authorizeRoles(
"SUPER_ADMIN"
),
deleteAdmin
);

module.exports =
router;