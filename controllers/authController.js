const passport = require('passport'); // La libreria para manejar el login
const crypto = require('crypto') // Este es un modulo que trae node.js
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {  // Se genera la estrategia deseada
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Now you\'re logged out! 👋');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    //first check that user is authenticated
    if (req.isAuthenticated()) {
        next(); // Carry on! is logged in :D
        return;
    }
    req.flash('error', 'Oops, you are not logged in. Can\'t do that :(');
    res.redirect('/login');
}

exports.forgot = async (req, res) => {
    // 1. See if a user wit that email exists
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
        req.flash('error', 'No account with that email exists');
        return res.redirect('/login');
    }
    // 2. Set reset tokens and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); // Se genera el token encriptado al azar
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save(); // Se guarda los valores en el registro
    // 3. Send them an email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        filename: 'password-reset',
        subject: 'Password reset',
        resetURL
    });
    req.flash('success', `You have been emailed a password reset link.`);
    // 4. Redirect to login page
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } // $gt sirve para buscar un valor mayor al que se le pasa
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login ');
    }

    // if there is an user show the reset password form
    res.render('reset', { title: 'Reset your password' });
}

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        next(); // Keep on going!
        return;
    }
    
    req.flash('error', 'Passwords do not match!')
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } // $gt sirve para buscar un valor mayor al que se le pasa
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login ');
    }

    const setPassword = promisify(user.setPassword, user);  // Metodo "setPassword" disponible debido al plugin usado en el model o 'User'
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    
    await req.login(updatedUser); //passport.js es lo que permite usar este metodo
    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
    res.redirect('/');
}