import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/api-error.js';
import { User } from '../models/user.model.js';
import { Task } from '../models/tasks.model.js';
import { sendmEmail } from '../utils/mail.js';
import mongoose from 'mongoose';
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js';
import { Subtask } from '../models/subtasks.model.js';
import { AvailableTaskStatuses,TaskStatusEnum} from '../utils/constants.js';


const getTasks = asyncHandler(async (req, res) => {
  
})

const createTasks = asyncHandler(async (req, res) => { });

const updateTask = asyncHandler(async (req, res) => { });

const deleteTask = asyncHandler(async (req, res) => { });

const getTaskdetail = asyncHandler(async (req, res) => { });

const createSubtask = asyncHandler(async (req, res) => { });

const updateSubtask = asyncHandler(async (req, res) => { });

const deleteSubtask = asyncHandler(async (req, res) => { });




// const getTasks = asyncHandler(async (req, res) => {});

export {
  getTasks,
  createTasks,
  updateTask,
  deleteTask,
  getTaskdetail,
  createSubtask,
  updateSubtask,
  deleteSubtask,
}