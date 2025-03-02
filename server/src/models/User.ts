// User schema for MongoDB
import mongoose, {Document, Schema} from "mongoose";

interface IUser extends Document {
    _id: string
    admin: boolean
    username: string
    password?: string
    googleId?: string
}

const UserSchema: Schema = new Schema({
    admin: {type: Boolean, required: true, default: false},
    username: {type: String, required: true},
    password: {type: String, required: false},
    googleId: {type: String, required: false}
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema)

export {User, IUser}