angular.module('config' , [])

.run(function ($rootScope,$timeout) {
    $rootScope.$on('$viewContentLoaded', () => {
        $timeout(() => {
           componentHandler.upgradeAllRegistered();
        })
    })
})

//state configuration and routing setup
.config([
    '$stateProvider' , '$urlRouterProvider'  , '$locationProvider',
    function($stateProvider , $urlRouterProvider  , $locationProvider){
           $locationProvider.html5Mode(false).hashPrefix('!');
           $stateProvider
           .state('auth' , {
                 url : '/auth',
                 templateUrl : 'views/auth.tpl.html',
                 controller : 'authController'
            })
            .state('home' , {
                 url : '/home',
                 templateUrl : 'views/home.tpl.html',
                 controller : 'homeController',
                 data :{}
             })
             .state('drag' , {
                 url : '/drag',
                 templateUrl : 'views/drag.tpl.html',
                 controller : 'dragController',
                 data :{}
             });

             $urlRouterProvider.otherwise('/home');
        }
])

// cors configurations to enable consuming the rest api
.config([
    '$httpProvider', function($httpProvider) {
       $httpProvider.defaults.useXDomain = true;
       $httpProvider.defaults.withCredentials = true;
       delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])