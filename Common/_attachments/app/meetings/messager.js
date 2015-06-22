define(['angular','pouchDb', 'underscore', "moment", 'confirmationService', 'clockpicker',
    'entities/contact','cookies','json!localization/en.json',
    'json!localization/ru.json'
], function (angular,pouchDb, _, moment, confirmationService, directiveClockpicker, contact,cookies, en, ru) {
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
                  if(cookies.get('pouchDbVisitor')) {
                      Message.post({text:this.textMessage, sessionId:$scope.currentsessionid, visitor:$scope.visitor, date:moment().format("YYYY.MM.DD   HH:mm") }).then(function (data) {
                          $scope.messages.push(data);
                      });
                  }
                  else {
                      var that = this;
                      var nameAgendaDB = window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).substring(0,window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).indexOf("/"));
                      cookies.set('nameAgendaDB',nameAgendaDB);
                      $http.post("http://localhost:3000/registrationVisitor",{user: $scope.visitor},{withCredentials:true}).then(function (data) {
                          var nameVisitorBase = data.data + "visitor"
                          $.get('http://localhost:5984/' + nameVisitorBase).then(function () {
                              pouchDb.replicate('http://localhost:5984/' + nameVisitorBase, nameVisitorBase).then(function (result) {
                                  pouchDb.replicate(nameVisitorBase, 'http://localhost:5984/' + nameVisitorBase).then(function (result) {
                                      if (result.ok) {
                                          pouchDb.replicate(nameVisitorBase, 'http://localhost:5984/' + nameVisitorBase, {live: true});
                                          cookies.set('visitor', data.data);
                                          cookies.set('pouchDbVisitor', nameVisitorBase);

                                          Message.post({text:that.textMessage, sessionId:$scope.currentsessionid, visitor:$scope.visitor, date:moment().format("YYYY.MM.DD   HH:mm") }).then(function (data) {
                                              $scope.messages.push(data);
                                              this.textMessage = "";
                                              //var nameAgendaDB = window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).substring(0,window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).indexOf("/"));
                                              //cookies.set('nameAgendaDB',nameAgendaDB);
                                          });

                                      };
                                  });
                              }, function (err) {
                                  console.log(err);
                              });
                          }, function (err) {
                              console.log(err);
                          });
                      }).catch(function (data) {
                      });
                  }
                    //Message.post({text:this.textMessage, sessionId:$scope.currentsessionid, visitor:$scope.visitor, date:moment().format("YYYY.MM.DD   HH:mm") }).then(function (data) {
                    //    $scope.messages.push(data);
                    //    var nameAgendaDB = window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).substring(0,window.location.href.substring(7).substring(window.location.href.substring(7).indexOf("/")+1).indexOf("/"));
                    //    cookies.set('nameAgendaDB',nameAgendaDB);
                    //    $http.post("http://localhost:3000/sendMessage",{oldpathname:window.location.href},{withCredentials:true}).then(function (data) {
                    //        //localStorage.setItem("userName", data.data);
                    //        //window.location = 'http://localhost:5984/' + data.data + '/_design/Manager/index.html#/Contacts';
                    //    }).catch(function (data) {
                    //    });
                    //});

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