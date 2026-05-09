const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  keywords:  { type: String, default: "" },
  budget:    { type: Number, default: 0 },
  days:      { type: Number, default: 0 },
  transport: { type: String, default: "" },
  members:   { type: Number, default: 0 },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
