import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  tokenExpiryDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
