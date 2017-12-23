const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register'});
}

exports.validateRegister = (req, res, next) => {
    // Hacer unas validaciones con una libreria llamada "express-validator"
    req.sanitizeBody('name') // Se asegura de que no lleguen etiquetas script por medio de inputs
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'That email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extensions: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password-confirm', 'Confirm password is required').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your password do not match :(').equals(req.body.password);

    const errors = req.validationErrors(); // Este metodo finalmente ejecutará todas las validaciones hechas arriba

    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
        return // there are errors!
    }
    next(); // there are no errors
}

exports.register = async (req, res, next) => {
    const user = new User({ email: req.body.email, name: req.body.name });
    // El metodo "register()" se puede usar gracias a "passportLocalMongoose" implementado en el modelo
    const register = promisify(User.register, User); // Ya que se basa en callbacks con "promisify" se convierte en promesa 
    await register(user, req.body.password).catch(err => console.log(err));
    next(); // pass to authController.login
}

exports.account = async (req, res) => {
    res.render('account', { title: 'Edit your Account'});
}

exports.updateAccount = async (req, res) => {
    // Propiedades del registro a actualizar
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $set: updates }, // Objeto con los valores a actualizar
        { new: true, runValidators: true, context: 'query'} // opciones: devuelve el registro actualizado, corre validaciones y context siempre se debe poner
    );

    req.flash('success', 'Profile updated!');
    res.redirect('back'); // devuelve a la direccion de la cual proviene
}