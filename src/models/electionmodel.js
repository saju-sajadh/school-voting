import mongoose from "mongoose";

const NomineeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  nominees: {
    type: [NomineeSchema],
  },
});

const ElectionModel =
  mongoose.models.Election || mongoose.model("Election", ElectionSchema);
export default ElectionModel;
