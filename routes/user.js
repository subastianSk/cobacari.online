const express = require("express");
const {
    register,
    login,
    logout,
    resetpassword,
    forgetpassword,
    createProfile,
    getProfileById,
    editProfile,
} = require("../controllers/user");

const router = express.Router();

router.route('/')
    .get(function (req, res, next) {
        res.send("GET request called, connected  to cloud");
    });

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").post(logout)

router.post('/forget-password', forgetpassword);
router.post('/riset-password', resetpassword);
router.post('/:userId', createProfile);
router.get("/:userId", getProfileById);
router.put('/:userId', editProfile);

module.exports = router;