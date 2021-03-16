const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose
const { paramCase } = require("change-case")

const ResponseSchema = new Schema({
	domain: { type: String, required: true },
	description: String,
	type: { type: String },
	parsed: { type: Boolean, default: false },
})

const MLStatusSchema = new Schema({
	message: String,
	lastUpdated: Date,
	status: {
		type: String,
		enum: ["Processed", "Processing", "Error", "Not Sent"],
		default: "Not Sent",
	},
})

const SubCategorySchema = new Schema(
	{
		name: { type: String, required: true },
		request_status: {
			type: String,
			enum: [
				"Parsed",
				"Processing",
				"Waiting Result",
				"No Action",
				"Failed",
				"Task Complete",
			],
			default: "No Action",
		},
		live_status: {
			type: String,
			enum: ["Live", "Draft"],
			default: "Draft",
		},
		image_link: String,
		ml_status: { MLStatusSchema },
		meta_description: String,
		slug: {
			type: String,
			lowercase: true,
			unique: true,
			default: function () {
				return paramCase(this.name)
			},
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
		},
		content: Object,
		dataforseo: { type: Object, default: {} },
		features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
		responses: [ResponseSchema],
		scorename_1: {
			type: String,
			required: false,
		},
		scorename_2: {
			type: String,
			required: false,
		},
		scorename_3: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true,
		strict: false,
		strictQuery: false,
	}
)

SubCategorySchema.index({ slug: 1 })
SubCategorySchema.index({ updatedAt: 1 })

SubCategorySchema.pre("deleteOne", async function () {
	let services = await Service.find({ sub_category: this._id }).exec()
	await Promise.all(services.map((s) => s.deleteOne()))
})

module.exports = SubCategory = mongoose.model(
	"SubCategory",
	PostDelete(SubCategorySchema, "SubCategory")
)
