const mongoose = require("mongoose")
const { PostDelete } = require("../middlewares")
const { Schema } = mongoose

const ScraperSchema = new Schema({
	name: String,
	last_invocation: Date,
	status: {
		type: String,
		enum: ["Idle", "Running", "Error", "Not built yet"],
	},
	request: {
		type: String,
		enum: ["True", "False"],
	},
	error: Object,
})

module.exports = Scraper = mongoose.model("Scraper", ScraperSchema)
