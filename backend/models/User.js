const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },

    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:[
            "SUPER_ADMIN",
            "ADMIN",
            "USER"
        ],
        default:"USER"
    },
    loginStatus: {
  type: String,
  enum: ["Active", "Inactive"],
  default: "Active"
},
    
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},{
    timestamps:true
});

module.exports = mongoose.model(
    "User",
    userSchema
);