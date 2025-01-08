const express = require("express");
const router = express.Router({mergeParams : true});
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport")
const {directURL } = require("../middleware.js");
const userController = require("../controllers/userControllers");

//------------------------- SingUp Routes -------------------------

router.get("/singup", userController.singupForm );

router.post("/singup" ,wrapAsync( userController.singup));

//---------------------------- Login Routes --------------------------------------

router.get("/login" ,userController.loginForm );

router.post('/login', directURL,
    passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true }),
    userController.login
    );

//---------------------------- Logout Routes --------------------------------------

router.get("/logout", userController.logout);




module.exports = router;
