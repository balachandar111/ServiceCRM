const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================
   STATIC FILES
========================= */



/* =========================
   ROUTES
========================= */

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/organizations",
  require("./routes/organizationRoutes")
);

app.use(
  "/api/admins",
  require("./routes/adminRoutes")
);

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
 "/api/smartcalculator",
 require(
  "./routes/smartCalculatorRoutes"
 )
);
app.use(
 "/api/customers",
require(
  "./routes/customerRoutes"
 )
);




/* =========================
   TEST API
========================= */

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message: "CRM Backend Running Successfully 🚀"
  });

});

/* =========================
   404
========================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });

});

module.exports = app;