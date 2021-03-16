const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const ParsedReview = require("./ParsedReview")
const { Schema } = mongoose

const ReviewSiteSchema = new Schema({
	main_category: { type: Schema.Types.ObjectId, ref: "MainCategory" },
	category: { type: Schema.Types.ObjectId, ref: "Category" },
	sub_category: { type: Schema.Types.ObjectId, ref: "SubCategory" },
	service: { type: Schema.Types.ObjectId, ref: "Service" },
	domain: { type: String },
	icon: String,
	name: { type: String, unique: true },
})

ReviewSiteSchema.pre("deleteOne", async function () {
	let reviews = await ParsedReview.find({ review_site: this.id }).exec()
	await Promise.all(reviews.map((r) => r.deleteOne()))
})

module.exports = ReviewSite = mongoose.model(
	"ReviewSite",
	PostDelete(ReviewSiteSchema, "ReviewSite")
)
