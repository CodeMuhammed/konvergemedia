angular.module('digifyBytes' , ['ui.router' ,'mgcrea.ngStrap' , 'mgcrea.ngStrap.tooltip' , 'ngSanitize'])

//state configuration and routing setup
.config([
    '$stateProvider' , '$urlRouterProvider'  , '$locationProvider',
    function($stateProvider , $urlRouterProvider  , $locationProvider){
          //enabling HTML5 mode
           $locationProvider.html5Mode(false).hashPrefix('!');
           $stateProvider
             .state('home' , {
                 url : '/home',
                 templateUrl : 'views/home.tpl.html',
                 controller : 'homeController',
                 data :{}
             });

             $urlRouterProvider.otherwise('/home');
        }
])

// cors configurations to enable consuming the rest api
.config([
    '$httpProvider' ,
    function($httpProvider){
       $httpProvider.defaults.useXDomain = true;
       $httpProvider.defaults.withCredentials = true;
       delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

//Filter to convert user data in bulk upload into nicely formatted array of json objects
.filter('mailFormatter' , function(){
     //@TODO implement a better validation rule.s
     return function(data){
         if(angular.isArray(data)){
            console.log(data);
             var result = {
                 valid : [],
                 invalid:[]
             };
             for(var i=0; i<data.length; i++){
                 var userDataArr = data[i].split(',');
                 var userDataObj = {};
                 if(userDataArr.length == 4){
                     userDataObj.firstname = userDataArr[0];
                     userDataObj.lastname = userDataArr[1];
                     userDataObj.email = userDataArr[2];
                     userDataObj.role = userDataArr[3];
                     userDataObj.status = 'pending';
                     //
                     result.valid.push(userDataObj);
                 }
                 else{
                     if(data[i].trim().length!=0){
                         result.invalid.push(data[i]);
                     }
                 }
             }
             return result;
         }
         else{
           return data;
         }
     }
})

//A directive for reading txt files
.directive('fileSelect', ['$window', function ($window) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, el, attr, ctrl) {
            var fileReader = new $window.FileReader();

            fileReader.onload = function () {
                ctrl.$setViewValue(fileReader.result);

                if ('fileLoaded' in attr) {
                    scope.$eval(attr['fileLoaded']);
                }
            };

            fileReader.onprogress = function (event) {
                if ('fileProgress' in attr) {
                    scope.$eval(attr['fileProgress'], {'$total': event.total, '$loaded': event.loaded});
                }
            };

            fileReader.onerror = function () {
                if ('fileError' in attr) {
                    scope.$eval(attr['fileError'], {'$error': fileReader.error});
                }
            };

            var fileType = attr['fileSelect'];

            el.bind('change', function (e) {
                var fileName = e.target.files[0];

                if (fileType === '' || fileType === 'text') {
                    fileReader.readAsText(fileName);
                } else if (fileType === 'data') {
                    fileReader.readAsDataURL(fileName);
                }
            });
        }
    };
}])

// Factory for manual mails
.factory('manualMailer' , function($http , $q){
      //
      function sendCert(person){
          var promise = $q.defer();
          $http({
              method:'POST',
              url:'/digifyBytes/sendCert',
              data:person
          })
          .success(function(data){
               promise.resolve(data);
          })
          .error(function(err){
               promise.reject(err);
          });
          return promise.promise;
      }
      return {
           sendCert:sendCert
      };
})
//============================ 2 implementation ============================
.controller('homeController' , function($rootScope , $scope , $timeout){
      //
      $scope.views = [
          'bulk mail',
          'manual mail'
      ];

      //
      $scope.active = $scope.views[1];

      //
      $scope.setView = function(view){
           $scope.active = view;
      }
})

//manual Mailer controller
.controller('manualMailerController' , function($scope , $timeout ,manualMailer){
  //
    $scope.person = {};
    $scope.person.role = 'trainerNG';
    $scope.roles = ['trainerNG' , 'trainerSA' , 'learnerNG' , 'learnerSA'];
    $scope.certImg = 'img/test.png';
    $scope.error = {msg:'No error at this time' , status:false};


    ////
    $scope.sendCert = function(person){
        $scope.sendingCert = true;
        manualMailer.sendCert(person).then(
            function(certImg){
               $timeout(function(){
                   var index = certImg.indexOf('img');
                   $scope.certImg = certImg.substr(index);
                   console.log($scope.certImg);
                   $scope.error = {msg:'No error at this time' , status:false};
                   $scope.sendingCert = false;
                   $scope.person = {};
                   $scope.person.role = 'trainerNG';
               });
            },
            function(err){
                $scope.error = {msg:err , status:true};
                $scope.sendingCert = false;
            }
        );
    }
})

//Bulk mailer controller
.controller('bulkMailerController' , function($scope , $window , $timeout , $filter , manualMailer){
      $scope.file = {};
      $scope.myLoaded = function(){
           $timeout(function(){
             $scope.file.data = $scope.file.data.substr($scope.file.data.indexOf(',')+1);
             var rawDataArr = $window.atob($scope.file.data).split('\n');

             //use custom filer to format data
             $scope.decodedArr = $filter('mailFormatter')(rawDataArr);
           });
      }
      $scope.myError = function(err){
           console.log(err);
      }
      $scope.myprogress = function(total , loaded){
           console.log(total  , loaded);
      }

      //
      $scope.sendBulkMails = function(){
           (function worker(index){
               if($scope.decodedArr.valid.length <=index){
                   alert('All mails have been sent out');
               }
               else{
                 //Send out certificates to contacts in mailing list
                 manualMailer.sendCert($scope.decodedArr.valid[index]).then(
                     function(certImg){
                        $scope.decodedArr.valid[index].status = 'sent';
                        worker(++index);
                     },
                     function(err){
                        $scope.decodedArr.valid[index].status = 'failed';
                        worker(++index);
                     }
                 );
               }
           })(0);
      }
});
