angular.module('sistematikaRastlin', ['ngRoute'])

    .controller('DataController', ['$scope', 'PlantsFactory', function ($scope, PlantsFactory) {
        $scope.data = [];
        PlantsFactory.subscribe(function () {
            GetData();
        })
        function GetData() {
            PlantsFactory.getData().then(function (data) {
                $scope.data = data;
                console.log('data', $scope.data);
            });
        }
        
        GetData();
    }])

    .controller('NavigationController', ['$scope', 'ViewDataFactory', 'UserService', function ($scope, VDFactory, UserService) {
        $scope.selectedItem = 0;
        
        $scope.changeSelectedItem = function (index) {
            VDFactory.changeSelectedData(index);
            $scope.selectedItem = index;
        }
        
        $scope.logout = function () {
            UserService.logut();
        }
    }])

    //Storitev za ugutavljanje katere podatke prikazati
    .factory('ViewDataFactory', [function () {
        var factory = {};
        
        var observers = [];
        factory.subscribe = function (callback) {
            observers.push(callback);
        }
        
        var notify = function () {
            for (var i = 0; i < observers.length; i++) {
                observers[i]();
            }
        }
        // 0 = zelišča
        // 1 = les
        factory.selectedData = 0;
        factory.changeSelectedData = function (index) {
            factory.selectedData = index;
            notify();
        };
        
        factory.getSelectedIndex = function () {
            return factory.selectedData;
        }
        return factory;
    }])

    //Storitev za pridobitev podatkov
    .factory('PlantsFactory', ['$http', '$q', 'ViewDataFactory', function ($http, $q, VDFactory) {
        var factory = {};
        
        var observers = [];
        
        VDFactory.subscribe(function () {
            notify();
        })
        factory.subscribe = function (callback) {
            // console.log('PlantsFactory subscribe',callback)
            observers.push(callback);
            // console.log('PlantsFactory observers', observers);
        };
        
        var notify = function () {
            // console.log('PlantsFactory','notifying');
            for (var i = 0; i < observers.length; i++) {
                observers[i]();
            }
        };
        
        factory.getData = function () {
            var defferd = $q.defer();
            var success = function (data, status, headers, config) {
                // console.log("succesfull get", data, status, headers, config);
                
                defferd.resolve(data);

            };
            var error = function (data, status, headers, config) {
                // console.log("error get", data, status, headers, config);
            }
            if (VDFactory.getSelectedIndex() == 0) {
                $http.get('/api/plants/GetRoot').success(success).error(error);
            }
            else {
                $http.get('/api/plants/GetWood').success(success).error(error);
            }
            
            return defferd.promise;


        };
        
        factory.addData = function (item) {
            if (VDFactory.getSelectedIndex() == 0) {
                item.isWood = false;
            }
            else {
                item.isWood = true;
            }
            $http.post('/api/plants', { plant: item }).success(function (data, status, headers, config) {
                // console.log('after post success', data, status, headers, config);
            }).error(function (data, status, headers, config) {
                // console.log('after post errorr', data, status, headers, config);
            });
            notify();
        };
        
        return factory;
    }])

    .controller('DataAddController', ['PlantsFactory', '$scope', function (PlantsFactory, $scope) {
        $scope.plant = {};
        
        
        $scope.addPlant = function () {
            PlantsFactory.addData($scope.plant);
            $scope.plant = {};
        }

    }])

    .controller('LoginController', ['$scope', '$window', 'UserService', function ($scope, $window, UserService) {
        
        $scope.message = '';
        
        $scope.Login = function (username, password) {
            UserService.login(username, password).then(function () { }, function (message) {
                $scope.message = message;
            });
        };
    }])

    .factory('AuthenticateService', ['$window', function ($window) {
        var factory = {};
        
        var isLoged = false;
        // Clear token from session storage and set is loged to false
        factory.clearUser = function () {
            isLoged = false;
            delete $window.sessionStorage.token;
        };
        
        // Set is loged to true
        factory.setUserLoged = function () {
            isLoged = true;
        }
        
        // Set user token to session and is loged to true
        factory.setUserToken = function (token) {
            factory.setUserLoged();
            $window.sessionStorage.token = token;
        };
        
        // Return is loged
        factory.getUserStatus = function () {
            return isLoged;
        }
        
        // Check if token exists and return it, if not return empty object
        factory.getToken = function () {
            if ($window.sessionStorage.token) {
                factory.setUserLoged();
                return $window.sessionStorage.token;
            
            }
            else {
                return {};
            }
            
        }
        return factory;
    }])

    .factory('UserService', ['$q', '$http', 'AuthenticateService', '$location', function ($q, $http, AuthenticateService, $location) {
        var factory = {};
        
        factory.login = function (username, password) {
            var deffered = $q.defer();
            $http.post('/authenticate', { user: { username: username, password: password } })
            .success(function (data) {
                AuthenticateService.setUserToken(data.token);
                $location.path('/');
                deffered.resolve();
            })
            .error(function (data) {
                AuthenticateService.clearUser();
                $location.path('/');
                deffered.reject('Invalid username/password');
            });
            
            return deffered.promise;
        }
        
        factory.logut = function () {
            AuthenticateService.clearUser();
            
            $location.path('/login');
        }
        
        factory.register = function (user) {
            var deffered = $q.defer();
            console.log(user);
            $http.post('api/user/', { user: user }).success(function (data) {
                deffered.resolve('Uspešna registarcija');
            }).error(function (data) {
                deffered.resolve(data);
            });
            
            return deffered.promise;
        }
        
        return factory;
    }])

    .factory('TokenInterceptor', ['$q', '$location', 'AuthenticateService', function ($q, $location, AuthenticateService) {
        return {
            request : function (config) {
                config.headers = config.headers || {};
                
                // We don't care if token don't exists, server will hande invalid token
                config.headers.Authorization = 'Bearer ' + AuthenticateService.getToken();

                return config;
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            
            /* Set Authentication.isAuthenticated to true if 200 received */
            response: function (response) {
                // If response is ok, and user status is not loged, set user status to loged
                if (response!= null && response.status == 200 && !AuthenticateService.getUserStatus()) {
                    AuthenticateService.setUserLoged();
                }
                return response || $q.when(response);
            },
            
            /* Revoke client authentication if 401 is received */
            responseError: function (rejection) {
                // If response status is 401 and user is loged, delete user info
                if (rejection != null && rejection.status === 401 && AuthenticateService.getUserStatus()) {
                    AuthenticateService.clearUser();
                    $location.path("/login");
                }
                
                return $q.reject(rejection);
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        // Add token interceptor to http interceptors
        $httpProvider.interceptors.push('TokenInterceptor');
    }])
    // Config application routes
    .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'data.html',
            access : { requiredLogin: true }
        })
        .when('/login', {
            templateUrl: 'login_partial.html',
            access : { requiredLogin: false }
        })
        .when('/registration', {
            templateUrl: 'registration_partial.html',
            access : { requiredLogin: false }
        })
        .otherwise({
            redirectTo: '/'
        });

    }])
    .run(['$rootScope', '$location', 'AuthenticateService', '$window', function ($rootScope, $location, AuthenticateService, $window) {
        
        $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
            if (nextRoute.access) {
                // If next route require loged user & user is not loged redirect him to login page
                if (nextRoute.access.requiredLogin && !AuthenticateService.getUserStatus()) {
                    $location.path("/login");
                }
            }

        });
    }])
    .controller('RegistrationController', ['$scope', 'UserService', function ($scope, UserService) {
        $scope.message = "";
        
        $scope.user = {};
        
        $scope.register = function () {
            UserService.register($scope.user).then(function (successMsg) {
                $scope.message = successMsg;
                $scope.user = {};
            }, function (errorMsg) {
                $scope.message = successMsg;
            });
        };

    }])
    .directive("compareTo", compareTo);

function compareTo () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            
            ngModel.$validators.compareTo = function (modelValue) {
                console.log('Compare-to', modelValue);
                console.log('OtherModel', scope.otherModelValue);
                console.log('Rezultat', modelValue == scope.otherModelValue);
                return modelValue == scope.otherModelValue;
            };
            
            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
};
