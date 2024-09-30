router.get("/verify/:token", async (req, res) => {
	try {
		// Find the user by the verification token
		const user = await User.findOne({
			verificationToken: req.params.token,
			verificationTokenExpires: { $gt: Date.now() } // Check if token is still valid
		});

		if (!user)
			return res.status(400).send({ message: "Invalid or expired token" });

		// Mark user as verified
		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpires = undefined;
		await user.save();

		res.status(200).send({ message: "Email verified successfully. You can now login." });
	} catch (error) {
		console.error("Error in /api/users/verify route:", error); 
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
