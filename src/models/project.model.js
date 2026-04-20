import { mongoose, Schema } from 'mongoose';

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        uniqie: true,
        trim:true,
    },
    description: {
        type: String,
    },
    createdBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

}, { timestamps: true })

projectSchema.pre('findOneAndDelete', async function (next)
{
    const doc=await this.model.findOne(this.getQuery());
    
    if (doc)
    {
        await mongoose.model('ProjectMember').deleteMany({ project: doc._id })
    }
})

export const Project = mongoose.model('Project', projectSchema);

