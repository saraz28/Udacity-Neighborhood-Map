//DOM for open or close a nav bar
function openNav() {
    document.getElementById("mySidenav").style.width = "290px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}


var map;
//array of data with location object
var locations = [{
    title: 'Starbucks Coffee',
    location: {
        lat: 24.6761718,
        lng: 46.7466758
    }
}, {
    title: "Dunkin' Donuts",
    location: {
        lat: 24.7615602,
        lng: 46.6644551
    }
}, {
    title: 'Waynes Coffee',
    location: {
        lat: 24.7038969,
        lng: 46.772535
    }
}, {
    title: 'Caribou Coffee',
    location: {
        lat: 24.7322353,
        lng: 46.7669426
    }
}, {
    title: "Caffe Bene",
    location: {
        lat: 24.7802322,
        lng: 46.6609242
    }
}];
var markers = [];

function initMap() {
    //Constructor a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.774265,
            lng: 46.738586
        },
        zoom: 13,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');
    //loop of array location 
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        marker();
        //bounds map for each marker
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
    //function array of markers per location with events
    function marker() {
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        //  marker.addListener('click', toggleBounce);
        //set marker to array of locations
        locations[i].marker = marker;
        markers.push(marker);
        //a click event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);

        });
        //mouse over on  markers to change the it's colors 
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        //mouse out on  markers to reset it's original colors
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
        //Bounce markers when clicked
        google.maps.event.addListener(marker, 'click', function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1400);
        });

    }



    //creates a new marker icon 
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    /*populates the infowindow with using jQuery library that 
    implementing ajax method for requesting wiki API*/
    function populateInfoWindow(marker, infowindow) {
        var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
                url: wikiURL,
                dataType: "jsonp",
            })
            .done(function(response) {
                var articleList = response[3][0];
                // Check to make sure the infowindow is not already opened on this marker. 
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', function() {
                        infowindow.setMarker = null;
                    });
                    //content that apears on infowindow 
                    var info = '<div>' + marker.title + '</div><hr></div><div><a href=' + articleList + '> Click here for more info </a></div>';
                    infowindow.setContent(info);

                }
            })
            //handling API error
            .fail(function() {
                alert('failed to load wikipedia page');
            })

    }
}

function handlingError() {
    alert("failed to load the map Please check your connection")
}

//this function to show markers when the search box is empty
function showMarkers() {
    if (markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(true);
        }
    }
}


function viewModel() {
    var self = this;
    // Iterating over an location array
    self.location = ko.observableArray(locations);
    //set search box empty
    self.filtersearch = ko.observable("");
    //calling foreach that binds the lists for filtering 
    this.listView = ko.computed(function() {
        var filtersearch = self.filtersearch();
        /*checks whether no filtering on search box returns locations 
         otherwise it filters upon the
        input text on search box */
        if (!filtersearch) {
            showMarkers();
            return self.location();
        } else {
            var filters = function(list) {
                var filtering = list.title.toLowerCase().indexOf(filtersearch) > -1;
                list.marker.setVisible(filtering);
                return filtering;
            };
            return self.location().filter(filters);
        }
    }, self);


    //animate markers with setTimeout when clicked on a list view in the nav bar
    this.setList = function(place) {
        google.maps.event.trigger(place.marker, 'click');
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            place.marker.setAnimation(null);
        }, 1400);
    };
}


ko.applyBindings(new viewModel());