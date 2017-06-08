var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var mongoose = require('mongoose');
var moment = require('moment');


// use bodyParser
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));

// handlebars setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leakscraper');
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
var dateArr = [];

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

  $('div.timestamp').each(function(i, element) {
    var date = $(this).text();
    var momentDate = moment(date, "DD MMM YYYY");
    dateArr.push(momentDate);
  })
});

// Routes

app.get('/create-leaks', function(req, res) {
  Leak.remove({}, function() {
    for (var i = 0; i < titleArr.length; i++) {
      Leak.create({title: titleArr[i], intro: introArr[i], img: imgArr[i], date: dateArr[i]}, function(err, leak) {
        if (err) return handleError(err);
        // leak saved!
      });
    };
    res.send('ok');
  })
});


app.get('/', function(req, res) {
  Leak.find({}).sort('-date').exec(function(err, leaks) {
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
  res.redirect('back');
})


app.listen(process.env.PORT || 3000);