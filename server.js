var express = require('express');
var exphbs 	= require('express-handlebars');
var bodyParser 	= require('body-parser');
var mongoose= require('mongoose');
var request = require('request');
var cheerio =require('cheerio');
var Article = require('./models/Article.js');
var Comment = require('./models/Comment.js');

var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static('public'));


app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Routes
app.get('/', function (req, res) {
	res.redirect('/scraping');
});

app.get('/scraping', (req, res) => {
	var url = 'http://www.clickhole.com/features/news/';
	var linkUrl = 'http://www.clickhole.com/';
	request.get(url, (err, request, body) => {
		var $ = cheerio.load(body);

		$('.story_item a').each((index, element) => {
			var result = {};

			result.title = $(element)[0].attribs.title;
			result.link = linkUrl + $(element)[0].attribs.href;
			console.log(result.link);

			var article = new Article(result);
			article.save((err, doc) => {
				if (err) {
					console.log('Already scraped');
				} else {
					console.log('New article scraped');
				}
			});
		});
	});
	//Redirecting to /articles route
	res.redirect('/articles');
});

app.get('/articles', (req, res) => {
	Article.find({}, (err, doc) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render('articles', {
				//"articles" is the variable that will get looped over in articles.handlebars
				articles: doc
			});
		}
	});
});

app.get('/articles/:id', (req, res) => {
	Article.findOne({'_id': req.params.id})
		.populate('comments')
		.exec((err, doc) => {
			if (err) {
				console.log(err);
			}
			else {
				res.render('comments', {
					article: doc
				});
			}
	});
});

// HELP
// Need help updating article with ID -Geony



app.listen(process.env.PORT || 8080, () => {
	console.log('App running on port 8080');
});