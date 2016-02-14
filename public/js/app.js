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
  // function isACountry(country){
  //   return country.capitalCity;
  // }
  // $scope.countries = countries.filter( isACountry );
  //
  $scope.activity_details = function(index){
    $scope.country_one = angular.fromJson(index);
    $scope.activity = $scope.country_one.name;
    $scope.snippet_text = $scope.country_one.snippet_text;
    $scope.img = $scope.country_one.image_url;
    $scope.type = $scope.country_one.categories[0][0];
    $scope.currlat = $scope.country_one.location.coordinate.latitude;
    $scope.currlon = $scope.country_one.location.coordinate.longitude;
    $scope.url = $scope.country_one.mobile_url;

    $http.get('/getweb',{params:{"url":$scope.url}}).then(function(data){
      $scope.web = data.data;
    })

    console.log($scope.country_one);
     myMap.init();
  }

function show_list(lll){
  $http.get('/search',{params:{"term": "so happy to get term", "location": "ohh location","cll":lll}}).then(function(data){
    $scope.activities = data.data.businesses;
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
  lll=$scope.currlat+","+$scope.currlon
  show_list(lll)
   myMap.init();

}

$scope.getInputTerm = function(text){
  console.log(text, "search text");
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
      title: 'mew',
      animation: google.maps.Animation.DROP
    });
  }

  myMap.reCenterMap = function(){
    myMap.map.setZoom(myMap.zoom);
    myMap.map.setCenter(myMap.currentLatLng);
  }

  myMap.updateMarker = function(){
    myMap.marker.setPosition(myMap.currentLatLng);
    myMap.marker.setAnimation(google.maps.Animation.DROP)
  }

  $scope.pickActivity = function(lat,lon){
    myMap.currentLatLng = new google.maps.LatLng(lat,lon);

      myMap.updateMarker();
    myMap.reCenterMap();
  }


myMap.init();
// ========google map ends========

}])



app.controller('activityDetailController', ['$scope', '$routeParams', function($scope, $routeParams){
  function isACountry(country){
    return country.capitalCity;
  }

  $scope.countries = countries.filter( isACountry );
  console.log($routeParams.id,'sdsdsd');
  $scope.country = $scope.countries[$routeParams.id];
}])
