const User = require("../models/User")
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const {
            jwtToken
        } = req.cookies;
        if (!jwtToken) {
            return res.status(406).json({
                mgs: "Please login first, jwt token not found"
            })
        }
        const decode = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = await User.findById(decode._id)
        next();
    } catch (err) {
        console.log("err")
        res.send(err)
    }

    exports.isUser = async (req, res, next) => {
        const user = await User.findById(req.user);
        const roles = await Role.find({
            _id: {
                $in: user.roles
            }
        });

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'user') {
                next();
            } else if (roles[i].name === 'user') {
                return res.status(403).json({
                    msg: 'Error'
                });
            }
        }
    }
};