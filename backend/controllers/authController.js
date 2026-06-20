const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdmin = require("../models/SuperAdmin");


const User =
require("../models/User");
/*
|--------------------------------------------------------------------------
| Register Super Admin
|--------------------------------------------------------------------------
*/

exports.registerSuperAdmin = async (req, res) => {

  try {

    const {
      name,
      username,
      password,
      profile
    } = req.body;

    const existingUser =
      await SuperAdmin.findOne({
        username
      });

    if (existingUser) {

      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const superAdmin =
      await SuperAdmin.create({

        name,

        username,

        password: hashedPassword,

        profile

      });

    res.status(201).json({

      success: true,

      message:
      "Super Admin Created",

      data: superAdmin

    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/*
|--------------------------------------------------------------------------
| Login Super Admin
|--------------------------------------------------------------------------
*/

exports.loginSuperAdmin = async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    const admin =
      await SuperAdmin.findOne({
        username
      });

    if (!admin) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    if (admin.status === "INACTIVE") {

      return res.status(403).json({
        success: false,
        message: "Account Deactivated"
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Invalid Password"
      });

    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "SUPER_ADMIN"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({

      success: true,

      token,

      user: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: "SUPER_ADMIN"
      }

    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


exports.login = async (
 req,
 res
) => {

 try {

  const {
   username,
   password
  } = req.body;

  /*
  ===========================
  SUPER ADMIN LOGIN
  ===========================
  */

  const superAdmin =
  await SuperAdmin.findOne({
   username
  });

  if (superAdmin) {

   const match =
   await bcrypt.compare(
    password,
    superAdmin.password
   );

   if (!match) {

    return res.status(400).json({
     success:false,
     message:"Invalid Password"
    });

   }

   const token =
   jwt.sign(
    {
     id:superAdmin._id,
     role:"SUPER_ADMIN"
    },
    process.env.JWT_SECRET,
    {
     expiresIn:"7d"
    }
   );

   return res.status(200).json({

    success:true,

    token,

    role:"SUPER_ADMIN",

    user:{
     id:superAdmin._id,
     name:superAdmin.name,
     username:superAdmin.username
    }

   });

  }

  /*
  ===========================
  ADMIN / USER LOGIN
  ===========================
  */

  const user =
  await User.findOne({
   username
  });

  if (!user) {

   return res.status(404).json({
    success:false,
    message:"User Not Found"
   });

  }

  if (
   user.loginStatus ===
   "INACTIVE"
  ) {

   return res.status(403).json({

    success:false,

    message:
    "Account Disabled"

   });

  }

  const match =
  await bcrypt.compare(
   password,
   user.password
  );

  if (!match) {

   return res.status(400).json({
    success:false,
    message:"Invalid Password"
   });

  }

  const token =
  jwt.sign(
   {
    id:user._id,
    role:user.role
   },
   process.env.JWT_SECRET,
   {
    expiresIn:"7d"
   }
  );

  res.status(200).json({

   success:true,

   token,

   role:user.role,

   user:{

    id:user._id,

    name:user.name,

    username:user.username,

    role:user.role,

    organization:
    user.organization

   }

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};