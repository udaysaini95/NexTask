import { mongoose, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new Schema(
    {
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: 'https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Picture.png',
      localPath: '',
    },
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    },
    fullname: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true,"Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    }
    }, {
        timestamps: true,
    }
);
// hooks
UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
      return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    // next is not called next() it already takes care
})

// methods
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        //payload
        _id: this._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
}

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        //payload
        _id: this._id,
        username: this.username,
        email: this.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );
}

// token without data
UserSchema.methods.generatetemporarytoken = function () {
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
        .digest("hex");
    
    const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
    return { unHashedToken, hashedToken, tokenExpiry };

}









export const User = mongoose.model('User',UserSchema)