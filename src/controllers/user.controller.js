import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { deleteCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
    
        if (!user){
            throw new ApiError(400, "User not found")
        }
    
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({
            validateBeforeSave: false})
    
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")       
    }
}

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

    try {
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
    } catch (error) {
        console.log("User creation failed.");
        if (avatar){
            await deleteCloudinary(avatar.public_id)
        }
        if (cover){
            await deleteCloudinary(cover.public_id)
        }
        throw new ApiError(500, "Registering User: Something went wrong. Images are deleted")
    }
})

const loginUser = asyncHandler(async (req,res)=>{
    //get data from request
    const {email,username,password}=req.body

    //validate data
    if(JSON.stringify(req.body)=="{}"){
        throw new ApiError(400, "All fields are required")
    }
    if(email?.trim()===""){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400, "User not found")
    }

    //check password
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Password is incorrect")
    }

    //generate tokens
    const {accessToken,refreshToken} = await 
        generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(400, "User not found")
    }
    
    const optons={
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,optons)
    .cookie("refreshToken",refreshToken,optons)
    .json(new ApiResponse(200,
        {
            user:loggedInUser,
            accessToken,
            refreshToken    
        } ,"User logged in successfully" ))
})  

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(400, "Refresh token is missing")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)

        if (!user){
            throw new ApiError(404,"Invalid refresh token")
        }

        if( incomingRefreshToken !==  user?.refreshToken ){
            throw new ApiError(404,"Invalid refresh token")
        }

        const {accessToken,refreshToken: newRefreshToken}=await generateAccessAndRefreshToken(user._id)

        const optons={
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,optons)
        .cookie("refreshToken",newRefreshToken,optons)
        .json(new ApiResponse(200,
            {
                accessToken,
                refreshToken: newRefreshToken    
            } ,"Token refreshed successfully" ))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing token")
    }
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User,findByIdAndUpdate(
        req.user._id,
        {
           $set: {refreshToken:undefined} 
        },
        {new: true}
    )

    const optons={
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .clearCookie("accessToken",optons)
    .clearCookie("refreshToken",optons)
    .json(new ApiResponse(200,"User logged out successfully"))
})

const changePassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(401, "Old password is incorrect")
    }

    user.password=newPassword
    await user.save({validateBeforeSave: false})

    return  res
            .status(200)
            .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{ 
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,user,"current user details"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullname,email}=req.body

    if(!fullname || !email){
        throw new ApiError(400, "Fullname and email are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email:email} 
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar:avatar.url} 
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverLocalPath = req.file?.path

    if(!coverLocalPath){
        throw new ApiError(400, "Cover Image is required")
    }

    const cover = await uploadCloudinary(coverLocalPath)

    if(!cover.url){
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage:cover.url} 
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username}= req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {$size: "$subscribers"},
                channelsSubscribedToCount: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname:true,
                username:true,
                email:true,
                subscribersCount:true,
                channelsSubscribedToCount:true,
                isSubscribed:true,
                avatar:true,
                coverImage:true
            }
        }
    ])

    if(!channel.length){
        throw new ApiError(404, "Channel not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,channel[0],"Channel profile fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{

    const watchHistory = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory"
            }
        }
    ])

    if(!watchHistory.length){
        throw new ApiError(404, "Watch history not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,watchHistory[0].watchHistory,"Watch history fetched successfully"))

})



export {registerUser,
        loginUser,
        refreshAccessToken,
        logoutUser,
        changePassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory}