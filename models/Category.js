const mongoose = require("mongoose")
const { paramCase } = require("change-case")
const SubCategory = require("./SubCategory")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const CategorySchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		main_category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MainCategory",
		},
		slug: {
			type: String,
			lowercase: true,
			unique: true,
			default: function () {
				return paramCase(this.name)
			},
		},
	},
	{
		timestamps: true,
	}
)

CategorySchema.pre("deleteOne", async function () {
	let subcat = await SubCategory.find({ category: this._id }).exec()
	await Promise.all(subcat.map((s) => subcat.deleteOne()))
})

module.exports = Category = mongoose.model(
	"Category",
	PostDelete(CategorySchema, "Category")
)
