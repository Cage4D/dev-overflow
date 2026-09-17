import { model, models, Schema, Types } from "mongoose";

export interface ICollection {
  author: string;
  question: Types.ObjectId;
}

const CollectionSchema = new Schema<ICollection>(
  {
    author: { type: String, required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true },
);

const Collection =
  models?.Collection || model<ICollection>("Collection", CollectionSchema);
export default Collection;
