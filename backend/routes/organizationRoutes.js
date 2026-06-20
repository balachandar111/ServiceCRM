const express = require("express");

const router =
express.Router();



const {
    protect
} = require("../middlewares/authMiddleware");

const {
    authorizeRoles
} = require("../middlewares/roleMiddleware");

const {

    createOrganization,

    getOrganizations,

    getOrganization,

    updateOrganization,

    deleteOrganization

} = require(
    "../controllers/organizationController"
);

router.post(
    "/",
    protect,
    authorizeRoles("SUPER_ADMIN"),
   
    createOrganization
);

router.get(
    "/",
    protect,
    authorizeRoles("SUPER_ADMIN"),
    getOrganizations
);

router.get(
    "/:id",
    protect,
    authorizeRoles("SUPER_ADMIN"),
    getOrganization
);

router.put(
    "/:id",
    protect,
    authorizeRoles("SUPER_ADMIN"),
  
    updateOrganization
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("SUPER_ADMIN"),
    deleteOrganization
);

module.exports = router;