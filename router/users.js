const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

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
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
					<h2 style="color: #333; text-align: center;">Welcome to AlloMedia!</h2>
					<p style="font-size: 16px; color: #333;">
						Hi ${user.firstName},
					</p>
					<p style="font-size: 16px; color: #333;">
						Thank you for registering with AlloMedia. To complete your registration, please verify your email address by clicking the button below:
					</p>
					<div style="text-align: center; margin: 20px 0;">
						<a href="${process.env.BASE_URL}/api/users/verify/${user.verificationToken}" 
						   style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
							Verify Email
						</a>
					</div>
					<p style="font-size: 16px; color: #333;">
						Or copy and paste the following link into your browser:
					</p>
					<p style="font-size: 16px; color: #333; word-break: break-word;">
						${process.env.BASE_URL}/api/users/verify/${user.verificationToken}
					</p>
					<p style="font-size: 16px; color: #333;">
						This link will expire in 1 hour.
					</p>
					<p style="font-size: 16px; color: #333;">
						If you did not register with AlloMedia, please ignore this email.
					</p>
					<p style="font-size: 16px; color: #333;">
						Best regards,<br>
						The AlloMedia Team
					</p>
					<hr style="border-top: 1px solid #ddd;" />
					<p style="font-size: 12px; color: #777; text-align: center;">
						© AlloMedia 2024. All rights reserved.
					</p>
				</div>
			`,
		};
		


		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Error sending email:", error);
				return res.status(500).send({ message: "Error sending verification email" });
			}
			
			res.status(201).send({ message: "User registered successfully. Please check your email to verify your account." });
		});
		user.isVerified = true;
		await user.save({validateBeforeSave:false});
		
	} catch (error) {
		console.error("Error in /api/users route:", error); 
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
