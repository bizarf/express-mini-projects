require("dotenv").config();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

// need to use the User document from mongodb
const User = require("../models/user");

// passport localstrategy
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { msg: "Incorrect username" });
            }
            const passwordCheck = await bcrypt.compare(password, user.password);
            if (passwordCheck) {
                // password match. log user in
                return done(null, user);
            } else {
                return done(null, false, {
                    msg: "Incorrect password",
                });
            }
        } catch (err) {
            done(err);
        }
    })
);

// Json web token strategy. This will extract the token from the header. This is for routes that require a jwt to access
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        // we need async as we have to wait for a jwt payload to exist or else routes will give a 500 status error even with a correct token
        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                // if can't find user, then don't login. else set user to req.user
                if (!user) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }
    )
);
