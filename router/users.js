const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

router.post("/", async (req, res) => {
	try {
		
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser)
			return res.status(409).send({ message: "User with given email already exists!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		const verificationToken = crypto.randomBytes(32).toString("hex");
		const verificationTokenExpires = Date.now() + 3600000; // 1 hour expiration

		const user = new User({
			...req.body,
			password: hashPassword,
			verificationToken,
			verificationTokenExpires
		});
		await user.save();

		// Send verification email
		const transporter = nodemailer.createTransport({
			service: "Gmail", // or your email service provider
			auth: {
				user: process.env.EMAIL, // your email
				pass: process.env.EMAIL_PASSWORD, // your email password
			},
		});

		const mailOptions = {
			from: process.env.EMAIL,
			to: user.email,
			subject: "AlloMedia Email Verification",
			text: `Click the link to verify your email: ${process.env.BASE_URL}/api/users/verify/${user.verificationToken}`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Error sending email:", error);
				return res.status(500).send({ message: "Error sending verification email" });
			}
			res.status(201).send({ message: "User registered successfully. Please check your email to verify your account." });
		});
	} catch (error) {
		console.error("Error in /api/users route:", error); 
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
