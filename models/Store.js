const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Con esto decimos que usaremos las promesas de ES6
const slug = require('slugs');

const storeSchema = new mongoose.Schema({ // Un esquema define como será la data contenida
    name: {
        type: String,
        trim: true,
        required: 'Please, enter a store name' // en string el error a ser enviado si no se cumple con la obligatoriedad
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now()
    },
    location: {
        type: {
            type:   String,
            default: 'Point'
        },
        coordinates: [{
                type: Number,
                required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            requied: 'You must to supply an address'
        }
    },
    photo: String
});

storeSchema.pre('save', function(next) {
    if(!this.isModified('name')) {
        next(); // Se salta el slug si no se modifica "name"
        return; // Detiene la ejecución de esta función
    }
    this.slug = slug(this.name); // Nada se guardara hasta que no ocurra esto
    next();
})

module.exports = mongoose.model('Store', storeSchema); // El nombre que se le da al esquema es el nombre que tendrá la coleccion en la bd (en plural)
