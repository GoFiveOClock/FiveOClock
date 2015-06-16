define(['angular', 'underscore', "moment", 'confirmationService', 'clockpicker',
    'entities/contact','cookies','json!localization/en.json',
    'json!localization/ru.json'
], function (angular, _, moment, confirmationService, directiveClockpicker, contact,cookies, en, ru) {
    return angular.module('fiveOClock').directive('directiveMessager', function (Message) {
        return {
            restrict: 'E',
            templateUrl: '../Common/app/meetings/messagerHtml.html',
            scope: {
                currentsessionid: '=',
                showmessages: '=',
                visitor: '=',
                messages: '=',
                localization: '='
            },
            controller: function ($scope,$http) {
                $scope.addMessage = function(){
                    Message.post({text:this.textMessage, sessionId:$scope.currentsessionid, visitor:$scope.visitor, date:moment().format("YYYY.MM.DD   HH:mm") }).then(function (data) {
                        $scope.messages.push(data);

                        $http.post("http://localhost:3000/sendMessage",{oldpathname:window.location.href},{withCredentials:true}).then(function (data) {
                            //localStorage.setItem("userName", data.data);
                            //window.location = 'http://localhost:5984/' + data.data + '/_design/Manager/index.html#/Contacts';
                        }).catch(function (data) {
                        });
                    });
                    this.textMessage = "";
                };
                $scope.closeMessages = function(){
                    $scope.$emit('hideMessages');
                };
                $scope.show = function(){
                    return $scope.showmessages;
                };
            }
        };
    });
});