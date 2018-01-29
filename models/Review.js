const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author!'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply a store!'
    },
    text: {
        type: String,
        required: 'Your review must have text!'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});

function autopopulate(next) {
    this.populate('author'); // Para que se realice "populate" automaticamente cada vez que una review es pedida
    next();
}
// Se ejecuta la funciona cada vez que se llame a "find" o "findOne"
reviewSchema.pre('find', autopopulate); 
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);