const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true }, 
	password: { type: String, required: true },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date },
	adresse: { type: String, required: true },
	phonenumber: { type: Number, required: true },
	role: { type: String, enum: ["user", "admin", "manager"], default: "user" },
	isVerified: { type: Boolean, default: false },  // For email verification status
	verificationToken: { type: String },  // Store verification token
	verificationTokenExpires: { type: Date } // Token expiration time
});

// Generate Auth Token with role
userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{ _id: this._id, role: this.role }, // Include role in the token payload
		process.env.JWTPRIVATEKEY,
		{
			expiresIn: "7d",
		}
	);
	return token;
};

const User = mongoose.model("user", userSchema);

// Validate user creation or update
const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
		adresse: Joi.string().required().label("Adresse"),
		phonenumber: Joi.number().required().label("Phone Number"),
		role: Joi.string().valid("user", "admin", "manager").label("Role") // Validate role
	});
	return schema.validate(data);
};

module.exports = { User, validate };
