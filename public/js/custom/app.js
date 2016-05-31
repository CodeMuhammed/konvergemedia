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
             })
             .state('drag' , {
                 url : '/drag',
                 templateUrl : 'views/drag.tpl.html',
                 controller : 'dragController',
                 data :{}
             });

             $urlRouterProvider.otherwise('/drag');
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

//
.factory('Roles' ,function($http , $q){
    var rolesArr = [];


    function rolesAsync(){
       var promise = $q.defer();

       if(rolesArr.length == 0){
           $http({
               method:'GET',
               url:'/digifyBytes/getRoles'
           })
           .success(function(data){
                rolesArr = data;
                promise.resolve(rolesArr);
           })
           .error(function(err){
               alert(err);
           });
       }
       else{
          promise.resolve(rolesArr);
       }
       return promise.promise;
    }

    //
    function rolesSync(){
       return rolesArr
    }

    ////
    return {
       rolesAsync:rolesAsync,
       rolesSync:rolesSync
    }

})

//This capitalizes the initial letter of a word
.filter('capitalize' , function(){
     return function(data){
          if(angular.isString(data)){
              var firstCh = angular.uppercase(data.substr(0,1));
              var restCh = angular.lowercase(data.substr(1));
              return firstCh+restCh;
          }
          else{
            return data;
          }
     }
})

//Filter to convert user data in bulk upload into nicely formatted array of json objects
.filter('mailFormatter' , function(Roles , $filter){
     //
     return function(data){
         if(angular.isArray(data)){
           var roles = Roles.rolesSync();
           var result = [];

           //data validator
           function isValidPerson(personStr){
             var personObj = {status:'pending'};
             var personDataArr = personStr.split(',');

             //test cases
             var validFirstName = /^[a-zA-Z]/.test(personDataArr[0]);
             var validlastName =  /^[a-zA-Z]/.test(personDataArr[1]);
             var validemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(personDataArr[2]);
             var validRole = roles.indexOf(personDataArr[3])>=0;

             //compile result
             personObj.firstname =  $filter('capitalize')(personDataArr[0]);
             personObj.lastname =  $filter('capitalize')(personDataArr[1]);
             personObj.email = personDataArr[2];
             personObj.role = personDataArr[3];

             if(validFirstName && validlastName && validemail && validRole){
                  return [personObj , true];
             }
             else{
               return [personObj , false];
             }
           }

           for(var i=0; i<data.length; i++){
               var validPerson = isValidPerson(data[i]);
               validPerson[0].isValid = validPerson[1];
               validPerson[0].line = i+1; //The line the data appeared in the csv file
               result.push(validPerson[0]);
           }
           return result;

         }
         else{
           return data;
         }
     }
})

// Factory for storing authentication
.factory('Auth' , function($http , $q , $timeout){
     //
     var loggedIn = false;

     //
     function login(password){
          var promise = $q.defer();
          //
          $http({
              method:'POST',
              url:'/digifyBytes/auth',
              data:password
          })
          .success(function(status){
               loggedIn = true;
               promise.resolve(status);
          })
          .error(function(err){
               promise.reject(err);
          });

          return promise.promise;
     }

     //
     function isAuth(){
         return loggedIn;
     }

     return {
         login:login,
         isAuth:isAuth
     }
})

// Factory for manual mails
.factory('manualMailer' , function($http , $q , Auth){
      //
      function sendCert(person){
          var promise = $q.defer();

          $http({
              method:'POST',
              url:'/digifyBytes/sendCert?auth='+Auth.isAuth(),
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
.controller('homeController' , function($scope , Auth ,  $timeout , $document){
      //
      $scope.views = [
          'bulk mail',
          'manual mail',
      ];

      //
      $scope.active = $scope.views[0];

      //
      $scope.setView = function(view){
           $scope.active = view;
      }

     //Controls login and views
     $document.find('html').css({overflow:'hidden'});
     $scope.isAuth = function(){
         return Auth.isAuth();
     }

     //
     $scope.login = function(password){
          $scope.authenticating = true;
          Auth.login({password:password}).then(
             function(status){
                 $scope.authenticating = false;
                 $document.find('html').css({overflow:'auto'})
                 console.log(status);
              },
              function(err){
                $scope.authenticating = false;
                $scope.loginError = err;
              }
          );
     }

     //
     $scope.resetError = function(){
         $scope.loginError = undefined;
     }
})

//manual Mailer controller
.controller('manualMailerController' , function($scope , $timeout , $filter ,manualMailer , Auth , Roles){
   Roles.rolesAsync().then(function(roles){
     //
      $scope.person = {};
      $scope.person.role = roles[0];
      $scope.roles = roles;
      $scope.certImg = 'img/test.png';
      $scope.error = {msg:'No error at this time' , status:false};

      //
      $scope.sendCert = function(person){
          $scope.sendingCert = true;
          person.firstname = $filter('capitalize')(person.firstname);
          person.lastname = $filter('capitalize')(person.lastname);
          manualMailer.sendCert(person).then(
              function(certImg){
                 $timeout(function(){
                     var index = certImg.indexOf('img');
                     $scope.certImg = certImg.substr(index);
                     console.log($scope.certImg);
                     $scope.error = {msg:'No error at this time' , status:false};
                     $scope.sendingCert = false;
                     $scope.person = {};
                     $scope.person.role = roles[0];
                 });
              },
              function(err){
                  $scope.error = {msg:err , status:true};
                  $scope.sendingCert = false;
              }
          );
      }
   });

})

//Bulk mailer controller
.controller('bulkMailerController' , function($scope , $window , $timeout , $interval ,  $filter , manualMailer , Auth){
      $scope.file = {};
      $scope.myLoaded = function(){
           $timeout(function(){
             $scope.file.data = $scope.file.data.substr($scope.file.data.indexOf(',')+1);
             var rawDataArr = $window.atob($scope.file.data).split('\n');

             //use custom filer to format data
             $scope.decodedArr = $filter('mailFormatter')(rawDataArr);
             $scope.formatError = function(){
                 var result = 0;
                 for(var i=0; i<$scope.decodedArr.length; i++){
                     var data = $scope.decodedArr[i];
                     if(!data.isValid){
                        result++;
                     }
                 }
                 return result
             }
           });
      }
      $scope.myError = function(err){
           console.log(err);
      }


      //
      $scope.concurrency = 1;
      $scope.updateConcurrency = function(val){
           if(val > 0){
              if($scope.concurrency < 10){
                  //$scope.concurrency++;
              }
           }
           else{
              if($scope.concurrency > 1){
                  //$scope.concurrency--;
              }
           }
      }

      //
      $scope.sendBulkMails = function(){
           $scope.sendingCerts = true;

           (function worker(index){
               if(index < $scope.decodedArr.length){
                   var person = $scope.decodedArr[index];
                   if(person.isValid){
                       //Send out certificates to contacts in mailing list
                       manualMailer.sendCert(person).then(
                           function(certImg){
                              person.status = 'sent';
                              worker(++index);
                           },
                           function(err){
                              person.status = 'failed';
                              worker(++index);
                           }
                       );
                       /*$timeout(function(){
                         person.status = 'sent';
                         worker(++index);
                       } , 3000);*/
                   }
                   else{
                       //
                       console.log('Invalid user data at line', index+1);
                       worker(++index);
                   }

               }
               else{
                  console.log('All valid mail on the list have been sent out');
                   $scope.sendingCerts = false;
               }

           })(0);
      }
})

//
.controller('dragController'  , function($scope , $timeout){


     //
     $scope.certTemplate = {
         img : 'img/Trainer-ZA.jpg',
         color:'#000',
         size:12,
         font:'Arial',
         categoryName:'categoryName',
         x:200,
         y:200
     };

     $scope.file = {};
     $scope.myLoaded = function(){
          $timeout(function(){
               $scope.certTemplate.img = $scope.file.data;
          });
     }
     $scope.myError = function(err){
          console.log(err);
     }

     //
     $scope.recordParent = function(e){
         $scope.parentX = e.layerX;
         $scope.parentY = e.layerY;

         if($scope.pinned){
            $scope.certTemplate.x = $scope.parentX-$scope.pinX;
            $scope.certTemplate.y = $scope.parentY-$scope.pinY;
         }
     }

     //
     $scope.recordChild = function(e){
         var dx = $scope.childX - e.layerX;
         var dy = $scope.childY - e.layerY;
         $scope.childX = e.layerX;
         $scope.childY = e.layerY;

         if($scope.pinned){
            $scope.certTemplate.x = $scope.parentX+dx;
            $scope.certTemplate.y = $scope.parentY+dy;
         }
     }

     //
     $scope.recordDown  = function(e){
         $scope.pinned = true;
         $scope.pinX = e.layerX;
         $scope.pinY = e.layerY;
     }

     $scope.recordUp  = function(e){
         $scope.pinned = false;
     }

     //
     $scope.notifyEnter = function(e){
         $scope.eChildX = e.layerX;
         $scope.eChildY = e.layerY;
     }

     //
     $scope.notifyLeave = function(e){
         $scope.lChildX = e.layerX;
         $scope.lChildY = e.layerY;
         if($scope.pinned){
           $scope.certTemplate.x = e.layerX - $scope.pinX;
           $scope.certTemplate.y = e.layerY - $scope.pinY;
         }

     }
});
