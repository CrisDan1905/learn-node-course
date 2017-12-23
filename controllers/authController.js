const passport = require('passport'); // La libreria para manejar el login

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