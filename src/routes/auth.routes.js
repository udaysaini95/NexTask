import { Router } from 'express';
// import controller here
import { login } from '../controllers/auth.controller.js';
import {registerUser} from '../controllers/auth.controller.js';
import { logout } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getCurrUser } from '../controllers/auth.controller.js';

// imports
import { validate } from '../middleware/validator.middleware.js';
import { userregisterValidator } from '../validators/index.js';
import { userLoginValidator } from '../validators/index.js';

const router = Router();
// middle ware written 
router.route('/register').post(userregisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, login);

// protectd routes 
router.route('/logout').post(verifyJWT, logout);
router.route('/current-user').get(verifyJWT, getCurrUser);


export default router;
