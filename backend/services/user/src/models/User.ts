import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    image: string;  
    instagram: string;
    facebook: string;
    linkedin: string;
    bio: string;
}

const schema : mongoose.Schema<IUser> = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    instagram: {
        type: String
    },
    facebook: {
        type: String
    },
    linkedin: {
        type: String
    },
    bio: {
        type: String
    }
}, {
    timestamps: true
});

const User= mongoose.model<IUser>("User", schema);

export default User