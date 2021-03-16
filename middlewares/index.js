const Deleted = require("../models/Deleted")

const PostDelete = (Schema, ModelName) => {
	Schema.post("deleteOne", { document: true }, async function () {
		await new Deleted({
			object: this,
			model: ModelName,
		}).save()
	})
	return Schema
}

module.exports = {
	PostDelete,
}
