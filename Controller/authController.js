const dotenv = require("dotenv");
const { User, validate } = require("../models/user");

dotenv.config();


async function vrfyOTP(req, res) {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send("Invalid or expired verification token");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.redirect(`${process.env.FRONT_URL}/auth/login`);
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).send("Error verifying email");
    }
}

module.exports = { vrfyOTP };
