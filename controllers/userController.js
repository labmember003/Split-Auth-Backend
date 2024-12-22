const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "SPLIT";
require("dotenv").config();
const passport = require("passport")
const { OAuth2Client } = require("google-auth-library");


const googleOneTap = async (req, res) => {
  passport.authenticate("google", { failureRedirect: "/signup" });
  try {
    const googleToken = req.body.googleToken;
    const clientId = process.env.GOOGLE_CLIENT_ID; // Use environment variable
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: clientId ,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    // Use environment variable

    let existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      const jwtToken = jwt.sign({ user: email, id: payload.name }, SECRET_KEY); 
      existingUser = await userModel.create({
        username: payload.name,
        email: email,
        img: payload.picture,
        token: jwtToken
      });
    }
    res.status(201).json({
      user: existingUser.username,
      email: existingUser.email,
      img: existingUser.img,
      token: existingUser.token,
    });
  } catch (error) {
    console.error("Google token verification failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { googleOneTap };