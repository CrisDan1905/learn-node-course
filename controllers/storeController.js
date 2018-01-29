const mongoose = require('mongoose');
const Store = mongoose.model('Store'); // Esto viene del modelo exportado en Store.js
const User = mongoose.model('User'); // Esto viene del modelo exportado en User.js
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true); // Al pasar algo como primer parametro significa que es un error, el segundo que está bien
        } else {
            next({ message: 'that filtertype isn\'t allow ' }, false);
        }

    }
}

exports.myMiddleware = (req, res, next) => {
    req.name = 'Danilo';
    next();
}

exports.homePage = (req, res) => {

    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'addStore' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    // check if there's no new file to resize
    if(!req.file) {
        next(); // skip to next middleware
        return;
    }

    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;

    const photo = await jimp.read(req.file.buffer); // jimp procesa las imagenes. Devuelve una promesa
    await photo.resize(800, jimp.AUTO) // Para reajustar el tamaño de la imagen
    await photo.write(`./public/uploads/${req.body.photo}`);
    // now the photo is saved into our filesystem keep going
    next();

}

exports.createStore = async (req, res) => {
    /*  
    req.body contiene todo lo enviado en el formulario
    Al crear un nuevo Store se indicará que va a guarda la informacion enviada desde el cliente
    */
    // Se añade el campo author (que esta en el modelo) y se le asigna el valor del _id del objeto
    req.body.author = req.user._id;
    const store = await (new Store(req.body).save());
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    const page = req.params.page || 1;
    const limit = 4;
    const skip = (page * limit) - limit; // Para decir desde que numero de tiendas va a mostrar
    // 1. Query all the database for a list of all stores
    const storesPromise = Store
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' });

    const countPromise = Store.count();

    const [stores, count] = await Promise.all([storesPromise, countPromise]); // Para esperar que ambas peticiones lleguen
    
    const pages = Math.ceil(count / limit);

    if (!stores.length && skip) {
        req.flash('info', `Hey!, you asked for page ${page}. But that doesn't exist, so I put you on page ${pages}`);
        res.redirect(`/stores/page/${pages}`);
        return;
    }

    res.render('stores', { title: 'Stores', stores, page, pages, count });
}

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) 
        throw Error('You must own a store in order to edit it!');

    
} 

exports.editStore = async (req, res) => {
    // 1. Find the store given the ID
    const store = await Store.findOne({ _id: req.params.id });
    // 2. Confirm they are the owner of the store
    confirmOwner(store, req.user);
    // 3. Render out the edit form so the user can update the store
    res.render('editStore', { title: `Edit ${store.name}`, store }); // ES6 permite que si la llave y el valor tienen el mismo nombre, solo se escriba el nombre
}

exports.updateStore = async (req, res) => {
    // Set the location data to be a point
    req.body.location.type = 'Point'; 
    // 1. Find and update the store
    const store = await Store.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true, // Para que retorne el registro modificado
        runValidators: true // Para que haga las validaciones que hay en el modelo (por defecto solo se hacen en la creación)
    }).exec(); // Para que funcione completamente como una promesa (las querys de mongoose NO son promesas)
    req.flash('success', `Successfully updated <strong>${store.name}</stron>.
        <a href="/stores/${store.slug}">View Store →</a>`);
    // 2. Redirect the store and tell
    res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews'); // Esto hace la tecnica de "populate" que retorna todo el objeto asociado a ese campo
    if (!store) {
        return next();
    }
    res.render('store', { store, title: store.name });

}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true }; // Para que busque una tienda con un tag en especifico o sino todas las tiendas
    const tagsPromise = Store.getTagsList(); // Metodo personalizado creado dentro del modelo
    const storePromise = Store.find({ tags: tagQuery }); // NO se usa "await" ya que son metodos que no dependen unos de otros
    const [tags, stores] = await Promise.all([tagsPromise, storePromise]); 

    res.render('tags', { tags, title: 'Tags', tag, stores })
}

exports.searchStores = async (req, res) => {
    const stores = await Store
    // first find stores that match
    .find({
        $text: { // Para buscar en los indices que sean de tipo text especificados en el modelo
            $search: req.query.q
        }
    }, {
        score: { $meta: 'textScore' } // El segundo argumento permite agregar un nuevo campo con unas condiciones especificas
    })
    // then sort them
    .sort({ // Para ordenarlo de mayor a menor 
        score:  { $meta: 'textScore' }
     })
     // limit to only 5 results
     .limit(5);
    res.json(stores);
}

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // Se pasan la longitud y latitud dados en el query en un array
    const q = {
        location: {
            $near: { // Operador de mongoDB que nos permite buscar locaciones cercanas a unos parametros dados
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000, // 10km
            }
        }
    }
    const stores = await Store.find(q).select('slug description location name photo'); // Con select se elige que campos se quieren traer. (con el signo "-" se dice si no se quiere traer ese campo, p.e: -author)
    res.json(stores);
}

exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map'});
}

exports.heartStore = async (req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User.findByIdAndUpdate(req.user._id, 
        { [operator] : { hearts: req.params.id }}, // [operator] es "Computed property names" de ES6
        { new: true }
    )
    res.json(user)
}

exports.getHearts = async (req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts } // Busca todos los "_id" de tiendas que esten en el array "hearts" de "user"
    });
    res.render('stores', { title: 'Hearted Stores', stores });
}

exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores();
    res.render('topStores', { stores, title: '⭐ Top Stores!'});
}