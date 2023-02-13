const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function toLower(str) {
    return str.toLowerCase();
}
const userSchema = new mongoose.Schema({
    // _id: {
    //     type: mongoose.Types.ObjectId,
    //     required: true
    // },
    fullname: {
        type: String,
        required: [true, "Please enter a Fullname"]
    },
    username: {
        type: String,
        required: [true, "Please enter a name"],
    },
    email: {
        type: String,
        set: toLower,
        required: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'],
        unique: [true, "Email already exists"]
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    dateOfBirth: {
        type: Date,
        required: [false, "Please enter your date of birth"]
    },
    address: {
        type: String,
        required: [false, "Please enter your address"]
    },
    city: {
        type: String,
        required: [false, "Please enter your city"]
    },
    state: {
        type: String,
        required: [false, "Please enter your state"]
    },
    zipCode: {
        type: String,
        required: [false, "Please enter your zip code"]
    },
    phoneNumber: {
        type: String,
        required: [false, "Please enter your phone number"],
        // match: [/^\+62\d{12,13}$/, 'Invalid phone number, should start with +62 and contain 12-13 digits'],
        unique: [true, "Phone number already exists"]
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    versionKey: false
}, {
    timestamps: true
});


const validate = (user) => {
    const schema = Joi.object({
        fullname: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(user);
};
const validateProfile = (profile) => {
    const schema = Joi.object({
        phoneNumber: Joi.string()
            .regex(/^\+62\d{12,13}$/)
            .required()
            .messages({
                "string.pattern.base": "Invalid phone number, should start with +62 and contain 12-13 digits",
            }),
        zipCode: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
        dateOfBirth: Joi.date().required(),
    });

    return schema.validate(profile);
};


userSchema.methods.generateToken = async function () {
    const jwtToken = jwt.sign({
        _id: this._id
    }, process.env.JWT_SECRET);
    return jwtToken
}

userSchema.methods.getresetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    return resetToken
}

// module.exports  = { User, validate};
module.exports = mongoose.model("User", userSchema);