console.log('...loaded');
var app = angular.module('activitiesApp', ['ngRoute'])
app.config(['$routeProvider', function( $routeProvider ){
  $routeProvider
  .when('/activities', {
    templateUrl: 'views/partials/activity_list.html',
    controller: 'activitiesController'
  })
  .when('/activities/:id', {
    templateUrl: 'views/partials/activity_detail.html',
    controller: 'activityDetailController'
  })
  .otherwise({
    redirectTo: '/activities'
  })
}])

app.controller('activitiesController', ['$scope','$http', function($scope,$http){
  angular.element(document).ready(function () {
        $scope.getLocation();
    });

  // $scope.myLocationMarker = null;
//====get the weather by cuurent location====
$scope.weather = function(city){
  $http.get('/weather',{params:{"city":city}}).then(function(data){
    newdata = angular.fromJson(data.data);
    $scope.temp = parseInt(newdata.main.temp * 9/5 - 459.67)
  })

}

//======render detail of activity on click========

  $scope.activity_details = function(index){
    $scope.one_activity = angular.fromJson(index);
    $scope.activity = $scope.one_activity.name;
    $scope.snippet_text = $scope.one_activity.snippet_text;
    $scope.img = $scope.one_activity.image_url;
    $scope.phone = $scope.one_activity.display_phone;

    $scope.distance = "Distance: "+(Math.round($scope.one_activity.distance*0.000621371192 * 100)/100).toFixed(2)+" mi";
    $scope.rating = "Rating: "+$scope.one_activity.rating;
    $scope.type = "Type: "+$scope.one_activity.categories[0][0];
    $scope.currlat = $scope.one_activity.location.coordinate.latitude;
    $scope.currlon = $scope.one_activity.location.coordinate.longitude;
    $scope.urltoyelp = "URL to Yelp";
    $scope.url = $scope.one_activity.mobile_url;
    $scope.rating_img = $scope.one_activity.rating_img_url_large;
    $scope.googlemap = "https://www.google.com/maps/dir//"+$scope.currlat+","+$scope.currlon+"/@"+$scope.currlat+","+$scope.currlon+"15z";

    //====get the address from coordinates
    $http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.currlat+","+$scope.currlon+"&sensor=true").then(function(data){
      $scope.address = "Address: "+data.data.results[0].formatted_address;
    })
    //======get web site from yelp=========
    $http.get('/getweb',{params:{"url":$scope.url}}).then(function(data){
      $scope.website = "Website: "
      $scope.web = data.data;
    })
    //=========set all markers to default==========
    for(var i =0;i<$scope.activities.length;i++){
      $scope.activities[i].marker.setIcon("http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png");
      $scope.activities[i].marker.setAnimation(null);
    }
    //===========set this marker to active==========
    $scope.pickActivity($scope.one_activity.marker);
  }



var latlongitofunc;
var locationtofunc;
  //=========render list of activity depends on current location or search input==========
function show_list(latlongi,location,offset){
  $http.get('/search',{params:{"cll":latlongi, "location":location, "offset":offset}}).then(function(data){
    $scope.activities = data.data.businesses;
    console.log($scope.activities, 'to show all activities');
    //======go throw each activity and set marker on map======
    for(var i=0;i<$scope.activities.length;i++){
      var location = $scope.activities[i].location.coordinate;
      $scope.activities[i].marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.latitude||location.lat, location.longitude||location.lng),
            map: myMap.map,
            title: $scope.activities[i].name,
            animation: google.maps.Animation.DROP,
            icon: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png"
          });
          // =====set on click on marker show content====
          var infowindow = new google.maps.InfoWindow({
          content:$scope.activities[i].name
          });

          var allmarkers = $scope.activities[i].marker;
          google.maps.event.addListener(allmarkers, 'click', function() {
          infowindow.setContent(this.title);
          infowindow.open(myMap.map,this);
          //=======get the activity with the same coordinates====
          var clmarkerlat = this.position.lat();
          var clmarkerlng = this.position.lng();
          var markerclicktitle = this.title;
          for(var i=0;i<$scope.activities.length;i++){
            var activione = $scope.activities[i];
            if(markerclicktitle===activione.name){
              $scope.activity_details($scope.activities[i]);
            }
          }
          });

          var list = document.querySelector('#list_activities');
          list.addEventListener('click', function(){
            infowindow.close();
          })
    }

  })

}

$scope.next = function(offset){
  console.log("offset", offset);
  console.log(latlongitofunc,'latlongitofunc');
  console.log(locationtofunc,'locationtofunc');
  show_list(latlongitofunc,locationtofunc,offset)

}

$scope.currlat='';
$scope.currlon='';
//====show your current location on page====
x = document.querySelector('#x');

$scope.getLocation = function(){
  if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position){
  $scope.currlat=position.coords.latitude;
  $scope.currlon=position.coords.longitude;
  $http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng="+$scope.currlat+","+$scope.currlon+"&sensor=true").then(function(data){
    $scope.current_location = angular.fromJson(data);
    $scope.current_place = $scope.current_location.data.results[2].formatted_address;
    //need the get only city
    currweathercity=$scope.current_location.data.results[3].address_components[0].long_name
    $scope.weather(currweathercity)
  })
  currlocation=$scope.currlat+","+$scope.currlon;
  latlongitofunc = currlocation;
  locationtofunc = '';
  show_list(currlocation);
  var currentLatLng = new google.maps.LatLng( $scope.currlat||40.6974881, $scope.currlon||-73.979681 );
  myMap.reCenterMap(currentLatLng)

  var myLocationMarker = myMap.getMarker();
  myLocationMarker.setPosition(currentLatLng);




}

//=====get the input and render list of activities====
$scope.getInputTerm = function(text){
  // console.log(text, "search text");

  description_activity = document.querySelector('#description_activity');
  description_activity = false;
  latlongitofunc = '';
  locationtofunc = text;
  show_list("",text);
  $scope.weather(text)
  var geocoder =  new google.maps.Geocoder();
    geocoder.geocode( { 'address': text+", us"}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log("location search: " + results[0].geometry.location.lat() + " " +results[0].geometry.location.lng());
            $scope.currlat = results[0].geometry.location.lat();
            $scope.currlon = results[0].geometry.location.lng();
            myMap.init();
            myMap.updateMarker();
          myMap.reCenterMap();
          } else {
            alert("Something got wrong " + status);
          }
        });
}

// =====google map=======
  var myMap = {};
  myMap.init = function(){
    this.map;
    this.currentLatLng;
    this.zoom;
    this.mapEl;

    this.zoom = 13;
    this.mapEl = document.querySelector('#map');

    this.currentLatLng = new google.maps.LatLng( $scope.currlat||40.6974881, $scope.currlon||-73.979681 );

    this.map = new google.maps.Map(this.mapEl, {
      center: this.currentLatLng,
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
    });

    this.marker = new google.maps.Marker({
      position: this.currentLatLng,
      map: this.map,
      title: '',
      content:'',
      animation: google.maps.Animation.DROP,
      icon: "https://mt.google.com/vt/icon?psize=20&font=fonts/Roboto-Regular.ttf&color=ff330000&name=icons/spotlight/spotlight-waypoint-a.png&ax=44&ay=48&scale=1&text=%E2%80%A2"
    });
  }


  myMap.getMarker = function() {
    return this.marker;
  }
  myMap.getMap = function() {
    return this.map;
  }

  myMap.reCenterMap = function(latLng){
    myMap.map.setZoom(myMap.zoom);
    myMap.map.setCenter(latLng || myMap.currentLatLng);
  }

  myMap.updateMarker = function(){
    myMap.marker.setPosition(myMap.currentLatLng);
    myMap.marker.setAnimation(google.maps.Animation.DROP)
  }

//===set active marker when click====
$scope.pickActivity = function(marker){
    marker.setIcon('http://www.tmconsulting.co.rs/uploads/marker.png');
    myMap.reCenterMap( marker.position );
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // looking for the marker that belongs to this activity
  }

myMap.init();
// ========google map ends========

}])






//==I don't use it yet
app.controller('activityDetailController', ['$scope', '$routeParams', function($scope, $routeParams){
  function isACountry(country){
    return country.capitalCity;
  }


}])
