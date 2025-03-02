// Card schema that represents the card inside the columns on the kanban board
import mongoose, { Document, Schema } from "mongoose";

interface ICard extends Document {
  title: string
  subtitle: string
  description?: string
  color?: string
  columnId: string
  order: number
  workload?: string
}


const CardSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: false },
  color: { type: String, required: false, default: "0" },
  order: {type: Number, required: false},
  workload: {type: String, required: false, default: 0},
  columnId: {
    type: Schema.Types.ObjectId,
    ref: "Column",
    required: true
  }
})


/*color coding:
    0: White
    1: Red
    2: Green
    3: Blue
    4: Yellow
    5: Gray
*/

const Card: mongoose.Model<ICard> = mongoose.model<ICard>("Card", CardSchema)

export { Card, ICard }