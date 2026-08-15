import mongoose from "mongoose";

const goal = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    monthlyContribution: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const Goal = mongoose.model("Goal", goal);

export default Goal;
