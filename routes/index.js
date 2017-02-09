var express = require('express');
var router = express.Router();

//include config files that are in gitignore
var config = require('../config/config');
//include mysql
var mysql = require('mysql'); 
//set up a connection to use over/over
var connection = mysql.createConnection({
	host: config.host, 
	user: config.user, 
	password: config.password, 
	database: config.database
});
//after this line runs, our connection to MySql runs
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
	var getImagesQuery = "SELECT * FROM images";

	getImagesQuery = "SELECT * from images WHERE id NOT IN"+
	"(SELECT id FROM votes WHERE ip='"+req.ip+"');";

	var trunc = "TRUNCATE TABLE michiganornot.votes;";

	connection.query(getImagesQuery, (error, results, fields)=>{
		// res.json(results);
		var randomIndex = Math.floor(Math.random() * results.length);
		var randomIndexArray = [];
		// res.json(results[randomIndex]);
		if(results.length == 0){
			res.render('index', { 
				msg: "There are no more images!"
			})
			connection.query(trunc, (error, results, fields)=>{
			res.render('index', {
				
			})
			})
		}else{
			res.render('index', { 
				title: 'Michigan or Not',
				imageToRender: '/images/'+results[randomIndex].imageUrl,
				imageID: results[randomIndex].id,
				name: results[randomIndex].name,
				desc: results[randomIndex].desc
				});
		}
	})	
});

router.get('/vote/:voteDirection/:imageID/', (req, res, next)=>{
	// res.json(req.params.voteDirection); 
	var imageID = req.params.imageID;
	var voteMich = req.params.voteDirection;
	var insertVoteQuery = "INSERT INTO votes (ip, imageID, voteMich) VALUES ('"+req.ip+"',"+imageID+",'"+voteMich+"')";
	// res.send(insertVoteQuery)
	connection.query(insertVoteQuery, (error, results, fields)=>{
		if (error) throw error;
		res.redirect('/?vote=success')
	})
});


router.get('/standings', function(req, res, next){
	res.render('standings', {title: 'Standings'});
})

module.exports = router;
