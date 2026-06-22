const mongoose =
require("mongoose");

const smartCalculatorSchema =
new mongoose.Schema({

    
 companyName:{
  type:String
 },

 orderNo:{
  type:String
 },

 fileName:{
  type:String
 },

 fileUrl:{
  type:String
 }

},
{
 timestamps:true
});

module.exports =
mongoose.model(
 "SmartCalculator",
 smartCalculatorSchema
);