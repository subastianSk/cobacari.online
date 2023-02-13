const mongoose = require("mongoose");
const {
    ObjectId
} = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: ObjectId,
        ref: "Product",
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    IsActive: {
        type: Boolean,
        required: true,
        default: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);