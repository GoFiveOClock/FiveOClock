define(['angular', 'jquery', 'cookies', 'moment', 'selectDirective', 'json!localization/en.json', 'json!localization/ru.json', 'json!localization/ukr.json'],
 function (angular, $, cookies, moment, selectDirective, en, ru, ukr) {
    return angular.module('fiveOClock').controller('searchController',
        function ($scope, ServiceProviderInfoCommon, $q, uiGmapGoogleMapApi) {
			
			var lang = cookies.get('lang');
			if(lang == 'en'){
				$scope.localization = en;
			}
			else if(lang == 'ukr'){
				$scope.localization = ukr;
			}
			else {
				$scope.localization = ru;
			};
			
			$scope.showInfo = true;
			$scope.alterSlots = [];	
			$scope.userName = cookies.get('user');
			
			$scope.classCity = 'city';
			$scope.classSpec = 'speciality';
			$scope.cityText = {value:''};
			$scope.specText = {value:''};
			
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
			
			function createMap(coords) {
				uiGmapGoogleMapApi.then(function(result){
				    $scope.googleMaps = result;
					var geocoder = new $scope.googleMaps.Geocoder(), marker;
					geocoder.geocode({'location': {lat: coords.latitude, lng: coords.longitude}}, function (results) {
						if (results.length) {
							$scope.map = {
								center: {latitude: coords.latitude,longitude: coords.longitude},
								zoom: 13,
								markers: []                            
							};
						};
						$scope.$apply();
					});
				});
                
            }

            function geoSuccess(position) {
                createMap(position.coords);
            };
			
			function geoError(error) {
                console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            };
			
			 function newMarker(coords, formattedAddress, city){
                return  {
                    id: Date.now(),
                    coords: {latitude: coords.latitude, longitude: coords.longitude},
                    label: formattedAddress,
					city:city
                };
            };	
			
			Number.prototype.toRad = function () { return this * Math.PI / 180; };
			
			function setZoom(){
				for (var i = 0; i < $scope.map.markers.length; i++) {
					for (var j = 0; j < $scope.map.markers.length; j++) {
						var marker1 = $scope.map.markers[i];
						var marker2 = $scope.map.markers[j];
						var distanceMarkers = distance(marker1.coords.longitude, marker1.coords.latitude, marker2.coords.longitude, marker2.coords.latitude);
						if(distanceMarkers > 2.395){
							$scope.map.zoom = 12;
						}						
					};
				};	
				
				var markerMaxLat = _.max($scope.map.markers, function(marker) {
				  return marker.coords.latitude;
				});
				var markerMinLat = _.min($scope.map.markers, function(marker) {
				  return marker.coords.latitude;
				});
				var markerMaxLong = _.max($scope.map.markers, function(marker) {
				  return marker.coords.longitude;
				});
				var markerMinLong = _.min($scope.map.markers, function(marker) {
				  return marker.coords.longitude;
				});
				var centerLat = (markerMaxLat.coords.latitude + markerMinLat.coords.latitude)/2;
				var centerLong = (markerMaxLong.coords.longitude + markerMinLong.coords.longitude)/2;
				
				$scope.map.center = {latitude: centerLat,longitude: centerLong};				
				
			};
			
			function distance(lon1, lat1, lon2, lat2) {
			  var R = 6371; // Radius of the earth in km
			  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
			  var dLon = (lon2-lon1).toRad(); 
			  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					  Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
					  Math.sin(dLon/2) * Math.sin(dLon/2); 
			  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			  var d = R * c; // Distance in km
			  return d;
			};

			function insertMarkers(){
				$scope.map.markers = [];
				for (var i = 0; i < $scope.searchResult.length; i++) {
					var marker = newMarker($scope.searchResult[i].location, $scope.searchResult[i].location.locationName, $scope.searchResult[i].city);
					$scope.map.markers.push(marker);
				};
				if($scope.searchResult.length){
					setZoom();
				};				
			};			
			
			function startSearch(){
				$scope.searchResult = [];
				if($scope.specText.value && $scope.cityText.value){
					var promise = ServiceProviderInfoCommon.byCitiesAndSpecialities({value:{city:$scope.cityText.value, speciality:$scope.specText.value}, limit: 10 });					
				}
				else if($scope.specText.value){
					var promise	= ServiceProviderInfoCommon.bySpecialities({value:$scope.specText.value, limit: 10 });					
				}
				else if($scope.cityText.value){
					var promise	= ServiceProviderInfoCommon.byCities({value:$scope.cityText.value, limit: 10 });					
				};
				if(promise){
					promise.then(function(result){
						for (var i = 0; i < result.length; i++) {						
							$scope.searchResult.push(result[i]);						
						};
						insertMarkers();
					});	
				};							
			};
			
			$scope.alterOk = function(alterSlot){
                    alterSlot.showCalendar = false;
                    alterSlot.dateText = moment(alterSlot.alterInput).format("dddd, MMMM Do YYYY");
                    if(!alterSlot.alterInput){
                        console.log("wrong date!");
                        return;
                    }
                    var alterDay = alterSlot.alterInput.getDate();
                    var alterMonth = alterSlot.alterInput.getMonth();
                    alterSlot.start.setDate(alterDay);
                    alterSlot.start.setMonth(alterMonth);
                    alterSlot.end.setDate(alterDay);
                    alterSlot.end.setMonth(alterMonth);
                };
			
			$scope.showCalendarFun = function(alterSlot){
                    alterSlot.showCalendar = true;
                    alterSlot.alterInput = new Date(moment(alterSlot.start).hour(0).minute(0).second(0).millisecond(0));
                };
			
			
			$scope.addAlternate = function(objDate){
				$scope.alterSlots.push({
					start: moment().hour(9).minute(0).second(0).millisecond(0).toDate(),
					end:  moment().hour(10).minute(0).second(0).millisecond(0).toDate(),
					dateText: moment().format("dddd, MMMM Do YYYY"),
					priority: $scope.alterSlots.length + 1
				});
			};
			
			
			$scope.showInfoFun = function(flag){
				if(flag == 'hide'){
					$scope.showInfo = false;
				}
				else if(flag == 'show'){
					$scope.showInfo = true;
				}
				else if(!flag){
					$scope.showInfo = !$scope.showInfo;
				};
			};

			$scope.$on("selectClickSubmit",function(event,data){
				if(data.classDirect == $scope.classCity){
					$scope.cityText.value = data.title;
				}
				else if(data.classDirect == $scope.classSpec){
					$scope.specText.value = data.title;
				};				
				startSearch();											
			});		
		});
});