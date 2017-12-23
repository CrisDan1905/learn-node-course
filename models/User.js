const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHanlder = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose'); // Para crear cuentas de usuario facilmente

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'], // Para hacer una validacion personalizada
        required: 'Please supply an email address'
    },
    name: {
        type: String,
        required: 'Please supply a name',
        trim: true
    }
});
// Esto es un "virtual field". Un campo que no se guardará realmente en la BD, pero servirá para el esquema
userSchema.virtual('gravatar').get(function() {
    // Se va a enviar la foto del correo logueado
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

// Se añaden los campos restantes necesarios para el login y usar "email" como el campo de login 
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
// Se usa plugin para cambiar errores estandar de mongoose por errores para el usuario
userSchema.plugin(mongodbErrorHanlder);

module.exports = mongoose.model('User', userSchema);