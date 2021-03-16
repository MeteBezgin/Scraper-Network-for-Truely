const mongoose = require("mongoose")
const { Schema } = mongoose

const DeletedSchema = new Schema(
	{
		object: Object,
		model: String,
	},
	{ timestamps: true }
)

module.exports = Deleted = mongoose.model("Deleted", DeletedSchema)
