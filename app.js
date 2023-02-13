const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const product = require('./routes/Product.route');
const comment = require('./routes/Comment.route')
const cors = require('cors');
const user = require("./routes/user");
const path = require('path');

app.use(cors());
app.options('*', cors())


// console.log("tempat dir: ", __dirname + '/public/images');
app.use('/public/uploads', express.static(__dirname + '/public/images'));

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

//____
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use("/api/v2", comment);
app.use("/api/v1", product);
app.use("/", user);
app.use("/api/v1", user);

module.exports = app