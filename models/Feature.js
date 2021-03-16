const mongoose = require("mongoose")
const { paramCase } = require("change-case")
const { PostDelete } = require("../middlewares")

const { Schema } = mongoose

const FeatureSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		topic: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "FeatureTopic",
		},
		unique_value: {
			type: String,
			default: function () {
				return paramCase(this.name.trim().toLowerCase())
			},
			unique: true,
		},
	},
	{ timestamps: true }
)

module.exports = Feature = mongoose.model(
	"Feature",
	PostDelete(FeatureSchema, "Feature")
)
