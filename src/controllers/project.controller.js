import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/api-error.js';
import { User } from '../models/user.model.js';
import { Project } from '../models/project.model.js';
import { ProjectMember } from '../models/projectmember.model.js';
import { sendmEmail } from '../utils/mail.js';
import mongoose from 'mongoose';
import { AvailableUserRoles, UserRolesEnum} from '../utils/constants.js';


const getProjects = asyncHandler(async (req, res) => {
   // we will find in projectMember data instead of  project
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projects',
        pipeline: [
          {
            $lookup: {
              from: 'projectmembers',
              localField: '_id',
              foreignField: 'project',
              as: 'projectmembers',
            },
          },
        ],
      },
    },
    {
      $unwind: '$projects',
    },
    {
      $addFields: {
        members: {
          $size: '$projects.projectmembers',
        },
      },
    },
    {
      $project: {
        project: {
          // creates new object to be passed named project
          _id: '$projects._id',
          title: '$projects.title',
          description: '$projects.description',
          members: '$members',
          createdAt: '$projects.createdAt',
          createdBy: '$projects.createdBy',
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched successfully'));
})


const createProjects = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, 'Project created successfully'));
});

const getProjectdetails = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  const project = await Project.findById(projectId)

  if (!project)
  {
    throw new ApiError(404, "Project not found");
  }
  return res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const {title,description} = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      title,
      description,
    },
    {
      new: true,
    }
  )

  if (!project)
  {
    throw new ApiError(404, "Project not found");
  }

  return res.status(201).json(new ApiResponse(201, project, "Project updated successfully"));



});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);
  if (!project)
  {
    throw new ApiError(404, "Project not found");
  }
   // await ProjectMember.findOne({project:projectId}) instead add a pre hook in model

  return res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"));


});

const listProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const projectmembers = await ProjectMember.aggregate(
    [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users",  // this lookup changes user field from object id to full user object instead of creating new field (overwrites user field)
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                fullname: 1,
                avatar: 1,
              }
            }
          ]
        }
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ["$user", 0],
          },
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          project: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
   ]
  )

  return res.status(200).json(new ApiResponse(200, projectmembers, 'Project members fetched successfully'));
  

});

const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  


  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await ProjectMember.findOneAndUpdate(
    {
      user: user._id,
      project: projectId,
    },
    {
      $set: { role },
    },
    {
      new: true,
      upsert: true, //  reate new document
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Member Updated Successfully'));

});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newrole } = req.body;

  if (!AvailableUserRoles.includes(newrole)) {
    throw new ApiError(400, "Invalid role");
  }

  let projectmember = await ProjectMember.findOne({
    user:userId,
    project:projectId
  });

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }


  projectmember = await ProjectMember.findByIdAndUpdate(    projectmember._id,
    {
      role:newrole
    },
    {
      new:true,
    }
  )

  if (!projectmember) {
    throw new ApiError(400, 'Project member not found');
  }


  return res.status(200).json(new ApiResponse(200, projectmember, "Member role updated successfully"));


})


const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectmember = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(userId),
    project: new mongoose.Types.ObjectId(projectId),
  })

  if (!projectmember)
  {
    throw new ApiError(404, "Project member not found");
  }

  projectmember = await ProjectMember.findByIdAndDelete(
    projectmember._id,
  );

  if (!projectmember)
  {
    throw new ApiError(404, "Project member not found");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Member removed successfully"));

});



  export {
    getProjects,
    createProjects,
    getProjectdetails,
    updateProject,
    deleteProject,
    listProjectMembers,
    addProjectMember,
    updateMemberRole,
    removeMember,
  };


