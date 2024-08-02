require("dotenv").config();
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const PORT = 3000;

// const MONGODB_URI =
//     process.env.NODE_ENV === "test"
//         ? process.env.TEST_MONGODB_URI
//         : process.env.MONGODB_URI;

const connectToDatabase = async () => {
    if (process.env.NODE_ENV !== "test") {
        mongoose
            .connect(process.env.MONGODB_URI)
            .then(() => {
                console.log("connected to MongoDB");
            })
            .catch((err) => {
                console.log("failed to connect to MongoDB:", err.message);
            });
    } else {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        mongoose
            .connect(uri)
            .then(() => {
                console.log("connected to Mongo memory server");
            })
            .catch((err) => {
                console.log("Mongo memory server failed to load:", err.message);
            });
    }
};

module.exports = {
    PORT,
    connectToDatabase,
};
