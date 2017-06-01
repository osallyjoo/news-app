// dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var mongojs = require("mongojs");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");

// initialize express
var app = express();

//port number 

var port = process.env.PORT || 3000;

// use morgan and bodyparser app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// make public a static dir
app.use(express.static('public'));


// database configuration with mongoose
mongoose.connect('mongodb://localhost/news-app');
var db = mongoose.connection;
var collections = ["scrapedData"];

// show any mongoose errors
db.on('error', function(err) {
    console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
    console.log('Mongoose connection successful.');
});


// import Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// Routes

// root
app.get("/", function(req, res) {
    res.send("I am Root.");
});

// retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
        if (error) {
            console.log(error);
        } else {
            res.json(found);
        }
    });
});

// scrape the data
app.get('/scrape', function(req, res) {
    // grab the html
    request('http://www.theonion.com/', function(error, response, html) {
        // load that into cheerio
        var $ = cheerio.load(html);
        // now, grab every h1 within an article tag
        $('h1').each(function(i, element) {
            // save an empty result object
            var result = {};
            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');
            // create new entry in article model
            var entry = new Article(result);
            // save entry to the db
            entry.save(function(err, doc) {
                // log any errors
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("Enjoy Your Onion!");
});
// this will grab the articles from the db
app.get('/articles', function(req, res) {
    // grab every doc in the Articles array
    Article.find({}, function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        }
        else {
            res.json(doc);
        }
    });
});

// grab articles by objectID
app.get('/articles/:id', function(req, res) {
    Article.findOne({ '_id': req.params.id })
        .populate('note')
        .exec(function(err, doc) {
            // log any errors
            if (err) {
                console.log(err);
            }
            else {
                res.json(doc);
            }
        });
});

// makin' notes
app.post('/articles/:id', function(req, res) {
    // create a new note
    var newNote = new Note(req.body);
    // and save the new note the db
    newNote.save(function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        } else {
            // updating notes
            Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                // execute the above query
                .exec(function(err, doc) {
                    // log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});

// listening on
app.listen(port, function() {
    console.log("App running on port " + port);
});