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

storeSchema.pre('save', async function(next) {
    
    if(!this.isModified('name')) {
        next(); // Se salta el slug si no se modifica "name"
        return; // Detiene la ejecución de esta función
    }
    this.slug = slug(this.name); // Nada se guardara hasta que no ocurra esto

    // Se crea expresion regular y se revisa si ya existen "slugs" con el mismo nombre...
    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({slug: slugRegExp});
    // Si se encuentran "slugs" con el mismo nombre entonces se guardará el nuevo con un numero nuevo al final
    if (storesWithSlug.length)
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`

    next();
})

storeSchema.statics.getTagsList = function () { // Usar una funcion normal ya que se debe usar "this"
    return this.aggregate([
        // $unwind desestructura un Array sacando una copia del registro por cada uno de los valores del array
        { $unwind: '$tags' }, // el signo "$" antes del nombre del campo indica que es un campo del documento al que quiero aplicar
        // se agrupan los registros devueltos por tag
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: {count: -1} } // Se ordenan descendientemente
    ])
}

module.exports = mongoose.model('Store', storeSchema); // El nombre que se le da al esquema es el nombre que tendrá la coleccion en la bd (en plural)
