var mar = []; //markers
var map;          //Map info
var VM;           //Model
var SM  = "0057e7",
unSM = "d62d20";
$(".button-collapse").sideNav();
var largeInfowindow;
function initMap() {

    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 30.05152570239465, lng: 31.222587772460884},
        zoom: 14,
        styles: styles
    });
    

    var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#0057e7' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 4 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#ffa700' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 7 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 110 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -110 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f1e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe8e4' },
              { lightness: -30 }
            ]
          }
    ];


    //info 
    largeInfowindow = new google.maps.InfoWindow();

    VM = new AppViewModel();
    ko.applyBindings(VM, document.getElementById("locations"));
}

// locations
var Locations = [
    {
        name: 'Cairo air port',
        lat: 30.10533584236791,
        lng: 31.40270233154297,
        address: 'Airstrip of Intl Airport, Sheraton Al Matar, Qism El-Nozha, Cairo Governorate, Egypt',
        index: 0,
        fsid: "4c3c3e06a9509c74150c395b"
    },
    {
        name: 'Ain shams university',
        lat: 30.0645657,
        lng: 31.27886079999996,
        address: '1 El Sarayat St. ABBASSEYA,Egypt',
        index: 1,
        fsid: "4c963c5303413704fd8982ef"
    },
	{
        name: 'Tahrir',
        lat:  30.0443967,
        lng: 31.235717300000033,
        address: 'El-Tahrir Square, Qasr Ad Dobarah, Qasr an Nile, Cairo Governorate, Egypt',
        index: 2,
        fsid: "4cb48a7e1463a143dfb7bba9"
    }
];

//Knockout
var AppModel = function(map, data) {


    this.index = ko.observable(data.index);
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.lng = ko.observable(data.lng);
    this.lat = ko.observable(data.lat);

    //Marker
    var marker = new google.maps.Marker({ //marker
        position: new google.maps.LatLng(data.lat, data.lng),
        animation: google.maps.Animation.DROP,
        icon: makeMarkerIcon(unSM), //the icon
        foursquareid: data.fsid
    });


    //Click Listener 
    google.maps.event.addListener(marker, 'click', function(){
        clicked_item = VM.locationList()[data.index];
        locationClicked(marker,clicked_item);
        showInfoWindow(marker,clicked_item);
    });

    //Set Visibillity of the map
    this.isVisible = ko.observable(false);
    this.isVisible.subscribe(function(State){
        if(State){
            marker.setMap(map);
        }
        else{
            marker.setMap(null);
        }
    });

    this.isVisible(true);
    mar.push(marker);
};

//Knockout
var AppViewModel = function() {
    var self = this;
    this.searchResult = ko.observable(''); //Data bind for searchText
    this.locationList = ko.observableArray([]); //List of all Locations
    this.errorMessage = ko.observable();
    //Adding all locations into location list
    Locations.forEach(function(locationItems){
        self.locationList.push(new AppModel(map, locationItems));
    });

    //Filtering 
    self.LocationMenu = ko.computed(function () {
        var matchingList;
        var searchText = self.searchResult().toLowerCase();
        if (!searchText) {
            matchingList = self.locationList();
            matchingList.forEach(function(loc){
                loc.isVisible(true);
            });
            return matchingList;
        }
        else{
            return ko.utils.arrayFilter(self.locationList(), function (loc) {
                matchingList = loc.name().toLowerCase().indexOf(searchText) !== -1;
                loc.isVisible(matchingList);
                toggleSM(null);
                return matchingList;
            });
        }
    });

    mar.forEach(function(marker){
        addMarkerInfo(marker);
    });

    //Item location 
    this.setSelected = function(loc){
        closeInfoWindow();
        locationClicked(mar[loc.index()], loc);
        showInfoWindow(mar[loc.index()], loc);
    };
};

//function to make default and highlighted marker icon
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(18, 39),
        new google.maps.Point(0, 0),
        new google.maps.Point(17, 33),
        new google.maps.Size(17, 33));
    return markerImage;
}

function locationClicked(marker, clicked_item){
    var latLng = marker.getPosition(); // marker location
    map.panTo(latLng); // change map center to the marker location
    toggleSM(marker);
    marker.setAnimation(google.maps.Animation.BOUNCE); //Bounce marker when clicked
    setTimeout(function(){ marker.setAnimation(null); }, 900); //set timer for bouncing
}

function toggleSM(marker){
    for (i=0; i < mar.length; i++){
        mar[i].setIcon(makeMarkerIcon(unSM));
    }
    if (marker){
        marker.setIcon(makeMarkerIcon(SM));
    }
}

function closeInfoWindow(){
    if(largeInfowindow !== null && typeof largeInfowindow !== 'undefined'){
        largeInfowindow.close();
    }
}

function addMarkerInfo(marker){
    $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + marker.foursquareid + '?client_id=4PGUZ0MSOKMVW2CWWKKY3ENH2VSG5GUPAWSBXCZIT0FN5FZ1&client_secret=JWPZTBJRH2BRIPEI5K0TGCX3UQ4VCRDFRCKILBIUCFGUT1M5&v=20161016',
        dataType: "json",
        success: function( response ){
            result = response.response.venue;
            if(result.hasOwnProperty('rating')){
                marker.rating = result.rating;
            }
            else{
                marker.rating = "rating cannot be fetched";
            }
        },
        error: function( e ){
            VM.errorMessage("no data sent !!");
        }
    });
}

function showInfoWindow(marker , clicked_item){
    var format_marker_info =  '<h4><b>' + clicked_item.name() + '</b></h4></span>' + '<h6>' + clicked_item.address() + '</h6>' + '<br>'+format_rating(marker);
    largeInfowindow.setContent(format_marker_info);
    largeInfowindow.open(map, marker);
}

function format_rating(marker){
    if (marker.rating === "" || marker.rating === undefined) {
        return "No rating";
    } else {
        return "Rating: " + marker.rating + "/10";
    }
}
