import { Router } from 'express';
// import controller here
import { login, refreshAccessToken } from '../controllers/auth.controller.js';
import {registerUser} from '../controllers/auth.controller.js';
import { logout } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getCurrUser } from '../controllers/auth.controller.js';
import { verifyEmail } from '../controllers/auth.controller.js';


// imports
import { validate } from '../middleware/validator.middleware.js';
import { userregisterValidator } from '../validators/index.js';
import { userLoginValidator } from '../validators/index.js';
import { userForgotPasswordValidator } from '../validators/index.js';
import { userResetForgotPasswordValidator } from '../validators/index.js';
import { userChangeCurrentPasswordValidator } from '../validators/index.js';
import { forgotPasswordRequest } from '../controllers/auth.controller.js';
import { resetForgotPassword } from '../controllers/auth.controller.js';
import { changePassword } from '../controllers/auth.controller.js';
import { resendVerificationEmail } from '../controllers/auth.controller.js';





const router = Router();
// middle ware written

// unprotected Routes
router.route('/register').post(userregisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, login);

router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-Token').post(refreshAccessToken)
router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route('/reset-password/:resetToken').post(userResetForgotPasswordValidator(), validate, resetForgotPassword);
router.route('/change-password').post(userChangeCurrentPasswordValidator(), validate, changePassword);



// protectd routes 
router.route('/logout').post(verifyJWT, logout);
router.route('/current-user').get(verifyJWT, getCurrUser);
router.route('/current-user').get(verifyJWT, getCurrUser);
router
  .route('change-password')
    .post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changePassword);
router
  .route('/resend-email-verification')
  .post(verifyJWT, resendVerificationEmail);





export default router;
