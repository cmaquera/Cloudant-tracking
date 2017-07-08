var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/aaa', function(req, res){
	res.send(req.session);
});

module.exports = router;
