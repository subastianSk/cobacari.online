const mongoose = require("mongoose");
const {
    ObjectId
} = mongoose.Schema.Types;
const GeoSchema = new mongoose.Schema({

});
const productSchema = new mongoose.Schema({
    // _id: {
    //     type: mongoose.Types.ObjectId,
    //     required: true
    // },
    Title: {
        type: String,
        required: true,
    },
    Price: {
        type: String,
        required: true,
    },
    Address: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    Tag: {
        type: String,
        required: true,
    },
    Unit: {
        type: String,
        // enum: ["KM", "HM", "DAM", "M", "DM", "CM", "MM"]
    },
    imageUrl: [{
        type: Array,
        required: true
    }],
    IsActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    location: {
        type: {
            type: String
        },
        coordinates: []
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]

}, {
    timestamps: true
});

productSchema.index({
    location: "2dsphere"
});


module.exports = mongoose.model("Product", productSchema);