const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy()); // "createStrategy" se puede usar gracias al plugin "passportLocalMongoose"

// Para que envie la data necesaria al front
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());