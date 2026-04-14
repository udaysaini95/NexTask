import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/api-error.js';
import { User } from '../models/user.model.js';
import { emailverificationMailgenContent, sendmEmail } from '../utils/mail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';



const generateAccessandRefreshToken = async (userId)=>
{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, "Token generation failed")   
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body; // get details from req (form from frontend)

    // check if user already exist
    const ExistedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (ExistedUser) {
        throw new ApiError(400, "User with same username or email exists");
    }
    
    // new user creation 
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
        role,
    });

    const { unhashedToken, hashedToken, tokenExpiry } = user.generatetemporarytoken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    await user.save({ validateBeforeSave: false });

    await sendmEmail({
        email: user?.email,
        subject: "Email Verification",
        mailgenContent: emailverificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`)
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { user: createdUser }, "User created successfully and mail is sent for email verification"));

});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email)
    {
        throw new ApiError(400, "Email is required");
    }

    const user= await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");  
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry',
    );


    const options = {
        httpOnly: true,
        secure:true,
    }
    return res
        .status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accesstoken', accessToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser }, "Login successful"),
    )
})


const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: "",
        },
    },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }


    return res
        .status(200)
        .clearCookie('refreshToken',options)
        .clearCookie('accesstoken',options)
        .json(
            new ApiResponse(200, {}, "Logout successful"),
        )
    
})

const getCurrUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200,req.user, "User info fetched successfully"));
         
});

const verifyEmail = asyncHandler(async (req, res) => { 
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is required");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
    
    const user=await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    })

    if(!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {isEmailVerified: true}, "Email verified successfully"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }   

    const { unhashedToken, hashedToken, tokenExpiry } =
      user.generatetemporarytoken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendmEmail({
      email: user?.email,
      subject: 'Email Verification',
      mailgenContent: emailverificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unhashedToken}`,
      ),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Verification email sent successfully'))




})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingRefreshToken)
    {
        throw new ApiError(400, "Unauthorised Access")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken._id);

        if(!user) {
            throw new ApiError(404, "User not found");
        }       

        if (incommingRefreshToken !== user?.refreshToken) // me be user logout
        {
            throw new ApiError(401, "refresh token expired");
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessandRefreshToken(user._id);
        
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie('refreshToken', newRefreshToken, options)
            .cookie('accesstoken', accessToken, options)
            .json(200, { accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully")


    } catch (error) {
        throw new ApiError(401, 'Invalid Refresh Token');
    }

});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email)
    {
        throw new ApiError(400, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user)
    {
        throw new ApiError(404, "User not found");
    }

    const { unhashedToken, hashedToken, tokenExpiry } =
        user.generatetemporarytoken();
    
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendmEmail({
      email: user?.email,
      subject: 'Password Reset',
      mailgenContent: passwordResetMailgenContent(
        user.username,
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
      ),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password reset email sent successfully'));
     
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));

});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid)
    {
        throw new ApiError(401, "Invalid credentials");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))



});





// const verifyEmail = asyncHandler(async (req, res) => {});

   
    
    

export { registerUser , login ,logout, getCurrUser, verifyEmail, resendVerificationEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, changePassword};
    




