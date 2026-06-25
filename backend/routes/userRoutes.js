const express = require("express");
const router = express.Router();

const { protect } =
require("../middlewares/authMiddleware");

const uploadExcel =
require("../middlewares/uploadExcel");

const {

 createUser,
 bulkUploadUsers,
 getUsers,
 getUser,
 updateUser,
 deleteUser,
 changeLoginStatus,
 userLogin,
 myProfile

} = require("../controllers/userController");


// =======================
// PUBLIC
// =======================

router.post(
 "/login",
 userLogin
);


// =======================
// BULK UPLOAD
// =======================

router.post(
 "/bulk-upload",
 protect,
 uploadExcel.single("file"),
 bulkUploadUsers
);


// =======================
// PROFILE
// =======================

router.get(
 "/profile",
 protect,
 myProfile
);


// =======================
// CREATE USER
// =======================

router.post(
 "/",
 protect,
 createUser
);


// =======================
// GET USERS
// =======================

router.get(
 "/",
 protect,
 getUsers
);


// =======================
// CHANGE LOGIN STATUS
// =======================

router.put(
 "/status/:id",
 protect,
 changeLoginStatus
);


// =======================
// GET SINGLE USER
// =======================

router.get(
 "/:id",
 protect,
 getUser
);


// =======================
// UPDATE USER
// =======================

router.put(
 "/:id",
 protect,
 updateUser
);


// =======================
// DELETE USER
// =======================

router.delete(
 "/:id",
 protect,
 deleteUser
);

module.exports = router;