var query = document.getElementById("query");
var resultBox = document.getElementsByClassName("results")[0];
var data = {
    query: null
    , location: {
        lat: null
        , lng: null
    }
};
var sampledata = {}
var service;
var gdistance;
var label = document.getElementById('nextLabel');

query.addEventListener('keyup',function(e){
  if(this.value === ''){
      label.classList.remove('active');
      return emptyResults();
  }
  label.classList.add('active');
});

query.addEventListener('blur', function (e) {
    //console.log(e);
    if (this.value === '') {
        label.classList.remove('active');
        emptyResults();
    }
});
query.addEventListener('focus', function (e) {
    //console.log(e);
    label.classList.add('active');
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);
    }
    else {
        console.log('Geolocation is not supported by this browser');
    }
}

var sanjose = document.getElementsByClassName("sj")[0];
var sanfrancisco = document.getElementsByClassName("sf")[0];

sanjose.addEventListener('click', function (e) {
    initMap("San Jose");
});

sanfrancisco.addEventListener('click', function (e) {
    initMap("San Francisco");
});

function setPosition(position) {
    data.location.lat = position.coords.latitude;
    data.location.lng = position.coords.longitude;
    //console.log(data.location);
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();
    if (query.value.search('train') != -1 || query.value.search('bart') != -1) {
      console.log("asdasd");
        $(".box").show();
        var sanfran = document.createElement('div');
        sanfran.classList.add("box");
        sanfran.innerHTML= "San Francisco";
        var sanjos = document.createElement('div');
        sanjos.classList.add("box");
        sanjos.innerHTML= "San Jose";
        resultBox.appendChild(sanfran);
        resultBox.appendChild(sanjos);
        // initMap();
        console.log('query train api');
    }
    else {
        if (query.value.search('hackathon') != -1) {
            initHack();
            console.log('query next hackathon from api');
        }
        else {
            if (query.value.toLowerCase().includes('concert')) {
                initTM();
                console.log('query ticketmaster api');
            }
            else {
                if (query.value.search('holiday') != -1) {
                    initHoliday();
                    console.log('query holiday api');
                }
                else {
                    console.log('query something else api');
                }
            }
        }
    }
    console.log('Input field value : ' + query.value);
    data.query = query.value;
    // You must return false to prevent the default form behavior
    return false;
}
var form = document.getElementById('nextform');
if (form.attachEvent) {
    form.attachEvent("submit", processForm);
}
else {
    form.addEventListener("submit", processForm);
}

function initTM() {
    $.ajax({
        type: "GET"
        , url: "https://app.ticketmaster.com/discovery/v2/events.json?size=1&apikey=bfdxTbMMSjSrjR4ILh6VHSpFQhmlq2Et&stateCode=ca&keyword=" + query.value.replace("concert", "")
        , async: true
        , dataType: "json"
        , success: function (json) {
            //console.log(json);
            displayConcert(json);
        }
        , error: function (xhr, status, err) {
            // This time, we do not end up here!
        }
    });
}

function emptyResults() {
  $(".box").hide();
    while (resultBox.hasChildNodes()) {
        resultBox.removeChild(resultBox.lastChild);
    }
}

function initHack() {
    $.get("/query_hackathon/", {}, function (data) {
        displayHack(data);
    });
}

function displayHack(results) {
    console.log(results);
    emptyResults();
    var websiteH = document.createElement('h1');
    var website = document.createElement('a');
    var location = document.createElement('h3');
    var date = document.createElement('h3');
    websiteH.innerHTML = results.data.name;
    website.href = results.data.website;
    date.innerHTML = results.data.time;
    location.innerHTML = results.data.location;
    website.appendChild(websiteH);
    resultBox.appendChild(website);
    resultBox.appendChild(location);
    resultBox.appendChild(date);
}

function initHoliday(){
    $.get("/query_holiday/", {}, function (data) {
        displayHoliday(data);
    });
}

function displayHoliday(results){
    emptyResults();
    var holiday = document.createElement('h1');
    var hdate = document.createElement('h2');
    holiday.innerHTML = results.data.holiday;
    var month = ["January","February","March","April","May","June","July","August","September","October","December"];
    hdate.innerHTML = month[results.data.date_month]+' '+results.data.date_day;
    resultBox.appendChild(holiday);
    resultBox.appendChild(hdate);
}

function displayConcert(results) {
    emptyResults();
    console.log(results);
    var name = document.createElement('h1');
    var cdate = document.createElement('h2');
    var location = document.createElement('h3');
    var url = document.createElement('a');
    name.innerHTML = results._embedded.events[0].name;
    cdate.innerHTML = results._embedded.events[0].dates.start.localDate;
    location.innerHTML = results._embedded.events[0]._embedded.venues[0].name + ', ' + results._embedded.events[0]._embedded.venues[0].city.name + ', ' + results._embedded.events[0]._embedded.venues[0].state.name;
    url.href = results._embedded.events[0].url;
    url.innerHTML = "Book Tickets"
    url.target = "_blank";
    resultBox.appendChild(name);
    resultBox.appendChild(cdate);
    resultBox.appendChild(location);
    resultBox.appendChild(url);
    //console.log(results._embedded.events[0].name);
    //console.log(results._embedded.events[0].dates.start.localDate);
    //console.log(results._embedded.events[0]._embedded.venues[0].name);
    //console.log(results._embedded.events[0]._embedded.venues[0].city.name);
    //console.log(results._embedded.events[0]._embedded.venues[0].state.name);
}

function initMap(destination) {
    var directionsService = new google.maps.DirectionsService;
    calculateAndDisplayRoute(directionsService,destination);
}

function initPlaces() {
    var placesService = new google.maps.places.PlacesService(document.getElementById('main').appendChild(document.createElement('div')));
    gdistance = google.maps.places.RankBy.DISTANCE;
    var request = {
        location: data.location
        , types: ['movie_theater']
        , rankBy: gdistance
    };
    placesService.nearbySearch(request, callback);
}

function calculateAndDisplayRoute(directionsService,userDestination) {
    directionsService.route({
        origin: data.location
        , destination: userDestination
        , travelMode: 'TRANSIT'
        , transitOptions: {
            modes: ['TRAIN']
        }
        , unitSystem: google.maps.UnitSystem.IMPERIAL
    }, function (response, status) {
        if (status === 'OK') {
            displayTrain(response.routes[0].legs);
        }
        else {
            console.log('Directions request failed due to ' + status);
        }
    });
}

function callback(results, status) {
    //console.log('callback');
    console.log(results[0]);
}

function displayTrain(results) {
    emptyResults();
    var stationName = document.createElement('h1');
    var dTime = document.createElement('h2');
    var aTime = document.createElement('h3');
    console.log(results);
    var l = results[0].steps.length;
    for (var i = 0; i < l; i++) {
        //console.log(results[0].steps[i]);
        if (results[0].steps[i].travel_mode === 'TRANSIT') {
            if (results[0].steps[i].transit.line.vehicle.name === "Train") {
                var resDate = Date.parse(results[0].steps[i].transit.departure_time.value);
                var remTime = new Date();
                console.log(resDate - Date.now());
                remTime.setMilliseconds(resDate - Date.now());
                //console.log(remTime);
                dTime.innerHTML = 'Time to departure : ' + msToTime(resDate - Date.now());
                stationName.innerHTML = results[0].steps[i].transit.departure_stop.name;
                resultBox.appendChild(stationName);
                resultBox.appendChild(dTime);
            }
        }
    }
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours < 1 ? minutes + "m" : hours + "h " + minutes + "m";
}
