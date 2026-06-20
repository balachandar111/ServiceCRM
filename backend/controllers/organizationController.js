const Organization = require("../models/Organization");

/*
|--------------------------------------------------------------------------
| Create Organization
|--------------------------------------------------------------------------
*/

exports.createOrganization = async (req, res) => {

    try {

        const {
            orgName,
            orgCode,
            companyType,
            companySize,
            logo
        } = req.body;

        const existingOrganization =
        await Organization.findOne({
            orgCode
        });

        if (existingOrganization) {

            return res.status(400).json({
                success: false,
                message: "Organization Code Already Exists"
            });

        }

        const organization =
        await Organization.create({

            orgName,

            orgCode,

            companyType,

            companySize,

            logo

        });

        res.status(201).json({

            success: true,

            message:
            "Organization Created Successfully",

            data: organization

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
|--------------------------------------------------------------------------
| Get All Organizations
|--------------------------------------------------------------------------
*/

exports.getOrganizations =
async (req, res) => {

    try {

        const organizations =
        await Organization.find()
        .sort({
            createdAt: -1
        });

        res.status(200).json({

            success: true,

            count:
            organizations.length,

            data:
            organizations

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
|--------------------------------------------------------------------------
| Get Organization By Id
|--------------------------------------------------------------------------
*/

exports.getOrganization =
async (req, res) => {

    try {

        const organization =
        await Organization.findById(
            req.params.id
        );

        if (!organization) {

            return res.status(404).json({

                success: false,

                message:
                "Organization Not Found"

            });

        }

        res.status(200).json({

            success: true,

            data: organization

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
|--------------------------------------------------------------------------
| Update Organization
|--------------------------------------------------------------------------
*/

exports.updateOrganization =
async (req, res) => {

    try {

        const organization =
        await Organization.findById(
            req.params.id
        );

        if (!organization) {

            return res.status(404).json({

                success: false,

                message:
                "Organization Not Found"

            });

        }

        organization.orgName =
        req.body.orgName ||
        organization.orgName;

        organization.orgCode =
        req.body.orgCode ||
        organization.orgCode;

        organization.companyType =
        req.body.companyType ||
        organization.companyType;

        organization.companySize =
        req.body.companySize ||
        organization.companySize;

        organization.logo =
        req.body.logo ||
        organization.logo;

        organization.status =
        req.body.status ||
        organization.status;

        await organization.save();

        res.status(200).json({

            success: true,

            message:
            "Organization Updated Successfully",

            data: organization

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/*
|--------------------------------------------------------------------------
| Delete Organization
|--------------------------------------------------------------------------
*/

exports.deleteOrganization =
async (req, res) => {

    try {

        const organization =
        await Organization.findById(
            req.params.id
        );

        if (!organization) {

            return res.status(404).json({

                success: false,

                message:
                "Organization Not Found"

            });

        }

        await Organization.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({

            success: true,

            message:
            "Organization Deleted Successfully"

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};