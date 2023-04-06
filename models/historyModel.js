const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
        max: 64,
    },
    to: {
        type: String,
        required: true,
        max: 64,
    },
    value: {
        type: Number,
        required: true,
    },
    timestap: {
        type: Number,
    },
    blockNumber: {
        type: Number,
    },
    txHash: {
        type: String,
    },
    getByEvent: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("History", HistorySchema);