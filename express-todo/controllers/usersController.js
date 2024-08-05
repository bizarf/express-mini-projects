const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.user_fetch_all_get = async (req, res) => {
    const users = await User.find({});
    res.json({ success: true, result: users });
};

exports.user_signup_post = [
    body("username")
        .notEmpty()
        .isString()
        .withMessage("Please enter a title")
        .trim()
        .escape(),
    body("name")
        .notEmpty()
        .isString()
        .withMessage("Please enter a name")
        .trim()
        .escape(),
    body("password")
        .notEmpty()
        .isString()
        .withMessage("Please enter a password")
        .trim()
        .escape(),

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        const { username, name, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        // hashedPassword instead of req.body.password as we want to save the hashed password to the database
        const user = new User({
            username,
            name,
            password: passwordHash,
        });

        const newUser = await user.save();
        return res.status(201).json({ success: true, result: newUser });
    },
];

exports.user_login_post = [
    body("username")
        .notEmpty()
        .isString()
        .withMessage("Please enter a title")
        .trim()
        .escape(),
    body("password")
        .notEmpty()
        .isString()
        .withMessage("Please enter a password")
        .trim()
        .escape(),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array({ onlyFirstError: true }),
            });
        }

        passport.authenticate(
            "local",
            { session: false },
            (err, user, info) => {
                if (err || !user) {
                    // set status to 401 (unauthorized) and send the error message as a json object
                    return res.status(401).json(info);
                }

                req.login(user, { session: false }, (err) => {
                    if (err) {
                        return next(err);
                    }

                    if (req.user) {
                        const token = jwt.sign(
                            { id: user._id, username: user.username },
                            process.env.JWT_SECRET,
                            { expiresIn: "1h" }
                        );
                        return res.json({ success: true, token });
                    }
                });
            }
        )(req, res, next);
    },
];
