const mongoose = require("mongoose")
const { Schema } = mongoose

const PlanSchema = new Schema({
	name: { type: String },
	pricing: {
		price: Number,
		currency: {
			type: String,
			enum: ["American Dollar ($)", "Euro (€)", "Sterling (£)"],
			default: "American Dollar ($)",
		},
		billing_frequency: {
			type: String,
			enum: ["Daily", "Weekly", "Monthly", "Annually", "One_Time_Purchase"],
			default: "Monthly",
		},
	},
	addons: [
		{
			name: { type: String },
			price: Number,
			// We should use the pricing's currency as the addons currency.
		},
	],
	inclusions: [
		{
			name: { type: String },
		},
	],
})

module.exports = PlanSchema
