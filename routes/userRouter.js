const express = require("express");
const { googleOneTap} = require("../controllers/userController");
const userRouter = express.Router();
userRouter.post("/googleOneTap", googleOneTap);

module.exports = userRouter;