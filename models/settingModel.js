const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    flagBlockNumber: {
        type: Number,
        required: true,
        max: 64,
    },
});

module.exports = mongoose.model("Setting", SettingSchema);