const express =
require("express");

const router =
express.Router();

const upload =
require("../middlewares/upload");

const {
 createSmartCalculator,
 getSmartCalculators
}
=
require(
 "../controllers/smartCalculatorController"
);

router.post(
 "/create",
 upload.single("file"),
 createSmartCalculator
);

router.get(
 "/all",
 getSmartCalculators
);

module.exports =
router;