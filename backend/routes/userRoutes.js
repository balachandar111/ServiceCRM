const express = require("express");
const router = express.Router();

const { protect } =
require("../middlewares/authMiddleware");

const {
 userLogin,
 createUser,
 getUsers,
 getUser,
 updateUser,
 deleteUser,
 changeUserStatus,
 myProfile, getPendingLeads,
 approveLead,
 rejectUser,
 updateMyStatus
} = require("../controllers/userController");

// PUBLIC
router.post("/login", userLogin);

router.get(
 "/pending",
 protect,
 getPendingLeads
);

router.put(
 "/approve/:id",
 protect,
 approveLead
);
// USER PROFILE
router.get(
 "/profile",
 protect,
 myProfile
);

router.put(
 "/my-status",
 protect,
 updateMyStatus
);

// USERS
router.post(
 "/",
 protect,
 createUser
);


router.get(
 "/",
 protect,
 getUsers
);

router.put(
 "/status/:id",
 protect,
 changeUserStatus
);

// KEEP THESE LAST
router.get(
 "/:id",
 protect,
 getUser
);

router.put(
 "/:id",
 protect,
 updateUser
);

router.delete(
 "/:id",
 protect,
 deleteUser
);

module.exports = router;