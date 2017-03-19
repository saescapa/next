'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let request = require("request");
let fs = require('fs');
var cheerio = require('cheerio');

let app = express();

// app.get('/query_train/', function(req, res) {
//   // if(req.query.query === undefined || req.query.location === undefined) return res.send({success: false });
//   var query = "caltrain";
//   var location = {lat: 37.601206,lon:-122.388752}; //Lat, lon
//   // var query = req.query.query;
//   // var location = red.query.location;
//   if(query == "caltrain") {
//     request({
//       url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + location.lat + "," + location.lon + "&type=transport&rankby=distance&keyword=" + query + "&key=AIzaSyCK_ewwg7uhiq6Yy4EYWLPQCKv2Ec_I4HM",
//       method: "GET",
//       json: true
//     }, function(error, response, results) {
//       if (!error && results.status === "OK") {
//         var station = results.results[0].name;
//         var station_location = {lat: results.results[0].geometry.location.lat, lon: results.results[0].geometry.location.lng};
//         fs.readFile('caltrain_stations.json', 'utf8', function (err, data) {
//           data = JSON.parse(data);
//           for(station in data) {
//             if(parseFloat(data[station].stop_lat) + 0.004 > station_location.lat && parseFloat(data[station].stop_lon) + 0.004 > station_location.lon && parseFloat(data[station].stop_lat) - 0.004 < station_location.lat && parseFloat(data[station].stop_lon) - 0.004 < station_location.lon) {
//               res.send({success: true })
//               return console.log(station);
//             }
//           }
//         });
//       }
//     });
//     return false;
//   }
// });

app.get('/query_hackathon/', function(req, res) {
  // if(req.query.location === undefined) return res.send({success: false });
  var location = req.query.location;
  var url = 'http://www.mlh.io/events';
  request(url, function(error, response, html){
    var $ = cheerio.load(html);
    var data = [];
    var month = ["January","February","March","April","May","June","July","August","September","October","December"];
    var start = false;
    var oldDate = "";
    var date = "";
    console.log("going");
    for(var index in $(".event")) {
      if(index == "options") break;
      // console.log($($(".event p:first-of-type")[index]).html(), $($(".event p:first-of-type")[index]).html().substring(0,$($(".event p:first-of-type")[index]).html().indexOf(' ')) == month[new Date().getMonth()]);
      //
      // console.log(
      //   $($(".event p:first-of-type")[index]).html(), $($(".event p:first-of-type")[index]).html().substring($($(".event p:first-of-type")[index]).html().indexOf(' ') + 1,$($(".event p:first-of-type")[index]).html().indexOf(' ',$($(".event p:first-of-type")[index]).html().indexOf(' ') + 1)-2), new Date().getDate());
      if(start || ($($(".event p:first-of-type")[index]).html().substring(0,$($(".event p:first-of-type")[index]).html().indexOf(' ')) == month[new Date().getMonth()] && $($(".event p:first-of-type")[index]).html().substring($($(".event p:first-of-type")[index]).html().indexOf(' '),$($(".event p:first-of-type")[index]).html().indexOf(' ',$($(".event p:first-of-type")[index]).html().indexOf(' ') + 1)-2) >= new Date().getDate())) {
        start = true;
        var date = $($(".event p:first-of-type")[index]).html().substring($($(".event p:first-of-type")[index]).html().indexOf(' '),$($(".event p:first-of-type")[index]).html().indexOf(' ',$($(".event p:first-of-type")[index]).html().indexOf(' ') + 1)-2);
        if(oldDate != "" && oldDate != date) break;
        var indData = {
          name: $($(".event [itemprop=name]")[index]).html(),
          time: $($(".event p:first-of-type")[index]).html(),
          website: $($(".event [itemprop=url]")[index]).attr("href"),
          logo: $($(".event .event-logo img")[index]).attr("src"),
          location: $($(".event [itemprop=addressLocality]")[index]).html() + ", " + $($(".event [itemprop=addressRegion]")[index]).html()
        }
        console.log(indData);
        oldDate = date;
        return res.send({success:true, data: indData});
      }
      // console.log(start);
      // if(start) {
      //   start = true;
      //   var indData = {
      //     name: $($(".event [itemprop=name]")[index]).html(),
      //     time: $($(".event p:first-of-type")[index]).html(),
      //     website: $($(".event [itemprop=url]")[index]).attr("href"),
      //     logo: $($(".event .event-logo img")[index]).attr("src"),
      //     location: $($(".event [itemprop=addressLocality]")[index]).html() + ", " + $($(".event [itemprop=addressRegion]")[index]).html()
      //   }
      //   data.push(indData);
      // }
    }
    res.send({success:false, error: "No data found."});
  });
});

app.get('/query_holiday/', function(req, res) {
  var holidays = [
  {
    "holiday": "New Years Day",
    "date_month": "1",
    "date_day": "01"
  },{
    "holiday": "Martin Luther King Day",
    "date_month": "1",
    "date_day": "16"
  },{
    "holiday": "Presidents' Day",
    "date_month": "2",
    "date_day": "20"
  },{
    "holiday": "Mothers' Day",
    "date_month": "5",
    "date_day": "14"
  },{
    "holiday": "Memorial Day",
    "date_month": "5",
    "date_day": "29"
  },{
    "holiday": "Fathers' Day",
    "date_month": "6",
    "date_day": "18"
  },{
    "holiday": "Independence Day",
    "date_month": "7",
    "date_day": "04"
  },{
    "holiday": "Columbus Day",
    "date_month": "10",
    "date_day": "09"
  },{
    "holiday": "Veterans Day",
    "date_month": "11",
    "date_day": "10"
  },{
    "holiday": "Thanksgiving",
    "date_month": "11",
    "date_day": "23"
  },{
    "holiday": "Christmas Day",
    "date_month": "12",
    "date_day": "25"
  }];
  for(var index = 0; index < holidays.length; index++) {
    if(holidays[index].date_month > new Date().getMonth() + 1) return res.send({success:true, data: holidays[index]});
    if(holidays[index].date_month == new Date().getMonth() + 1 && holidays[index].date_day >= new Date().getDate()) return res.send({success:true, data: holidays[index]});
  }
  return res.send({success:false, error:"Past Christmas"});
});


    // fs.readFile('caltrain_stations', 'utf8', function (err, data) {
    //   if (err) throw err;
    //   caltrain_stations = JSON.parse(data);
    //   var max = caltrain_stations.length - 1;
    //   var min = 0;
    //
    //   var max_lat = caltrain_stations[max].lat;
    //   var min_lat = caltrain_stations[min].lat;
    //
    //   var max_lon = caltrain_stations[max].lon;
    //   var min_lon = caltrain_stations[min].lon;
    //
    //   while(mid_distance <= max_distance) {
    //     var mid = ~()(max + min) / 2);
    //     var mid_lat = caltrain_stations[mid].lat;
    //     var mid_lon = caltrain_stations[mid].lon;
    //
    //     var min_distance = Math.sqrt((location.lon-min_lon)^2 + (location.lat-min_lat)^2);
    //     var max_distance = Math.sqrt((location.lon-max_lon)^2 + (location.lat-max_lat)^2);
    //     if(max_distance > min_distance) {
    //       var max = mid;
    //     } else if(max_distance < min_distance) {
    //       var min = mid;
    //     } else {
    //     }
    //
    //     var mid_distance = Math.sqrt((location.lon-mid_lon)^2 + (location.lat-mid_lat)^2);
    //   }
//   } else {
//     return res.send({success: false })
//   }
// });

app.use('/', express.static(__dirname + "/public/"));

app.listen(process.env.PORT || 5000, function() {
  console.log('Next is running on port', process.env.PORT || 8080);
});
