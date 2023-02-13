const http = require('http');

const app = require("./app");
const connectDB = require("./DB/db");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const port = process.env.PORT || 50054;

connectDB()
    .then(() => {
        console.log("Mongo database connected");
        const server = http.createServer(app);
        server.listen(port, () => {
            console.log(`Server is running on http: //localhost:${port}`);
        });
    })
    .catch(error => {
        console.error(error);
    });