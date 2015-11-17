define(['angular', 'moment', 'lodash'], function (angular, moment, _) {
    return angular.module('fiveOClock').directive('selectDirective', function () {
        return {
            templateUrl: 'app/selectDirective.html',
            scope: {                
				classdirective: "=",
				searchtext: "="	,
				localization: "="					
            },
            controller: function ($scope, Visitor, ServiceProviderInfoCommon) {
				
				if($scope.classdirective == 'title'){
					$scope.placeholder = $scope.localization.placEnterName;
				}
				else if($scope.classdirective == 'speciality'){
					$scope.placeholder = $scope.localization.placEnterSpeciality;
				}
				else if($scope.classdirective == 'city'){
					$scope.placeholder = $scope.localization.placEnterCity;
				};
				
				function meetingsByTitle(){					
					Visitor.byTitle({value:$scope.searchtext, limit: 10 }).then(function (result) {
						for (var i = 0; i < result.length; i++) {							
							result[i] = {title:result[i].key[0] + " ," + result[i].key[1], titleForClick:result[i].key[0], contactPhone:result[i].key[1]};
						};
						$scope.sourcemass = result;                                          
						if(result.length){
							$scope.showselect = true;
						}
						else{
							$scope.showselect = false;
						};						
						$scope.$apply();						
					});    
				};
				
				function findSpeciality(){					
					ServiceProviderInfoCommon.specialities({value:$scope.searchtext, limit: 10 }).then(function (result) {
						for (var i = 0; i < result.length; i++) {							
							result[i] = {title:result[i].key};
						};
						$scope.sourcemass = result;                                          
						if(result.length){
							$scope.showselect = true;
						}
						else{
							$scope.showselect = false;
						};											
					});    
				};
				
				function findCity(){					
					ServiceProviderInfoCommon.cities({value:$scope.searchtext, limit: 10 }).then(function (result) {
						for (var i = 0; i < result.length; i++) {							
							result[i] = {title:result[i].key};
						};
						$scope.sourcemass = result;                                          
						if(result.length){
							$scope.showselect = true;
						}
						else{
							$scope.showselect = false;
						};													
					});    
				};
				
				$scope.elementClick = function(element){
					element.classDirect = $scope.classdirective;
					$scope.$emit('selectClickSubmit', element);
					if($scope.classdirective == 'title'){
						$scope.searchtext = element.titleForClick;
					}
					else{
						$scope.searchtext = element.title;
					};					
					$scope.showselect = false;
				};
				
                $scope.setCurrentVal = function(element){									
                    element.current = true;
                };
                $scope.clearCurrent = function(element){
                    element.current = false;
                };
				
				$scope.inputClick = function(){
					if($scope.classdirective == 'title'){
						meetingsByTitle();
					};	
					if($scope.classdirective == 'speciality'){
						findSpeciality();	
					};	
					if($scope.classdirective == 'city'){
						findCity();	
					};						
				};
				
				$scope.submitSelect = function(){
					$scope.$emit('selectClickSubmit', {title:$scope.searchtext, classDirect:$scope.classdirective});					
					$scope.showselect = false;
					$('.forblur').blur();				
				};
				
				$scope.filterSelect = function(obj){
					if($scope.classdirective == 'title'){
						meetingsByTitle();
					};	
					if($scope.classdirective == 'speciality'){
						findSpeciality();	
					};	
					if($scope.classdirective == 'city'){
						findCity();	
					};	
					
				};
				
				$(document).on('click', function(evt) {
					if((evt.target.className.indexOf('item-select') == -1) && (evt.target.id !== "inputSelect")) {
						$scope.showselect = false;					
					};		
					$scope.$apply();
				});
            }
        };
    });
});