import mongoose from "mongoose";

const budgetItem = new mongoose.Schema(
  {
    category: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      value: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["FIXED", "FLEXIBLE", "GOAL"],
      required: true,
    },
  },
  { _id: false },
);

const budget = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    income: {
      type: Number,
      required: true,
      min: 0,
    },
    items: {
      type: [budgetItem],
      default: [],
    },
  },
  { timestamps: true },
);

budget.index({ user: 1, periodStart: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budget);

export default Budget;
