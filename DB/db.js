const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // console.log(process.env.MONGO_URI);
        const url_connection = process.env.MONGO_URI

        mongoose.set("strictQuery", false);
        const conn = await mongoose.connect(url_connection, {
            useNewUrlParser: true,
            socketTimeoutMS: 5000 // wait for 5 seconds for a reply before timing out
        });

        // console.log(`Mongo database connected ...`);

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

connectDB()

module.exports = connectDB;