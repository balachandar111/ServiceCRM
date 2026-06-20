require("dotenv").config();

const app = require("./app");

const connectDB =
require("./config/db");
const cors = require("cors");

connectDB();
app.use(cors({
  origin: "*",
  credentials: true,
}));

const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );

});
const userRoutes =
require("./routes/userRoutes");

app.use(
 "/api/users",
 userRoutes
);
