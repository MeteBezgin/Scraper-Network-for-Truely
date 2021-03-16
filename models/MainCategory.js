const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const Category = require("./Category")
const { Schema } = mongoose

const MainCategorySchema = new Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
	}
)

MainCategorySchema.pre("deleteOne", async function () {
	let cat = await Category.find({ category: this.category }).exec()
	await Promise.all(cat.map((c) => c.deleteOne()))
})

module.exports = MainCategory = mongoose.model(
	"MainCategory",
	PostDelete(MainCategorySchema, "MainCategory")
)
