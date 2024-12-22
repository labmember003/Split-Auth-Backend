const express = require('express');
const app = express();
const dotenv = require("dotenv");
const userRouter = require("./routes/userRouter");
dotenv.config();


app.get('/', (req, res) => res.send('Home Page Route'));
app.use("/users", userRouter);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));