const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // Esto viene del modelo exportado en Store.js

exports.myMiddleware = (req, res, next) => {
    req.name = 'Danilo';
    next();
}

exports.homePage = (req, res) => {
    // console.log('hola');
    // // res.send('Hey! It works!');
    // const Ragazzo = { te_amo: 'por siempre mi Ragazza' };
    // // res.json(Ragazzo);
    // // res.send(req.query.name); // Para responder con una query en particular
    // // res.json(req.query);
    // res.render('hello', { // El segundo parametro es un objeto que quiera usar en el template
    //   name: req.query.miNombre,
    //   age: 23,
    //   loves: req.query.loves,
    //   title: 'Me gusta la comida :)'
    // }); // Para enviar un template al cliente... Este es un template hecho con pug
    console.log(req.name);
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'addStore' });
}

exports.createStore = async (req, res) => {
    /*  
    req.body contiene todo lo enviado en el formulario
    Al crear un nuevo Store se indicará que va a guarda la informacion enviada desde el cliente
    */
    const store = new Store(req.body);
    await store.save();
    res.redirect('/');
}