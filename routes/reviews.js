var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('reviews');

  

  // if (n >= 1000) {
  //   fs.writeFile('output.json', JSON.stringify(jsonArray, null, 4), function(err) {
  //     console.log('File successfully written!');
  //   })
  // }

});

router.get('/fetch-reviews', function(req, res, next) {
  console.log("CALLED !!!")
  url = 'http://www.yelp.com/biz/wurstk%C3%BCche-los-angeles-2?start=';
  var jsonArray = [];
  
  for (var i = 0; i <= 0; i+=20) {
    jsonArray.push(requestRestaurantReviews(url, i))
  }

  Promise.all(jsonArray).then(function(data) {

    console.log("yeahya")
    data = data.reduce(function(x, y) { return x.concat(y) })
    console.log(data.length)
    
    res.send(data)

  })

})

function requestRestaurantReviews(url, n) {

  return new Promise(function(resolve, reject) {
    
    request(url + n, function(error, response, html){

      if (!error) {
        
        var $ = cheerio.load(html);
        var arr = [];

        $('.review-content').filter(function() {
          var data = $(this),
              json = {};

          json.date = data.find('meta[itemprop="datePublished"]').attr("content");
          json.rating = data.find('meta[itemprop="ratingValue"]').attr("content");
          json.review = data.find('p[itemprop="description"]').text();
          
          arr.push(json);

        });

        resolve(arr);

      } else {

        reject(error)

      }

    });

  });
  
}


module.exports = router;
