const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const ParsedReviewSchema = new Schema(
	{
		reviewtext: { type: String, required: true },
		rating: { type: String },
		service: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Service",
		},
		sub_category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SubCategory",
		},
		review_site: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ReviewSite",
		},
		url: { type: String, required: true },
	},
	{ strict: false, strictQuery: false }
)

module.exports = ParsedReview = mongoose.model(
	"ParsedReview",
	PostDelete(ParsedReviewSchema, "ParsedReview")
)
