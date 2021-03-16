const mongoose = require("mongoose")
const { paramCase } = require("change-case")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const FeatureTopicSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
})

module.exports = FeatureTopic = mongoose.model(
	"FeatureTopic",
	PostDelete(FeatureTopicSchema, "FeatureTopic")
)
