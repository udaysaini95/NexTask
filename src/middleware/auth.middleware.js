// this middleware will check if the user is authenticated or not by checking access token in the request

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

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



