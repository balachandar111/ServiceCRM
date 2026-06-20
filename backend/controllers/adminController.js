const bcrypt = require("bcryptjs");

const User = require("../models/Admin");

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
        await User.findOne({
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
        await User.create({

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

            status: "ACTIVE"

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
await User.find({
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
await User.findById(
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
await User.findById(
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
await User.findById(
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
await User.findById(
req.params.id
);

if(!admin){

return res.status(404).json({
success:false,
message:"Admin Not Found"
});

}

await User.findByIdAndDelete(
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
exports.adminLogin = async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const admin =
        await User.findOne({

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