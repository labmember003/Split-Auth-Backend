const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    username: {
        type : String,
        required : true
    },
    password: {
        type : String
    },
    email: {
        type : String,
        required : true
    },
    img:{
        type : String
    }
}, {timestamps : true});
module.exports = mongoose.model("User", userSchema);
