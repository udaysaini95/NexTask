
import { User } from "../models/user.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

// this middleware will check if the user is authenticated or not by checking access token in the request

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) {
        throw new ApiError(401, "Unauthorized - No token provided");
    }

    try {
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select(
          '-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry',
        );
        if(!user) {
            throw new ApiError(401, "Unauthorized - User not found");
        }

        req.user = user; // attach user to request object
        next();
        
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
})

export const validateProjectPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {

        const { projectId } = req.params;

         if (!projectId) {
           throw new ApiError(400, 'project id is missing');
         }

         const project = await ProjectMember.findOne({
           user: req.user._id,
           project: projectId,
         });
        
        if (!project) {
          throw new ApiError(400, 'project is missing');
        }

        const givenRole = project.role;
        req.user.role = givenRole;

        if (!roles.includes(givenRole))
        {
            throw new ApiError(403,"You do not have permession to perform this action")
        }

        next(); // will allow to move to controller

    })
   
}



