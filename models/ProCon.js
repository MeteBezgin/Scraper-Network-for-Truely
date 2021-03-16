const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const ProConSchema = new Schema({
	text: { type: String, required: true },
	vote: { type: Number, min: 0, default: 0 },
	status: { type: String, enum: ["Pro", "Con"] },
	service: { type: Schema.Types.ObjectId, index: true, required: true },
})

module.exports = ProCon = mongoose.model("ProCon", ProConSchema)
