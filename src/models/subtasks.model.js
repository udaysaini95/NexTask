import { mongoose, Schema } from 'mongoose';
import { AvailableTaskStatuses, TaskStatusesEnum } from '../utils/constants.js';


const SubtaskScheme = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    }

}, { timestamps: true })

export const Subtask = mongoose.model('Subtask', SubtaskScheme);