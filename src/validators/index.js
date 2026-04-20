import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants.js";
const userregisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")    
            .isLength({ min: 3, max: 20 })
            .withMessage("Username must be between 3 and 20 characters"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
     ]
}

const userLoginValidator = () => {
    return [
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email'),
        
        
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
    ];
}

const userChangeCurrentPasswordValidator = ()=> {
    return [
        body('oldPassword')
            .notEmpty()
            .withMessage('Old password is required'),
        body('newPassword')
            .notEmpty()
            .withMessage('New password is required')    
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email'),
    ];
}

const userResetForgotPasswordValidator = () => {
    return [
        body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
    ]}

const createProjectValidator = () => {
    return [
      body('name').notEmpty().withMessage('Name is required'),

        body('description').optional()];
}

const addMemberToProjectValidator = () => {
    return [
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is not valid'),
      body('role')
        .notEmpty()
        .withMessage('Role is required')
            .isIn(AvailableUserRoles)
              .withMessage('Role is unavailable')

    ];

}






export {
  userregisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMemberToProjectValidator,
}; 
    
    
    
