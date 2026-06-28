const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const resolveCreatedBy = require("../utils/resolve-created-by");
const XLSX = require("xlsx");
// =========================
                     
// =========================


exports.createUser = async(req,res)=>{

 try{

  const {
   name,
   username,
   password,
   role
  } = req.body;

  const exists =
  await User.findOne({
   username
  });

  if(exists){

   return res.status(400).json({

    success:false,

    message:"Username already exists"

   });

  }

  const hashedPassword =
  await bcrypt.hash(password,10);

  const user =
  await User.create({

   name,

   username,

   password:hashedPassword,

   role,

   createdBy:req.user.id,

   organization:req.user.organization

  });

  res.status(201).json({

   success:true,

   message:"User Created Successfully",

   data:user

  });

 }

 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

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
// ADMIN sees only users they created; SUPER_ADMIN sees all
exports.getUsers = async(req,res)=>{

 try{

  const filter = {};
  if (req.user.role === "ADMIN") {
    filter.createdBy = req.user.id;
    filter.role = "USER";
  }

  const users =
  await User.find(filter)

  .populate(
   "organization",
   "organizationName"
  )

  .select("-password");

  // NOTE: a User's createdBy is almost always the ADMIN who created
  // them, and Admins live in a separate collection from Users.
  // `.populate("createdBy", ...)` only checks the User collection, so
  // it used to silently null out createdBy for every such user — which
  // made the "users under this admin" cascading filter on the
  // SuperAdmin Customers screen come back empty. resolveCreatedBy
  // checks User, Admin, and SuperAdmin collections instead.
  const resolved = await resolveCreatedBy(users);

  res.json({

   success:true,

   data:resolved

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
exports.getUser = async(req,res)=>{

 try{

  const user =
  await User.findById(
   req.params.id
  )

  .populate(
   "organization",
   "organizationName"
  )

  .select("-password");

  if(!user){

   return res.status(404).json({

    success:false,

    message:"User Not Found"

   });

  }

  const resolved = await resolveCreatedBy(user);

  res.json({

   success:true,

   data:resolved

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
// =========================
// CHANGE LOGIN STATUS
// =========================

exports.changeLoginStatus = async (req, res) => {

 try {

  const { loginStatus } = req.body;

  if (
   !["Active", "Inactive"].includes(loginStatus)
  ) {

   return res.status(400).json({

    success: false,

    message: "Invalid Login Status"

   });

  }

  const user =
  await User.findById(req.params.id);

  if (!user) {

   return res.status(404).json({

    success: false,

    message: "User Not Found"

   });

  }

  user.loginStatus = loginStatus;

  await user.save();

  res.status(200).json({

   success: true,

   message:
   `User ${loginStatus} Successfully`,

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




  // CHECK ACTIVE STATUS

  if (user.loginStatus !== "Active") {

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