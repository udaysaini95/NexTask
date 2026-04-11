import { body } from "express-validator";

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

export { userregisterValidator, userLoginValidator }; 
    
    
    
