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

//Include Multer Module
var multer = require('multer'); 
//upload is the multer module with a dest object passed to it. 
var upload = multer({ dest: 'public/images' });
//specify the type to use later, it comes from upload
var type = upload.single('imageToUpload');
//we will need fs to read the file, it's part of core
var fs = require('fs'); 
















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

router.get('/testQ', (req,res,next)=>{
	// var id1 = 1;
	// var id2 = 3;
	// var query = "SELECT * FROM images WHERE id > ? AND id < ?";
	// connection.query(query, [id1, id2], (error, results, fields)=>{
	// 	res.json(results);
	// })
	var imageIDVoted = 5;
	var insertQuery = "INSERT INTO votes (ip, imageID, voteDirection) VALUES (?, ?, 'COOL')"
	connection.query(insertQuery, [req.ip, imageIDVoted], (error, results, fields)=>{
		var query = "SELECT * FROM votes";
		connection.query(query, (error, results, fields)=>{
			res.json(results);
		})
		// res.json("werk werk werk werk werk");
	})
});

router.get('/uploadImage', (req, res, next)=>{
	res.render('uploadImage', {})
})

router.post('/formSubmit', type, (req, res, next)=>{
	// res.json(req.file);

	//temorarily save the path where the file is at
	var tempPath = req.file.path;
	//set up target Path and original file name
	var targetPath = 'public/images/'+ req.file.originalname;
	//use fs module to read the file then write it to the correct place
	fs.readFile(tempPath, (error, fileContents)=>{
		//takes three arguments: where, what, callback
		fs.writeFile(targetPath, fileContents, (error)=>{
			if (error) throw error; 
			var insertQuery = "INSERT INTO images (imageUrl) VALUE (?)";
			connection.query(insertQuery, [req.file.originalname], (DBerror, results, fields)=>{
				if(DBerror) throw error; 
				res.redirect('/')
			})
			// res.json("uploaded succesfully"); 
		})
	}); 

})












module.exports = router;
