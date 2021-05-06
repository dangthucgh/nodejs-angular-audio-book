const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Book = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        maxLength: 250
    },
    image: {
        type: String,
        unique: true,
        required: true,
        maxLength: 250
    },
    description: {
        type: String
    }
}, {
    collection: 'books'
})

module.exports = mongoose.model('Book', Book)
