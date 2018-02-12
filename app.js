var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Book = require('./Book.model');
var port = 8080;

var db = 'mongodb://localhost/example';

mongoose.Promise = global.Promise;
mongoose.connect(db);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// Browse item
app.get('/', function(req, res){
    res.send('happpy to be here');
});

app.get('/books', function(req, res){
    Book.find({})
    .exec()
    .then((results) => {
        console.log(results);
        res.json(results);
    })
    .catch(err => {
        res.send('Error has occured');
    })
});

app.get('/book/:id', function(req, res){
    Book.findOne({
        _id:req.params.id
    })
    .exec()
    .then(result => {
        res.json(result)
    })
    .catch(err => {
        res.send('Error has occured single item');
    })
});

// Add item
app.post('/book', function(req, res){
    var newBook = new Book();

    newBook.title = req.body.title;
    newBook.author = req.body.author;
    newBook.category = req.body.category;

    newBook.save()
    .then(book => {
        res.send(book);
    })
    .catch(err => {
        res.send('Error saving book');
    })
});

// Update data 
app.put('/book/:id', function(req, res){
    Book.findOneAndUpdate({
        _id: req.params.id
    }, {$set: { title: req.body.title, author: req.body.author }}, {upsert: true}, function(err, newBook){
        if(err) {
            console.log('error occured updating')
        }else{
            res.send(newBook);
        }
    })
});


// Delete item
app.delete('/book/:id', function(req, res){
    Book.findOneAndRemove({
        _id: req.params.id
    }, function(err, book){
        if(err){
            res.send('Error deleting');
        }else{
            console.log(book, ' deleted ');
            res.status(204);
        }
    })
})

app.listen(port, function(){
    console.log('App listening on', port);
})
