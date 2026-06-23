const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const XLSX = require("xlsx");
// =========================
                     
// =========================


exports.createUser = async (req, res) => {
  try {

    const existingUser =
      await User.findOne({
        username: req.body.username
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username Already Exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        req.body.password,
        10
      );

    // ===== ADD HERE =====

    if (
      req.body.leadStatus === "Closed" &&
      req.body.closedDetails &&
      !req.body.closedDetails.invoiceNumber
    ) {
      req.body.closedDetails.invoiceNumber =
        "INV-" + Date.now();
    }

    // ===== END =====

    const user = await User.create({

      ...req.body,

      password: hashedPassword,

      role: "USER",

      createdBy: req.user.id,

      organization: req.user.organization,

      approvalStatus: "PENDING",

      loginStatus: "INACTIVE",

    });

    res.status(201).json({

      success: true,

      message:
        "Lead Created Successfully",

      data: user

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

 exports.bulkUploadUsers = async (req, res) => {
 try {

  if (!req.file) {
   return res.status(400).json({
    success: false,
    message: "Excel file required"
   });
  }

  const workbook =
   XLSX.readFile(req.file.path);

  const sheetName =
   workbook.SheetNames[0];

  const data =
   XLSX.utils.sheet_to_json(
    workbook.Sheets[sheetName]
   );

  let usersToInsert = [];

  for (const item of data) {

   const existingUser =
    await User.findOne({
     username: item.username
    });

   if (existingUser) continue;

   const hashedPassword =
    await bcrypt.hash(
     item.password || "Password@123",
     10
    );

   usersToInsert.push({

    name: item.name,
    company: item.company,
    phoneNumber: item.phoneNumber,
    email: item.email,

    username: item.username,

    password: hashedPassword,

    service:
     item.service || "Service",

    status:
     item.status ||
     "Waiting for Internal",

    customerLevel:
     item.customerLevel || "New",

    callType:
     item.callType || "AMC",

    leadStatus:
     item.leadStatus ||
     "Quotation Shared",

    loginStatus:
     item.loginStatus ||
     "INACTIVE",

    followUpType:
     item.followUpType ||
     "Payment",

    followUpDate:
     item.followUpDate,

    leadStage:
     item.leadStage ||
     "Awareness",

    priority:
     item.priority ||
     "Medium",

    source:
     item.source ||
     "Website",

    assignedTo:
     item.assignedTo || "",

    sector:
     item.sector || "",

    remark:
     item.remark || "",

    role: "USER",

    createdBy:
     req.user.id,

    organization:
     req.user.organization,

    approvalStatus:
     "PENDING"
   });

  }

  await User.insertMany(
   usersToInsert
  );

  res.status(200).json({
   success: true,
   message:
    `${usersToInsert.length} Users Uploaded Successfully`
  });

 } catch (error) {

  console.log(error);

  res.status(500).json({
   success: false,
   message: error.message
  });

 }
};
// =========================
// GET ALL USERS OF ADMIN
exports.getUsers = async (req,res)=>{

 try{

  const users =
  await User.find({

   createdBy:req.user.id,

   role:"USER"

  }).select("-password");

  res.status(200).json({

   success:true,

   data:users

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};


// =========================
// GET SINGLE USER
// =========================
exports.getUser = async (req, res) => {

  try {

    const user = await User.findOne({

      _id: req.params.id,

      createdBy: req.user.id,

      role: "USER"

    }).select("-password");

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User Not Found"

      });

    }

    res.status(200).json({

      success: true,

      data: user

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =========================
// UPDATE USER
// =========================
exports.updateUser = async (req, res) => {
  try {

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    Object.assign(user, req.body);

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {

    console.log("UPDATE ERROR =>");
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =========================
// DELETE USER
// =========================
exports.deleteUser = async (req, res) => {

  try {

    const user = await User.findOne({

      _id: req.params.id,

      createdBy: req.user.id,

      role: "USER"

    });

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User Not Found"

      });

    }

    await user.deleteOne();

    res.status(200).json({

      success: true,

      message: "User Deleted Successfully"

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =========================
// ACTIVE / INACTIVE
// =========================
exports.changeUserStatus = async (req, res) => {

  try {

    const user = await User.findOne({

      _id: req.params.id,

      createdBy: req.user.id,

      role: "USER"

    });

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User Not Found"

      });

    }

    user.loginStatus =
      user.loginStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    await user.save();

    res.status(200).json({

      success: true,

      message: `User ${user.loginStatus}`,

      data: user

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =========================
// USER LOGIN
// =========================
exports.userLogin = async (req, res) => {

 try {

  const { username, password } = req.body;

  const user = await User.findOne({

   username,

   role: "USER"

  });

  if (!user) {

   return res.status(404).json({

    success: false,

    message: "User Not Found"

   });

  }

  // CHECK SUPER ADMIN APPROVAL

  if (user.approvalStatus !== "APPROVED") {

   return res.status(403).json({

    success: false,

    message: "Waiting For Super Admin Approval"

   });

  }

  // CHECK ACTIVE STATUS

  if (user.loginStatus !== "ACTIVE") {

   return res.status(403).json({

    success: false,

    message: "Account Disabled"

   });

  }

  const match = await bcrypt.compare(

   password,

   user.password

  );

  if (!match) {

   return res.status(400).json({

    success: false,

    message: "Invalid Password"

   });

  }

  const token = generateToken(user);

  res.status(200).json({

   success: true,

   token,

   user: {

    id: user._id,

    name: user.name,

    username: user.username,

    role: user.role,

    approvalStatus: user.approvalStatus,

    loginStatus: user.loginStatus

   }

  });

 }
 catch (error) {

  console.log(error);

  res.status(500).json({

   success: false,

   message: error.message

  });

 }

};
exports.getPendingLeads =
async(req,res)=>{

 try{

  const leads =
  await User.find({

   role:"USER",

   approvalStatus:
   "PENDING"

  });

  res.status(200).json({

   success:true,

   data:leads

  });

 }
 catch(error){

  console.log(error);

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.approveLead = async (req, res) => {

 try {

  const user = await User.findById(
   req.params.id
  );

  if (!user) {

   return res.status(404).json({

    success: false,

    message: "Lead Not Found"

   });

  }

  user.approvalStatus = "APPROVED";

  user.loginStatus = "ACTIVE";

  await user.save();

  res.status(200).json({

   success: true,

   message: "Lead Approved Successfully",

   data: user

  });

 }
 catch (error) {

  console.log(error);

  res.status(500).json({

   success: false,

   message: error.message

  });

 }

};

exports.rejectUser =
async(req,res)=>{

 try{

  await User.findByIdAndDelete(
   req.params.id
  );

  res.status(200).json({

   success:true,

   message:
   "Lead Rejected"

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};
exports.myProfile = async (req,res)=>{

 try{



  const user =
  await User.findById(
   req.user.id
  ).select("-password");



  res.status(200).json({
   success:true,
   data:user
  });

 }
 catch(error){

  console.log(error);

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};
exports.updateMyStatus =
async(req,res)=>{

 try{


  const user =
  await User.findById(
   req.user.id
  );

  console.log("FOUND USER =>", user);

  if(!user){

   return res.status(404).json({
    success:false,
    message:"User Not Found"
   });

  }

 user.status = req.body.status;
user.customerLevel = req.body.customerLevel;
user.callType = req.body.callType;

user.leadStage = req.body.leadStage;
user.priority = req.body.priority;
user.source = req.body.source;

user.assignedTo = req.body.assignedTo;
user.solution = req.body.solution;
user.product = req.body.product;
user.sector = req.body.sector;

user.remark = req.body.remark;

  await user.save();

  res.status(200).json({
   success:true,
   data:user
  });

 }
 catch(error){

  console.log(error);

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};