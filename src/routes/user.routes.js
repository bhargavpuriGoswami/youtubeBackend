import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {    loginUser, 
            logoutUser, 
            registerUser,
            refreshAccessToken, 
            changePassword,
            getCurrentUser,
            getUserChannelProfile,
            updateAccountDetails,
            updateUserAvatar,
            getWatchHistory,
            updateUserCoverImage
        } from "../controllers/user.controller.js"; 

const router = Router()

router.route("/register").post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ])
    ,registerUser)

router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)




//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/updateAccount").patch(verifyJWT, updateAccountDetails)
router.route("/history").get(verifyJWT, getWatchHistory)

//File handling routes (Multer)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)







export  default router