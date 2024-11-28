import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");

    if(!token){
        throw new ApiError(401,"Unauthorized: No token found")
    }

    try {
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user =await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Unauthorized: User not found")
        }

        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized: Invalid access token")
    }

});