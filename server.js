var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var mongoose = require('mongoose');


// use bodyParser
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

// handlebars setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

mongoose.connect('mongodb://heroku_f17j6n1h:blueogdouua7dsgcs2dnkpvdms@ds019746.mlab.com:19746/heroku_f17j6n1h');
var db = mongoose.connection;



// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// Require our userModel model
var Leak = require('./leakModel.js');

var leaksArr;

var titleArr = [];
var introArr = [];
var imgArr = [];

request('https://wikileaks.org/-Leaks-.html', function(err, res, html) {
  var $ = cheerio.load(html);

  $('h2.title').each(function(i, element) {
    var title = $(this).text();

    titleArr.push(title);
  });

  console.log(titleArr);

  $('div.intro').each(function(i, element) {
    var intro = $(this).text();

    introArr.push(intro);
  });

  $('img.spip_logos').each(function(i, element) {
    var img = $(this).attr('src');
    if (img.charAt(0) === '/') {
      imgArr.push("https://wikileaks.org" + img);
    } else {
      imgArr.push("https://wikileaks.org/" + img);
    }
  })
});
// Matt tip: use the heroku scheduler add-on to create leaks every day


// Routes
app.get('/create-leaks', function(req, res) {
  Leak.remove({}, function() {
    for (var i = 0; i < titleArr.length; i++) {
      Leak.create({title: titleArr[i], intro: introArr[i], img: imgArr[i]}, function(err, leak) {
        if (err) return handleError(err);
        // leak saved!
      });
    };
    res.send('ok');
  })
});


app.get('/', function(req, res) {
  Leak.find({}).exec(function(err, leaks) {
    console.log(leaks);
    if (err) console.log (err)
    else res.render('home', {leaks: leaks});
  });
});

app.post('/', function(req, res) {
  console.log(req.body);
  var id = req.body.leak;
  console.log('id: ' + id);
  var user = req.body.user;
  var comment = req.body.comment;
  Leak.findOneAndUpdate(
    {_id: id},
    {$push: {comments: {user: user, comment: comment}}},
    {safe: true, upsert: true},
    function(err, model) {
      console.log('error: ' + err)
    }
  );
})


app.listen(process.env.port || 3000);