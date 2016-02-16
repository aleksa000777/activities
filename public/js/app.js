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

  // $scope.myLocationMarker = null;

  $scope.activity_details = function(index){
    $scope.one_activity = angular.fromJson(index);
    $scope.activity = $scope.one_activity.name;
    $scope.snippet_text = $scope.one_activity.snippet_text;
    $scope.img = $scope.one_activity.image_url;
    $scope.phone = $scope.one_activity.display_phone;
    $scope.distance = $scope.one_activity.distance;
    $scope.rating = $scope.one_activity.rating;
    $scope.type = $scope.one_activity.categories[0][0];
    $scope.currlat = $scope.one_activity.location.coordinate.latitude;
    $scope.currlon = $scope.one_activity.location.coordinate.longitude;
    $scope.url = $scope.one_activity.mobile_url;

    $http.get('/getweb',{params:{"url":$scope.url}}).then(function(data){
      $scope.web = data.data;
    })
    for(var i =0;i<$scope.activities.length;i++){
      $scope.activities[i].marker.setIcon("http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png");
      $scope.activities[i].marker.setAnimation(null);

          }
    $scope.pickActivity($scope.one_activity.marker);



  }
function show_list(latlongi,location){
  $http.get('/search',{params:{"term": "so happy to get term","cll":latlongi, "location":location}}).then(function(data){
    $scope.activities = data.data.businesses;
    console.log($scope.activities, 'to show all activities');
    for(var i =0;i<$scope.activities.length;i++){
      var location = $scope.activities[i].location.coordinate;
      $scope.activities[i].marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.latitude||location.lat, location.longitude||location.lng),
            map: myMap.map,
            title: $scope.activities[i].name,
            animation: google.maps.Animation.DROP,
            icon: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png"
          });
}
})
}


$scope.currlat='';
$scope.currlon='';
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
  })
  currlocation=$scope.currlat+","+$scope.currlon
  show_list(currlocation);
  var currentLatLng = new google.maps.LatLng( $scope.currlat||40.6974881, $scope.currlon||-73.979681 );
  myMap.reCenterMap(currentLatLng)

  var myLocationMarker = myMap.getMarker();
  myLocationMarker.setPosition(currentLatLng);
}

$scope.getInputTerm = function(text){
  console.log(text, "search text");
  show_list("",text);
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
      mapTypeId: google.maps.MapTypeId.ROADMAP
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

$scope.pickActivity = function(marker){
    marker.setIcon('http://www.tmconsulting.co.rs/uploads/marker.png');
    myMap.reCenterMap( marker.position );
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // looking for the marker that belongs to this activity
  }



// google.maps.event.addListener(myMap.marker, 'click', function() {this.marker.title = "weeee";});

myMap.init();
// ========google map ends========

}])



app.controller('activityDetailController', ['$scope', '$routeParams', function($scope, $routeParams){
  function isACountry(country){
    return country.capitalCity;
  }


}])
