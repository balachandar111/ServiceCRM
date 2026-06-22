const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

 name:{
  type:String,
  required:true
 },

 company:String,

 phoneNumber:String,

 email:String,

 username:{
  type:String,
  unique:true,
  required:true
 },

 password:{
  type:String,
  required:true
 },

 role:{
  type:String,
  enum:[
   "USER",
   "ADMIN",
   "SUPER_ADMIN"
  ],
  default:"USER"
 },

 organization:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Organization"
 },

 createdBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Admin"
 },

approvalStatus: {

 type: String,

 enum: [
  "PENDING",
  "APPROVED",
  "REJECTED"
 ],

 default: "PENDING"

},

loginStatus: {

 type: String,

 enum: [
  "ACTIVE",
  "INACTIVE"
 ],

 default: "INACTIVE"

},

 service:String,

 status:String,

 customerLevel:String,

 callType:String,

 leadStatus:String,

 followUpType:{
  type:String,
  enum:[
   "Payment",
   "Calls",
   "Both"
  ]
 },

 followUpDate:Date,

 quotationShared:{

  whatsappShared:{
   type:Boolean,
   default:false
  },

  emailShared:{
   type:Boolean,
   default:false
  },

  gstType:String,

  quotationNumber:String

 },

 closedDetails:{

  engineers:[String],

  fieldEngineer:String,

  outsourceName:String,

  outsourceDate:Date,

  internalName:String,

  internalDate:Date,

invoiceNumber: {
  type: String,
  default: null
}

 },
 leadStage:{
 type:String,
 enum:[
  "Awareness",
  "Interest",
  "Desire",
  "Closure"
 ],
 default:"Awareness"
},

priority:{
 type:String,
 enum:[
  "Low",
  "Medium",
  "High"
 ],
 default:"Medium"
},

source:{
 type:String,
 enum:[
  "Website",
  "Social media",
  "Expo",
  "Referral"
 ],
 default:"Website"
},

assignedTo:String,

solution:String,

product:String,

sector:String,

remark:{
 type:String,
 default:""
},

lastRemarks:[
 {
  remark:String,
  updatedAt:{
   type:Date,
   default:Date.now
  }
 }
],
createdBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Admin"
},



},
{
 timestamps:true
});


module.exports =
mongoose.model(
 "User",
 userSchema
);