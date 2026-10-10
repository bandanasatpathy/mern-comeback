const mongoose = require("mongoose");

const Project = require("../models/project.model");
const User = require("../models/user.model");
const Task = require("../models/task.model");


// ======================================================
// HELPER
// VALIDATE PROJECT MEMBERS
// ======================================================

const validateMembers = async (memberIds) => {

    if (!Array.isArray(memberIds)) {

        return {
            valid: false,
            message: "Members must be an array."
        };

    }


    // Remove duplicate IDs
    const uniqueMemberIds = [
        ...new Set(
            memberIds.map(
                (id) => id.toString()
            )
        )
    ];


    // ==============================================
    // VALIDATE OBJECT IDS
    // ==============================================

    for (const memberId of uniqueMemberIds) {

        if (
            !mongoose.Types.ObjectId.isValid(
                memberId
            )
        ) {

            return {
                valid: false,
                message:
                    `Invalid employee ID: ${memberId}`
            };

        }

    }


    // ==============================================
    // FIND ACTIVE EMPLOYEES
    // ==============================================

    const employees =
        await User.find({

            _id: {
                $in: uniqueMemberIds
            },

            role: "employee",

            isActive: true

        }).select("_id");


    if (
        employees.length !==
        uniqueMemberIds.length
    ) {

        return {
            valid: false,
            message:
                "All project members must be active employees."
        };

    }


    return {

        valid: true,

        memberIds: uniqueMemberIds

    };

};


// ======================================================
// CREATE PROJECT
// ADMIN ONLY
// ======================================================

const createProject = async (req, res) => {

    try {

        const {
            name,
            description,
            members
        } = req.body;


        // ==============================================
        // VALIDATION
        // ==============================================

        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Project name is required."

            });

        }


        if (
            !description ||
            !description.trim()
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Project description is required."

            });

        }


        if (
            members !== undefined &&
            !Array.isArray(members)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Members must be an array."

            });

        }


        // ==============================================
        // VALIDATE MEMBERS
        // ==============================================

        let validMembers = [];


        if (
            members &&
            members.length > 0
        ) {

            const result =
                await validateMembers(
                    members
                );


            if (!result.valid) {

                return res.status(400).json({

                    status: "error",

                    message:
                        result.message

                });

            }


            validMembers =
                result.memberIds;

        }


        // ==============================================
        // CREATE PROJECT
        // ==============================================

        const project =
            new Project({

                name:
                    name.trim(),

                description:
                    description.trim(),

                members:
                    validMembers,

                createdBy:
                    req.userId,

                status:
                    "active"

            });


        await project.save();


        // ==============================================
        // POPULATE RESPONSE
        // ==============================================

        await project.populate([
            {
                path: "createdBy",
                select: "name email"
            },
            {
                path: "members",
                select: "name email role"
            }
        ]);


        return res.status(201).json({

            status: "success",

            message:
                "Project created successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Create project error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET ALL PROJECTS
// ADMIN → ALL PROJECTS
// EMPLOYEE → THEIR PROJECTS
// ======================================================

const getAllProjects = async (req, res) => {

    try {

        const filter = {

            status: {
                $ne: "archived"
            }

        };


        // ==============================================
        // EMPLOYEE
        // ==============================================

        if (req.role === "employee") {

            filter.members = req.userId;

        }


        const projects =
            await Project.find(filter)

                .populate(
                    "createdBy",
                    "name email"
                )

                .populate(
                    "members",
                    "name email role"
                )

                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            status: "success",

            message:
                "Projects fetched successfully.",

            data: projects

        });


    } catch (error) {

        console.error(
            "Get all projects error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET PROJECT BY ID
// ADMIN OR PROJECT MEMBER
// ======================================================

const getProjectById = async (req, res) => {

    try {

        const projectId =
            req.params.id;


        // ==============================================
        // VALIDATE ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid project ID."

            });

        }


        const project =
            await Project.findOne({

                _id: projectId,

                status: {
                    $ne: "archived"
                }

            })

                .populate(
                    "createdBy",
                    "name email"
                )

                .populate(
                    "members",
                    "name email role"
                );


        if (!project) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found."

            });

        }


        // ==============================================
        // ADMIN CAN VIEW
        // ==============================================

        if (req.role === "admin") {

            return res.status(200).json({

                status: "success",

                message:
                    "Project fetched successfully.",

                data: project

            });

        }


        // ==============================================
        // EMPLOYEE MEMBERSHIP CHECK
        // ==============================================

        const isMember =
            project.members.some(
                (member) =>
                    member._id.toString() ===
                    req.userId.toString()
            );


        if (!isMember) {

            return res.status(403).json({

                status: "error",

                message:
                    "You are not a member of this project."

            });

        }


        return res.status(200).json({

            status: "success",

            message:
                "Project fetched successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Get project by ID error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// UPDATE PROJECT
// ADMIN ONLY
// ======================================================

const updateProject = async (req, res) => {

    try {

        const projectId =
            req.params.id;


        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid project ID."

            });

        }


        const {
            name,
            description,
            status
        } = req.body;


        const project =
            await Project.findOne({

                _id: projectId

            });


        if (!project) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found."

            });

        }


        // ==============================================
        // NAME
        // ==============================================

        if (name !== undefined) {

            if (!name.trim()) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Project name cannot be empty."

                });

            }


            project.name =
                name.trim();

        }


        // ==============================================
        // DESCRIPTION
        // ==============================================

        if (description !== undefined) {

            if (!description.trim()) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Project description cannot be empty."

                });

            }


            project.description =
                description.trim();

        }


        // ==============================================
        // STATUS
        // ==============================================

        if (status !== undefined) {

            const validStatuses = [
                "active",
                "completed",
                "archived"
            ];


            if (
                !validStatuses.includes(status)
            ) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Invalid project status."

                });

            }


            project.status =
                status;

        }


        await project.save();


        await project.populate([
            {
                path: "createdBy",
                select: "name email"
            },
            {
                path: "members",
                select: "name email role"
            }
        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Project updated successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Update project error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// ADD PROJECT MEMBER
// ADMIN ONLY
// ======================================================

const addProjectMember = async (req, res) => {

    try {

        const projectId =
            req.params.id;

        const {
            employeeId
        } = req.body;


        // ==============================================
        // VALIDATE PROJECT ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid project ID."

            });

        }


        // ==============================================
        // VALIDATE EMPLOYEE ID
        // ==============================================

        if (
            !employeeId ||
            !mongoose.Types.ObjectId.isValid(
                employeeId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Valid employee ID is required."

            });

        }


        // ==============================================
        // FIND PROJECT
        // ==============================================

        const project =
            await Project.findOne({

                _id: projectId,

                status: {
                    $ne: "archived"
                }

            });


        if (!project) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found or archived."

            });

        }


        // ==============================================
        // CHECK EMPLOYEE
        // ==============================================

        const employee =
            await User.findOne({

                _id: employeeId,

                role: "employee",

                isActive: true

            });


        if (!employee) {

            return res.status(400).json({

                status: "error",

                message:
                    "Only active employees can be added to a project."

            });

        }


        // ==============================================
        // CHECK EXISTING MEMBER
        // ==============================================

        const alreadyMember =
            project.members.some(
                (memberId) =>
                    memberId.toString() ===
                    employeeId.toString()
            );


        if (alreadyMember) {

            return res.status(400).json({

                status: "error",

                message:
                    "Employee is already a project member."

            });

        }


        // ==============================================
        // ADD MEMBER
        // ==============================================

        project.members.push(
            employeeId
        );


        await project.save();


        await project.populate([
            {
                path: "createdBy",
                select: "name email"
            },
            {
                path: "members",
                select: "name email role"
            }
        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Employee added to project successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Add project member error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// REMOVE PROJECT MEMBER
// ADMIN ONLY
// ======================================================

const removeProjectMember = async (req, res) => {

    try {

        const projectId =
            req.params.id;

        const {
            employeeId
        } = req.body;


        // ==============================================
        // VALIDATE PROJECT ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid project ID."

            });

        }


        // ==============================================
        // VALIDATE EMPLOYEE ID
        // ==============================================

        if (
            !employeeId ||
            !mongoose.Types.ObjectId.isValid(
                employeeId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Valid employee ID is required."

            });

        }


        // ==============================================
        // FIND PROJECT
        // ==============================================

        const project =
            await Project.findById(
                projectId
            );


        if (!project) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found."

            });

        }


        // ==============================================
        // CHECK MEMBER
        // ==============================================

        const isMember =
            project.members.some(
                (memberId) =>
                    memberId.toString() ===
                    employeeId.toString()
            );


        if (!isMember) {

            return res.status(400).json({

                status: "error",

                message:
                    "Employee is not a member of this project."

            });

        }


        // ==============================================
        // CHECK ACTIVE TASKS
        // ==============================================

        const assignedTasks =
            await Task.countDocuments({

                project: projectId,

                assignedTo: employeeId,

                isDeleted: false

            });


        if (assignedTasks > 0) {

            return res.status(400).json({

                status: "error",

                message:
                    "Employee cannot be removed because they have tasks assigned in this project."

            });

        }


        // ==============================================
        // REMOVE MEMBER
        // ==============================================

        project.members =
            project.members.filter(
                (memberId) =>
                    memberId.toString() !==
                    employeeId.toString()
            );


        await project.save();


        await project.populate([
            {
                path: "createdBy",
                select: "name email"
            },
            {
                path: "members",
                select: "name email role"
            }
        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Employee removed from project successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Remove project member error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// ARCHIVE PROJECT
// ADMIN ONLY
// ======================================================

const archiveProject = async (req, res) => {

    try {

        const projectId =
            req.params.id;


        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid project ID."

            });

        }


        const project =
            await Project.findById(
                projectId
            );


        if (!project) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found."

            });

        }


        if (
            project.status === "archived"
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Project is already archived."

            });

        }


        project.status =
            "archived";


        await project.save();


        return res.status(200).json({

            status: "success",

            message:
                "Project archived successfully.",

            data: project

        });


    } catch (error) {

        console.error(
            "Archive project error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    addProjectMember,
    removeProjectMember,
    archiveProject

};