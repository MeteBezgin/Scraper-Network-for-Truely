const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const CompanySchema = new Schema(
	{
		name: { type: String, required: true, unique: true },
		affiliate_link: { type: String },
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
		},
	},
	{
		timestamps: true,
	}
)

module.exports = Company = mongoose.model(
	"Company",
	PostDelete(CompanySchema, "Company")
)
