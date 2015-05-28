define(['angular', "moment", "jquery", 'underscore', 'cookies'], function (angular, moment, $, _, cookies) {
    return angular.module('fiveOClock').directive('directiveSessions', function (RequestSession) {
        return {
            templateUrl: 'app/directiveSessions.html',
            scope: {
                visitor: '=',
                localization: '='

            },
            controller: function ($scope) {
                $scope.$on('getcurrentsession', function (event, data) {
                    if (data) {
                        $scope.currentsession = _.findWhere($scope.sessions, {_id: data});
                        cookies.set('currentSession', $scope.currentsession._id);
                        $scope.$emit('returncurrentsession', $scope.currentsession);
                    }
                    else {
                        RequestSession.post({
                            text: moment().format("YYYY.MM.DD  HH:mm"),
                            visitor: $scope.visitor
                        }).then(function (data) {
                            cookies.set('currentSession', data._id);
                            if (!$scope.sessions) {
                                $scope.sessions = [];
                            };
                            $scope.sessions.push(data);
                            $scope.currentsession = data;
                            $scope.$emit('returncurrentsession', $scope.currentsession);
                            $scope.nameSession = "";
                        });
                    };
                });

                RequestSession.get().then(function (data) {
                    $scope.sessions = data;
                });
                $scope.getByVisitor = function () {
                    var sessionsByVisitor = _.where($scope.sessions, {visitor: $scope.visitor});
                    return sessionsByVisitor;
                };
                $scope.IsCurrentSession = function (session) {
                    if ($scope.currentsession) {
                        var forCompare = $scope.currentsession._id;
                    } else {
                        var forCompare = "";
                    }
                    return forCompare == session._id;
                };
                $scope.confirmChange = function (session) {
                    RequestSession.put(session).then(
                        function () {
                        });
                };

                $scope.addSession = function () {
                    RequestSession.post({text: $scope.nameSession, visitor: $scope.visitor}).then(function (data) {
                        cookies.set('currentSession', data._id);
                        if (!$scope.sessions) {
                            $scope.sessions = [];
                        }
                        ;
                        $scope.sessions.push(data);
                        $scope.currentsession = data;
                        $scope.$emit('returncurrentsession', $scope.currentsession);

                        $scope.nameSession = "";
                    });
                };
                $scope.setSession = function (session) {
                    $scope.currentsession = session;
                    $scope.$emit('returncurrentsession', $scope.currentsession);
                    cookies.set('currentSession', session._id);
                };
                $scope.deleteSession = function (objectForRemove) {
                    RequestSession.delete(objectForRemove.session._id, objectForRemove.session._rev).then(function () {
                        objectForRemove.sessions.splice(objectForRemove.sessions.indexOf(objectForRemove.session), 1);
                    });
                    if ($scope.currentsession && objectForRemove.session._id == $scope.currentsession._id) {
                        cookies.set('currentSession', undefined);
                        $scope.$emit('returncurrentsession', '');
                    }

                }

            }
        }
    })
})
