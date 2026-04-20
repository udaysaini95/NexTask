import { mongoose, Schema } from 'mongoose';
import { AvailableTaskStatuses, TaskStatusesEnum} from '../utils/constants.js';

const TaskSchema = new Schema(
  {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusesEnum.TODO,
        },
    
        attachment: {
        type: [{
          url: String,
          mimetype: String,
          size:Number,
            }],
            default: [],
            
    }
  },
  { timestamps: true },
);

export const Task = mongoose.model('Task', TaskSchema);