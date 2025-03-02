// Column schema for the big columns that contain cards on the main page
import mongoose, {Document, Schema} from "mongoose";

interface IColumn extends Document {
    title: string
    cards?: Array<string>
    boardId: string
}

const ColumnSchema: Schema = new Schema({
    title: {type: String, required: true},
    cards: [{
        type: Schema.Types.ObjectId,
        ref: "Card",
        required: false
    }],
    boardId: {type: String, required: true}
})

const Column: mongoose.Model<IColumn> = mongoose.model<IColumn>("Column", ColumnSchema)

export {Column, IColumn}