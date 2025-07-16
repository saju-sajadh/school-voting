import mongoose from "mongoose";

const NomineeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  nominees: {
    type: [NomineeSchema],
    default: [],
  },
});

const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  categories: {
    type: [CategorySchema],
    default: [],
  },
});

const ElectionModel =
  mongoose.models.Election || mongoose.model("Election", ElectionSchema);

export default ElectionModel;