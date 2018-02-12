var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Database model
var BookSchema = new Schema({
    title: String,
    author: String,
    category: String
});

module.exports = mongoose.model('Book', BookSchema);