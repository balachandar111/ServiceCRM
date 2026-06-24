const Customer =
require("../models/Customer");
const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");
const XLSX = require("xlsx");




exports.createCustomer =
async(req,res)=>{

 try{

  const customer =
  await Customer.create({

   ...req.body,

   createdBy:
   req.user.id

  });

  res.status(201).json({

   success:true,

   message:
   "Customer Created",

   data:customer

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.getCustomers =
async(req,res)=>{

 try{

  const customers =
  await Customer.find()

  .populate(
   "assignedTo",
   "name username"
  )

  .sort({
   createdAt:-1
  });

  res.status(200).json({

   success:true,

   data:customers

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.getCustomer =
async(req,res)=>{

 try{

  const customer =
  await Customer.findById(
   req.params.id
  );

  res.status(200).json({

   success:true,

   data:customer

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.updateCustomer =
async(req,res)=>{

 try{

  const customer =
  await Customer.findByIdAndUpdate(

   req.params.id,

   req.body,

   {
    new:true
   }

  );

  res.status(200).json({

   success:true,

   message:
   "Customer Updated",

   data:customer

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.deleteCustomer =
async(req,res)=>{

 try{

  await Customer.findByIdAndDelete(
   req.params.id
  );

  res.status(200).json({

   success:true,

   message:
   "Customer Deleted"
  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.customerDashboard =
async(req,res)=>{

 try{

  const customers =
  await Customer.find();

  const dashboard = {

   totalCustomers:
   customers.length,

   quotationShared:
   customers.filter(

    c =>
    c.leadStatus ===
    "Quotation Shared"

   ).length,

   closedCustomers:
   customers.filter(

    c =>
    c.leadStatus ===
    "Closed"

   ).length,

   callFollowups:
   customers.filter(

    c =>
    c.followUpType ===
    "Calls"

   ).length,

   paymentFollowups:
   customers.filter(

    c =>
    c.followUpType ===
    "Payment"

   ).length,

   users:customers

  };

  res.status(200).json({

   success:true,

   data:dashboard

  });

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};



exports.bulkUploadCustomers = async (req, res) => {
  try {

    const workbook = XLSX.readFile(req.file.path);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(sheet);

    const customers = [];

    for (const row of rows) {

      const customerData = {

        name: row.name || "",

        company: row.company || "",

        phoneNumber: row.phoneNumber || "",

        email: row.email || "",

        service: row.service || "Service",

        status:
          row.status ||
          "Waiting for Internal",

        customerLevel:
          row.customerLevel ||
          "New",

        callType:
          row.callType ||
          "AMC",

        leadStatus:
          row.leadStatus ||
          "Quotation Shared",

        followUpType:
          row.followUpType ||
          "Payment",

        followUpDate:
          row.followUpDate
            ? new Date(row.followUpDate)
            : null,

        leadStage:
          row.leadStage ||
          "Awareness",

        priority:
          row.priority ||
          "Medium",

        source:
          row.source ||
          "Website",

        assignedTo:
          row.assignedTo || "",

        sector:
          row.sector || "",

        expense:
          Number(row.expense) || 0,

        remark:
          row.remark || ""
      };

      // QUOTATION SHARED

      if (
        row.leadStatus ===
        "Quotation Shared"
      ) {

        customerData.quotationShared = {

          whatsappShared:
            row.whatsappShared === true ||
            row.whatsappShared === "TRUE",

          emailShared:
            row.emailShared === true ||
            row.emailShared === "TRUE",

          gstType:
            row.gstType || "GST",

          quotationNumber:
            row.quotationNumber || ""

        };
      }

      // CLOSED

      if (
        row.leadStatus ===
        "Closed"
      ) {

        customerData.closedDetails = {

          engineers:
            row.engineers
              ? row.engineers
                  .split(",")
                  .map(e => e.trim())
              : [],

          fieldEngineer:
            row.fieldEngineer || "",

          outsourceName:
            row.outsourceName || "",

          outsourceDate:
            row.outsourceDate
              ? new Date(
                  row.outsourceDate
                )
              : null,

          internalName:
            row.internalName || "",

          internalDate:
            row.internalDate
              ? new Date(
                  row.internalDate
                )
              : null,

          invoiceNumber:
            row.invoiceNumber || ""

        };
      }

      customers.push(customerData);
    }

    await Customer.insertMany(
      customers
    );

    res.status(201).json({
      success: true,
      message:
        "Customers uploaded successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.downloadCustomers =
async(req,res)=>{

 try{

  const customers =
  await Customer.find();

  const worksheet =
  XLSX.utils.json_to_sheet(
   customers
  );

  const workbook =
  XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

   workbook,
   worksheet,
   "Customers"

  );

  const filePath =
  "./uploads/customers.xlsx";

  XLSX.writeFile(
   workbook,
   filePath
  );

  res.download(
   filePath
  );

 }
 catch(error){

  res.status(500).json({

   success:false,

   message:error.message

  });

 }

};

exports.customerAnalytics =
async(req,res)=>{

 try{

  const customers =
  await Customer.find();

  const analytics = {

   totalCustomers:
   customers.length,

   awareness:
   customers.filter(
    x =>
    x.leadStage==="Awareness"
   ).length,

   interest:
   customers.filter(
    x =>
    x.leadStage==="Interest"
   ).length,

   desire:
   customers.filter(
    x =>
    x.leadStage==="Desire"
   ).length,

   closure:
   customers.filter(
    x =>
    x.leadStage==="Closure"
   ).length,

   highPriority:
   customers.filter(
    x =>
    x.priority==="High"
   ).length,

   quotationShared:
   customers.filter(
    x =>
    x.leadStatus==="Quotation Shared"
   ).length,

   closed:
   customers.filter(
    x =>
    x.leadStatus==="Closed"
   ).length,

   customers

  };

  res.status(200).json({

   success:true,
   data:analytics

  });

 }
 catch(error){

  res.status(500).json({

   success:false,
   message:error.message

  });

 }

};