// router/auth.js

const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const crypto = require("crypto");




// Verify 2FA Code route
router.post("/verify-2fa", async (req, res) => {
	try {
		const { email, twoFACode } = req.body;

		// Find the user by email
		const user = await User.findOne({ email });
		if (!user) return res.status(401).send({ message: "Invalid email or code" });

		// Log the user and 2FA data for debugging
		console.log("User found:", user);
		console.log("Stored 2FA Code:", user.twoFACode);
		console.log("Provided 2FA Code:", twoFACode);
		console.log("Code Expiry Time:", new Date(user.twoFACodeExpires));
		console.log("Current Time:", new Date());

		// Check if the 2FA code is valid and not expired
		if (user.twoFACode !== twoFACode) {
			return res.status(401).send({ message: "Invalid 2FA code" });
		}

		if (user.twoFACodeExpires < Date.now()) {
			return res.status(401).send({ message: "Expired 2FA code" });
		}

		// Generate JWT token upon successful 2FA verification
		const token = user.generateAuthToken();

		// Clear 2FA code after successful verification
		user.twoFACode = undefined;
		user.twoFACodeExpires = undefined;
		await user.save();

		// Send success response with the token
		res
			.cookie("token", token, {
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000, // Token expiration set to 24 hours
			})
			.json({
				success: true,
				code: 200,
				message: "2FA verification successful, logged in.",
			});
	} catch (error) {
		console.error("Error in 2FA verification:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});


router.post("/forgetpassword", async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) return res.status(404).send({ message: "User not found" });

		// Generate password reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
		await user.save();

		// Send email with password reset token
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		const mailOptions = {
			from: process.env.EMAIL,
			to: user.email,
			subject: "Password Reset",
			text: `Click the following link to reset your password: ${process.env.FRONT_URL}/auth/reset-password/${resetToken}`,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) return res.status(500).send({ message: "Error sending email" });
			res.status(200).send({ message: "Password reset email sent" });
		});
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});
module.exports = router;

router.post("/resetpassword", async (req, res) => {
	try {
		const { token, password } = req.body; 

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() }, 
		});

		if (!user) {
			return res.status(400).send({ message: "Invalid or expired token" });
		}

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		user.password = await bcrypt.hash(password, salt);

		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		res.status(200).send({ message: "Password reset successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});
module.exports = router;


// Existing login route
router.post("/login", async (req, res) => {
	try {
	  const { email, password } = req.body;
  
	  // Find user by email
	  const user = await User.findOne({ email });
	  if (!user) return res.status(401).send({ message: "Invalid email or password" });
  
	  // Check if the user's email is verified
	  if (!user.isVerified) {
		return res.status(403).send({ message: "Please verify your email before logging in." });
	  }
  
	  // Validate password
	  const isPasswordValid = await bcrypt.compare(password, user.password);
	  if (!isPasswordValid) return res.status(401).send({ message: "Invalid email or password" });
  
	  // Login successful, send success response
	  res.status(200).send({ message: "Login successful!" });
	} catch (error) {
	  console.error("Error in login route:", error);
	  res.status(500).send({ message: "Internal Server Error" });
	}
  });
  



// router.post("/verify-2fa", async (req, res) => {
// 	try {
// 		const { email, twoFACode } = req.body;


// 		// Find the user by email
// 		const user = await User.findOne({ email });
// 		if (!user) return res.status(401).send({ message: "Invalid email or code" });

// 		// Check if the 2FA code is valid and not expired
// 		if (
// 			user.twoFACode !== twoFACode ||
// 			user.twoFACodeExpires < Date.now()


// 		) {
// 			return res.status(401).send({ message: "Invalid or expired 2FA code" });
// 		}



// 		// Generate JWT token upon successful 2FA verification
// 		const token = user.generateAuthToken();

// 		// Clear 2FA code after successful verification
// 		user.twoFACode = undefined;
// 		user.twoFACodeExpires = undefined;
// 		await user.save();

// 		// Send success response with the token
// 		res
// 		.cookie("token", token, {
// 			httpOnly: true,
// 			maxAge: 24 * 60 * 60 * 1000,
// 		})
// 		.json({ 
// 			success:true,
// 			code: 200,
// 			message: "2FA verification successful, logged in." 
// 		});

// 	} catch (error) {
// 		res.status(500).send({ message: "2FA verification successful, logged in." });
// 	}
// });

// Validation schema for login
const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = router;
