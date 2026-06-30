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

 serviceNumber:{
  type:String,
  default:""
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

  // "internal" | "outsource" - which path was chosen in the Closed popup
  closedType:{
   type:String,
   default:""
  },

  engineers:[String],

  fieldEngineer:String,

  outsourceName:String,

  // reference to the Customer selected from the searchable outsource dropdown
  outsourceCustomerId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"Customer",
   default:null
  },

  outsourceDate:Date,

  internalName:String,

  internalDate:Date,

  invoiceNumber:String,

  // Total closed amount entered in the "Bottom Line" popup, before
  // it gets split into the allocation below.
  bottomLine:{
   type:String,
   default:""
  },

  // Bottom line allocation - split of the closed amount between
  // Account Manager / Backend Support / Service Delivery.
  // Saving this on a "Closed" customer auto-triggers an incentive
  // approval request for the admin (see triggerIncentiveApproval
  // in customerController.js).
  bottomLineAllocation:{

   accountManagerName:{
    type:String,
    default:""
   },

   accountManagerAmount:{
    type:Number,
    default:0
   },

   backendSupportName:{
    type:String,
    default:""
   },

   backendSupportAmount:{
    type:Number,
    default:0
   },

   serviceDeliveryName:{
    type:String,
    default:""
   },

   serviceDeliveryAmount:{
    type:Number,
    default:0
   }

  }

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

 // History of remark edits - newest entry first.
 // We only keep the latest 3 (see $push + $slice in updateCustomer controller).
 remarkHistory:[
  {
   remark:{
    type:String,
    default:""
   },

   // Who edited it
   updatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },

   updatedByName:{
    type:String,
    default:""
   },

   // USER | ADMIN | SUPER_ADMIN
   updatedByRole:{
    type:String,
    default:""
   },

   updatedAt:{
    type:Date,
    default:Date.now
   }
  }
 ],

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