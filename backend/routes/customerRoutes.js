const express =
require("express");

const router =

express.Router();
const upload =
require("../middlewares/upload");
const {
 createCustomer,
 getCustomers,
 getCustomer,
 updateCustomer,
 deleteCustomer,customerDashboard,bulkUploadCustomers,downloadCustomers,customerAnalytics
}
=
require(
 "../controllers/customerController"
);

const {
 protect
}
=
require(
 "../middlewares/authMiddleware"
);

router.post(
 "/",
 protect,
 createCustomer
);

router.get(
 "/",
 protect,
 getCustomers
);

router.get(
 "/:id",
 protect,
 getCustomer
);
router.post(
 "/bulk-upload",
 protect,
 upload.single("file"),
 bulkUploadCustomers
);
router.get(
 "/download",
 protect,
 downloadCustomers
);
router.get(
 "/analytics",
 protect,
 customerAnalytics
);

router.put(
 "/:id",
 protect,
 updateCustomer
);

router.delete(
 "/:id",
 protect,
 deleteCustomer
);
router.get(
 "/dashboard",
 protect,
 customerDashboard
);

module.exports =
router;