const mongoose =
require("mongoose");

const customerSchema =
new mongoose.Schema({

 name:{
  type:String,
 },

 company:String,

 phoneNumber:String,

 email:String,

 service:{
  type:String,
  default:"Service"
 },

 status:{
  type:String,
  default:"Waiting for Internal"
 },

 customerLevel:{
  type:String,
  default:"New"
 },

 callType:{
  type:String,
  default:"AMC"
 },

 leadStatus:{
  type:String,
  default:"Quotation Shared"
 },

 followUpType:{
  type:String,
  default:"Payment"
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

  gstType:{
   type:String,
   default:"GST"
  },

  quotationNumber:String

 },

 closedDetails:{

  engineers:[String],

  fieldEngineer:String,

  outsourceName:String,

  outsourceDate:Date,

  internalName:String,

  internalDate:Date,

  invoiceNumber:String

 },

 leadStage:{
  type:String,
  default:"Awareness"
 },

 priority:{
  type:String,
  default:"Medium"
 },

 source:{
  type:String,
  default:"Website"
 },

assignedTo:{
 type:String,
 default:""
},

 sector:String,
 expense:String,

 remark:String,

 createdBy:{
  type:
  mongoose.Schema.Types.ObjectId,

  ref:"User"
 }

},
{
 timestamps:true
});

module.exports =
mongoose.model(
 "Customer",
 customerSchema
);