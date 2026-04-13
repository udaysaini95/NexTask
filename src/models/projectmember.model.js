import { mongoose, Schema } from 'mongoose';
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants';

const ProjectmemberSchema = new Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    role: {
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER, // member
    }
}, { timestamps: true })

export const ProjectMember = mongoose.model('ProjectMember', ProjectmemberSchema);
