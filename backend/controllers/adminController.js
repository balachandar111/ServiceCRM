const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");


const Organization =
require("../models/Organization");

const generateToken =
require("../utils/generateToken");
exports.createAdmin = async (req, res) => {

    try {

        const {
            organizationId,
            name,
            company,
            username,
            password,
            phone,
            email,
            profile
        } = req.body;

        const organization =
        await Organization.findById(
            organizationId
        );

        if (!organization) {

            return res.status(404).json({
                success: false,
                message: "Organization Not Found"
            });

        }

        const existingAdmin =
        await Admin.findOne({
            username
        });

        if (existingAdmin) {

            return res.status(400).json({
                success: false,
                message: "Username Already Exists"
            });

        }

        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

        const admin =
        await Admin.create({

            organization:
            organization._id,

            name,

            company,

            username,

            email,

            phone,

            profile,

            password:
            hashedPassword,

            role: "ADMIN",

            status: "ACTIVE",
            

        });

        res.status(201).json({

            success: true,

            message:
            "Admin Created Successfully",

            data: admin

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
exports.getAdmins = async (
req,
res
) => {

try{

const admins =
await Admin.find({
role:"ADMIN"
})
.populate(
"organization",
"orgName orgCode"
)
.select("-password");

res.status(200).json({

success:true,

count:
admins.length,

data:
admins

});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.getAdmin = async (
req,
res
)=>{

try{

const admin =
await Admin.findById(
req.params.id
)
.populate(
"organization"
)
.select("-password");

if(!admin){

return res.status(404).json({
success:false,
message:"Admin Not Found"
});

}

res.status(200).json({
success:true,
data:admin
});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.updateAdmin = async (
req,
res
)=>{

try{

const admin =
await Admin.findById(
req.params.id
);

if(!admin){

return res.status(404).json({
success:false,
message:"Admin Not Found"
});

}

admin.name =
req.body.name ||
admin.name;

admin.company =
req.body.company ||
admin.company;

admin.phone =
req.body.phone ||
admin.phone;

admin.email =
req.body.email ||
admin.email;

if(req.body.password){

admin.password =
await bcrypt.hash(
req.body.password,
10
);

}

await admin.save();

res.status(200).json({

success:true,

message:
"Admin Updated",

data:admin

});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.changeAdminStatus = async (
req,
res
) => {

try {

const admin =
await Admin.findById(
req.params.id
);

if (!admin) {

return res.status(404).json({
success:false,
message:"Admin Not Found"
});

}

if (admin.role !== "ADMIN") {

return res.status(400).json({
success:false,
message:"Selected user is not an Admin"
});

}

admin.status =
admin.status === "ACTIVE"
?
"INACTIVE"
:
"ACTIVE";

await admin.save();

res.status(200).json({

success:true,

message:
`Admin status changed to ${admin.status}`,

data:admin

});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.deleteAdmin =
async (
req,
res
)=>{

try{

const admin =
await Admin.findById(
req.params.id
);

if(!admin){

return res.status(404).json({
success:false,
message:"Admin Not Found"
});

}

await Admin.findByIdAndDelete(
req.params.id
);

res.status(200).json({

success:true,

message:
"Admin Deleted"

});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.getAllAdmins = async (req, res) => {
  try {

    const admins = await Admin.find({
      role: "ADMIN"
    })
      .populate(
        "organization",
        "orgName orgCode"
      )
      .select("-password");

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getAdminAnalytics =
async(req,res)=>{

 try{

  const users =
  await Admin.find({

   createdBy:
   req.params.id

  });

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


// adminController.js


const User = require("../models/User");

exports.getAdminDashboard = async (req, res) => {
  try {

    const adminId = req.params.id;

    const users = await User.find({
      createdBy: adminId,
      role: "USER"
    });

    const analytics = {

      totalLeads: users.length,

      activeLeads: users.filter(
        user => user.loginStatus === "ACTIVE"
      ).length,

      quotationShared: users.filter(
        user => user.leadStatus === "Quotation Shared"
      ).length,

      closedLeads: users.filter(
        user => user.leadStatus === "Closed"
      ).length,

      paymentFollowups: users.filter(
        user =>
          user.followUpType === "Payment" ||
          user.followUpType === "Both"
      ).length,

      callFollowups: users.filter(
        user =>
          user.followUpType === "Calls" ||
          user.followUpType === "Both"
      ).length,

      awareness: users.filter(
        user => user.leadStage === "Awareness"
      ).length,

      interest: users.filter(
        user => user.leadStage === "Interest"
      ).length,

      desire: users.filter(
        user => user.leadStage === "Desire"
      ).length,

      closure: users.filter(
        user => user.leadStage === "Closure"
      ).length,

      users
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
exports.adminLogin = async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const admin =
        await Admin.findOne({

            username,

            role: "ADMIN"

        }).populate(
            "organization"
        );

        if (!admin) {

            return res.status(404).json({
                success: false,
                message: "Admin Not Found"
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

        const token =
        generateToken(admin);

        res.status(200).json({

            success: true,

            message:
            "Login Successful",

            token,

            user: {

                id: admin._id,

                name: admin.name,

                username: admin.username,

                role: admin.role,

                organization: {
                    id: admin.organization?._id,
                    name: admin.organization?.orgName,
                    code: admin.organization?.orgCode
                }

            }

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};