import { Router } from 'express';
// import controller here
import {
  getProjects,
  createProjects,
  getProjectdetails,
  updateProject,
  deleteProject,
  listProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
} from '../controllers/project.controller.js';



// imports validators and middlewares
import { validate } from '../middleware/validator.middleware.js';
import { validateProjectPermission, verifyJWT } from '../middleware/auth.middleware.js';


import {
  addMemberToProjectValidator,
  createProjectValidator,
} from '../validators/index.js';


import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js';





const router = Router();

router.use(verifyJWT); // after this stetement every route have verifyJWT middle ware called as first middleware

router
  .route('/')
  .get(getProjects)
  .post(createProjectValidator(), validate, createProjects);


router
  .route('/:projectId')
  .get(validateProjectPermission(AvailableUserRoles), getProjectdetails)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);
  

router
  .route('/:projectId/members')
  .get(listProjectMembers)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), addMemberToProjectValidator(), validate, addProjectMember)
  



router
  .route('/:projectId/members/:userId')
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), removeMember);
      

export default router;