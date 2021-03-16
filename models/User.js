const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

/**
 * A simple helper function to determine if given email is valid or not.
 *
 * @param {String} email
 * @returns {Boolean}
 */
const isEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	if (email.match(regEx)) return true
	else return false
}

const UserSchema = new Schema(
	{
		name: {
			type: String,
		},
		role: {
			type: String,
			enum: ["admin", "contentTeam"],
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validate: [isEmail, "Please provide a valid email"],
		},
		password: {
			type: String,
			min: [8, "Password should be 8 characters long minimum"],
			required: true,
		},
	},
	{ strict: false, timestamps: true }
)

/**
 * Function to take place before saving a User model,
 * hashes the password.
 *
 * Also, create a track_id here, so that when Admin creates a User object
 * it gets a track_id as well.
 */
UserSchema.pre(["save", "insert"], function (next) {
	let user = this
	if (this.isModified("password") || this.isNew) {
		bcrypt.hash(user.password, 10, function (err, hash) {
			if (err) {
				return next(err)
			}
			user.password = hash
			next()
		})
	} else {
		return next()
	}
})

/**
 * We want the hashing function to take place when insertMany
 */
UserSchema.pre("insertMany", function (docs, next) {
	let promises = docs.map((doc) => {
		if (doc.isModified("password") || doc.isNew) {
			bcrypt.hash(doc.password, 10, function (err, hash) {
				if (err) {
					return next(err)
				}
				doc.password = hash
			})
		}
	})
})

/*

 *
 *
 * @param {String} passw password
 * @param {Function} cb Call back function
 *
 * A custom method that compare's a User object's password with a given password in parameters.
 *
 
*/

UserSchema.methods.comparePassword = function (passw) {
	let user_pass = this.password
	return new Promise(function (res, rej) {
		bcrypt
			.compare(passw, user_pass)
			.then((isMatch) => {
				console.log(isMatch)
				return res(isMatch)
			})
			.catch((err) => {
				console.error(err)
				return rej(err)
			})
	})
}

// Let's index email and password for better query times.
module.exports = User = mongoose.model("User", UserSchema)
