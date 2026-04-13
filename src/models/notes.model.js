import { mongoose, Schema } from 'mongoose';

const NotesScheme = new Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, { timestamps: true })

export const Notes = mongoose.model('Notes', NotesScheme);