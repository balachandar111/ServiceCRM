require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const cors = require("cors");

const userRoutes =
require("./routes/userRoutes");

const customerRoutes =
require("./routes/customerRoutes");


const adminRoutes =
require("./routes/adminRoutes");

const smartCalculatorRoutes =
require("./routes/smartCalculatorRoutes");

connectDB();

app.use(cors({
 origin: "*",
 credentials: true
}));

// Routes
app.use(
 "/api/users",
 userRoutes
);

app.use(
 "/api/admins",
 adminRoutes
);
app.use(
 "/api/customers",
 customerRoutes
);
app.use(
 "/api/smartcalculator",
 smartCalculatorRoutes
);

// Test Route
app.get("/", (req,res)=>{
 res.send("API Running");
});

const PORT =
process.env.PORT || 5000;

app.listen(PORT, ()=>{

 console.log(
  `Server Running On Port ${PORT}`
 );

});
