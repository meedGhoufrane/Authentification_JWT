const request = require("supertest");
const { User } = require("../models/user");
const app = require("../index");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

jest.mock("nodemailer");

let mongoServer;



afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash( "Dzd12345678!", salt);

  const user = new User({
    email:"baloncias@gmail.com",
     password: hashPassword ,
     firstName : "nadi",
     lastName : "zrgfsd",
     phonenumber : "04949390",
     adresse :"efkezo,foze,f"
})
  await user.save();
});
describe("POST /api/auth", () => {
  let user;
  

  it("should login the user and send a 2FA code via email", async () => {
  
    const res = await request(app)
      .post("/api/auth")
      .send({ email:'baloncias@gmail.com', password: "Dzd12345678" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(
      "User registered successfully. Please check your email to verify your account."
    );

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: "Your 2FA Verification Code",
      })
    );

    const updatedUser = await User.findOne({ email: user.email });
    expect(updatedUser.twoFACode).toBeDefined();
    expect(updatedUser.twoFACodeExpires).toBeGreaterThan(Date.now());
  });
});

// describe("POST /api/auth/verify-2fa", () => {
//   let user;
//   let twoFACode;

//   beforeEach(async () => {
//     await User.deleteMany({});
//     twoFACode = crypto.randomInt(100000, 999999).toString();

//     user = new User({
//       email: "test@example.com",
//       password: "123456", // Hash if required
//       twoFACode,
//       twoFACodeExpires: Date.now() + 10 * 60 * 1000,
//     });
//     await user.save();
//   });

//   it("should return a JWT token if the 2FA code is correct", async () => {
//     const res = await request(app)
//       .post("/api/auth/verify-2fa")
//       .send({ email: user.email, twoFACode });

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe("2FA verification successful, logged in.");
//     expect(res.body.data).toBeDefined();

//     const updatedUser = await User.findOne({ email: user.email });
//     expect(updatedUser.twoFACode).toBeUndefined();
//     expect(updatedUser.twoFACodeExpires).toBeUndefined();
//   });

//   it("should return 401 if the 2FA code is invalid", async () => {
//     const res = await request(app)
//       .post("/api/auth/verify-2fa")
//       .send({ email: user.email, twoFACode: "wrong-code" });

//     expect(res.status).toBe(401);
//     expect(res.body.message).toBe("Invalid or expired 2FA code");
//   });

//   it("should return 401 if the 2FA code is expired", async () => {
//     user.twoFACodeExpires = Date.now() - 10 * 60 * 1000;
//     await user.save();

//     const res = await request(app)
//       .post("/api/auth/verify-2fa")
//       .send({ email: user.email, twoFACode });

//     expect(res.status).toBe(401);
//     expect(res.body.message).toBe("Invalid or expired 2FA code");
//   });
// });
