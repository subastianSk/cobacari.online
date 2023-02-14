const User = require("../models/User")
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
const {
    validateProfile
} = require('../models/User');

// Register user
exports.register = async (req, res) => {
    try {
        // check is username already exists
        const selectUsername = await User.findOne({
            username: req.body.username
        })
        if (selectUsername) {
            return res.status(406).send({
                status: {
                    status: 0,
                    message: "Username already taken! Try another one"
                },
                data: null
            });
        }

        // check if email already exists
        const selectEmail = await User.findOne({
            email: req.body.email
        });

        if (selectEmail) {
            return res.status(406).send({
                status: {
                    status: 0,
                    message: "Email already taken! Try another one"
                },
                data: null
            });
        }

        // save the data
        let registerData = new User({
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            password: md5(req.body.password)
        });

        const result = await registerData.save();
        return res.send({
            status: {
                status: 1,
                message: "User created successfully"
            },
            data: {
                fullname: result.fullname,
                username: result.username,
                email: result.email,
                password: result.password
            }
        });

    } catch (error) {
        console.log("try catch err: ", error);
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            }
        });
    }
};



// Login User
exports.login = async (req, res) => {
    try {
        const username = req.body.username;
        const password = md5(req.body.password);

        // Find the user by username
        const foundUser = await User.findOne({
            username
        });

        // If the user exists
        if (foundUser) {
            // Generate a JWT token
            const jwtToken = await foundUser.generateToken();

            // Set the JWT token as a cookie in the response
            res.status(200).cookie("jwtToken", jwtToken, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }).json({
                status: {
                    status: 1,
                    message: ["Login Success"],
                },
                token: jwtToken
            });
        } else {
            // If the user doesn't exist
            res.status(404).send({
                status: {
                    status: 0,
                    message: "Login failed"
                }
            });
        }
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}



// lupa Password
exports.forgetpassword = async (req, res) => {
    const {
        email
    } = req.body;

    try {
        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Please check your email"
                }
            });
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            timestamp: new Date().getTime()
        }, process.env.JWT_SECRET, {
            expiresIn: "20m"
        });

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'NO-REPLY',
            to: user.email,
            subject: "Reset your password",
            html: `
            <div>
                <h1>Reset your password</h1>
                <p>Click the link below to reset your password</p>
                <p>This link will expire in 20 minutes</p>
                <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a>
                <p>or</>
                <a href="${process.env.CLIENT_URL}/reset-password/${token}">${process.env.CLIENT_URL}/reset-password/${token}</a>
                <p>Thank you</p>
            </div>
            `
        };
        console.log(user.email);
        transporter.sendMail(mailOptions, (error, info) => {
            console.log(error);
            console.log(info);
            return res.status(200).json({
                status: {
                    status: 1,
                    message: ["Forget Password Success"],
                }
            });
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

// Riset Password
exports.resetpassword = async (req, res) => {
    const {
        password,
        token
    } = req.body;

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            email: verify.email
        });

        if (!user) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "Please check your email"
                }
            });
        }

        const hashPass = await bcrypt.hash(password, 12);

        await User.findOneAndUpdate({
            _id: user._id
        }, {
            password: hashPass
        });

        return res.status(200).json({
            status: {
                status: 1,
                message: ["Riset Password Success"],
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

// logout user
exports.logout = async (req, res) => {
    try {
        // Check if the user is already logged out
        if (!req.cookies.jwtToken) {
            return res.status(400).json({
                status: {
                    status: 0,
                    message: "You are already logged out"
                }
            });
        }
        // Verify the JWT token
        const decoded = await jwt.verify(req.cookies.jwtToken, process.env.JWT_SECRET);

        // Remove the JWT token from the cookie
        res.clearCookie("jwtToken").json({
            status: {
                status: 1,
                message: "Successfully logged out"
            }
        });
    } catch (error) {
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            }
        });
    }

};

// Create Profile User
exports.createProfile = async (req, res) => {
    try {
        // Verify the JWT token
        if (!req.header("Authorization")) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Unauthorized. No token provided."
                },
                data: null
            });
        }
        const token = req.header("Authorization").replace("Bearer ", "");
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    status: {
                        status: 0,
                        message: "Unauthorized. Invalid token."
                    },
                    data: null
                });
            }
        }

        // Check if the user has already created a profile
        const user = await User.findOne({
            _id: decoded._id
        });
        if (!user) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Unauthorized. User not found."
                },
                data: null
            });
        }
        if (user.phoneNumber || user.zipCode || user.state || user.city || user.address || user.dateOfBirth) {
            return res.status(400).json({
                status: {
                    status: 0,
                    message: "Profile already exists"
                },
                data: null
            });
        }
        // Get the profile details from the request body
        const {
            phoneNumber,
            zipCode,
            state,
            city,
            address,
            dateOfBirth
        } = req.body;
        // Update the user profile
        user.phoneNumber = phoneNumber;
        user.zipCode = zipCode;
        user.state = state;
        user.city = city;
        user.address = address;
        user.dateOfBirth = dateOfBirth;
        const result = await user.save();

        // Send the response
        res.json({
            status: {
                status: 1,
                message: "Profile created successfully"
            },
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};


// Get Profile User
exports.getProfileById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                status: {
                    status: 0,
                    message: "User not found"
                },
                data: null
            });
        }

        if (!user.phoneNumber || !user.zipCode || !user.state || !user.city || !user.address || !user.dateOfBirth) {
            user.phoneNumber = null;
            user.zipCode = null;
            user.state = null;
            user.city = null;
            user.address = null;
            user.dateOfBirth = null;
        }

        const result = await user.save();

        res.json({
            status: {
                status: 1,
                message: "Profile retrieved successfully"
            },
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};


// edit Profile
exports.editProfile = async (req, res) => {
    try {
        // Verify the JWT token
        if (!req.header("Authorization")) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }
        const token = req.header("Authorization").replace("Bearer ", "");
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    status: {
                        status: 0,
                        message: "Unauthorized. Invalid token."
                    },
                    data: null
                });
            }
        }

        // Get the updated profile details from the request body
        const {
            phoneNumber,
            zipCode,
            state,
            city,
            address,
            dateOfBirth
        } = req.body;
        // Update the user profile
        const user = await User.findOne({
            _id: decoded._id
        });
        if (!user) {
            return res.status(401).json({
                status: {
                    status: 0,
                    message: "Not authorized"
                },
                data: null
            });
        }
        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
        }
        if (zipCode) {
            user.zipCode = zipCode;
        }
        if (state) {
            user.state = state;
        }
        if (city) {
            user.city = city;
        }
        if (address) {
            user.address = address;
        }
        if (dateOfBirth) {
            user.dateOfBirth = dateOfBirth;
        }

        const result = await user.save();

        // Send the response
        res.json({
            status: {
                status: 1,
                message: "Profile updated successfully"
            },
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: {
                status: 0,
                message: error.message
            },
            data: null
        });
    }
};