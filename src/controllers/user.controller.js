import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req,res)=>{
    const {fullName,email,username,password}=req.body

    console.log();
    
    if(JSON.stringify(req.body)=="{}"){
        throw new ApiError(400, "All fields are required")
    }
    if(fullName?.trim()===""){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if (existedUser) {
        throw new ApiError(400, "Username already exist")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path 
    const coverLocalPath=req.files?.coverImage[0]?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    if(!coverLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }
    const avatar =await uploadCloudinary(avatarLocalPath)
    const cover =await uploadCloudinary(coverLocalPath)

    const user =  await User.create({
        fullName,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: cover.url
    })
    const createdUser = await User.findById(user._id).select("-password")

    if(!createdUser){
        throw new ApiError(500, "Registering User: Something went wrong.")
    }

    return res 
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"))
})

export {registerUser}