var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var Book = require('./Book.model');
var port = process.env.PORT || 8080;

var db = 'mongodb://localhost/book';

mongoose.Promise = global.Promise;
mongoose.connect(db);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Require Auth token
function requireAuth(req, res, next){
    const Header = req.headers['authorization'];

    if(typeof Header !== 'undefined'){
        const header = Header.split(' ');
        const token = header[1];
        req.token = token;
        next();
    } else {
        res.json({ Error: 'Sorry you not authenticated' })
    }

}

// to get token
app.post('/api/login', function(req, res){
    const user = {
        email: 'rahad@mail.com',
        password: '123'
    }
    jwt.sign({ user, iat: Math.floor(Date.now() / 1000) - 30 }, 'secretcode', function(err, authToken) {
        res.json({token: authToken});
    });
});

// Browse item
app.get('/', function(req, res){
    res.send('Hello everyone!');
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
        console.log(result);
        res.json(result)
    })
    .catch(err => {
        res.json({NotFound: 'Sorry no item found'});
    })
});

// Find by title
app.get('/book/:key/:value',  function(req, res){
    const key = req.params.key;
    const value = req.params.value;
    Book.find({
        key : value // doesn't work 
    })
    .exec()
    .then(books => {
        if(!books.length) res.json({NotFound: 'Sorry no item found'});
        res.json(books);
    })
    .catch(err => {
        res.send('Error deleting');
    })
})

// Add item
app.post('/book', requireAuth, function(req, res){
    jwt.verify(req.token, 'secretcode', (err, data) => {
        if(err) res.send('You are not authenticated');
        var newBook = new Book();

        newBook.title = req.body.title.toLowerCase();
        newBook.author = req.body.author.toLowerCase();
        newBook.category = req.body.category.toLowerCase();

        newBook.save()
        .then(book => {
            res.send(book);
        })
        .catch(err => {
            res.send('Error saving book');
        })
    });
});

// Update data 
app.put('/book/:id', requireAuth, function(req, res){
    jwt.verify(req.token, 'secretcode', (err, data) => {
        if(err) res.send('You dont have right to edit');
        Book.findOneAndUpdate({
            _id: req.params.id
        }, {$set: { title: req.body.title.toLowerCase(), author: req.body.author.toLowerCase(), category: req.body.category.toLowerCase() }}, {upsert: true})
        .exec()
        .then(newBook => {
            res.send(newBook);
        })
        .catch(err => {
            console.log('error occured updating')
        })
    })
});

// Delete all data
app.delete('/deleteall', requireAuth, function(req, res){
    jwt.verify(req.token, 'secretcode', (err, data) => {
        if(err) res.send('error in delete query');
        Book.find().remove().then(success => {
            console.log('all data successfully removed');
        })
        .catch(err => {
            console.log('error deleting all data');
        })
    })
})

// Delete item
app.delete('/book/:id', requireAuth, function(req, res){
    jwt.verify(req.token, 'secretcode', (err, data) => {
        if(err) res.send('You dont have right to delete');
        Book.findOneAndRemove({
            _id: req.params.id
        })
        .exec()
        .then(book => {
            console.log(book, ' deleted ');
            res.status(204);
        })
        .catch(err => {
            res.send('Error deleting');
        })
    })
})


app.listen(port, function(){
    console.log('App listening on', port);
})
