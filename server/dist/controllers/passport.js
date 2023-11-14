"use strict";
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback",
}, function (accessToken, refreshToken, profile, cb) {
    console.log(accessToken, refreshToken, profile);
    return cb(null, profile);
    // User.findOrCreate({ googleId: profile.id }, function (err: Error, user) {
    // });
}));
