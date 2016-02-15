var express = require('express');
var router = express.Router();
var Yelp = require('yelp');
var dataRet = {};
var request = require('request');
var cheerio = require('cheerio');
require('dotenv').load()



router.get('/', function(req,res){
  res.sendFile('views/index.html', {root:'./public'})
})

var yelp = new Yelp({
  consumer_key: process.env.CONSUMERKEY,
  consumer_secret: process.env.CONSUMERSECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKENSECRET
});


router.get('/search', function(req,res){
  console.log(req.query,'this is request');
  if(req.query.location){
    yelp.search({ term:'',category_filter: 'active', location: req.query.location})
    .then(function(data){
      res.json(data)
    })
    .catch(function(err){
      console.log(err);
    })
  }
else{
  yelp.search({ term:'',category_filter: 'active', ll: req.query.cll})
  .then(function(data){
    res.json(data)
  })
  .catch(function(err){
    console.log(err);
  })
}
})

//go to yelp web site and grab web site company ;)
router.get('/getweb', function(req,res){
  url = req.query.url
  request(url, function(error, response,html){
    if(!error){
      var $ = cheerio.load(html);
      var web;
      var json = { web : ""};
      $('.biz-website').filter(function(){
        var data = $(this);
        web = data.children().last().text();
        json.web = web;
        res.json(web)
        console.log(web);
      })
    }
  })

})
module.exports = router
