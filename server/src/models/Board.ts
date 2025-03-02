// Column schema for the big columns that contain cards on the main page

//hierarchy: Board -> column -> card
import mongoose, {Document, Schema} from "mongoose";

interface IBoard extends Document {
    title: string
    columns?: Array<string>
    owner: string
}

const BoardSchema: Schema = new Schema({
    title: {type: String, required: true},
    columns: [{
        type: Schema.Types.ObjectId,
        ref: "Column",
        required: false
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const Board: mongoose.Model<IBoard> = mongoose.model<IBoard>("Board", BoardSchema)

export {Board, IBoard}