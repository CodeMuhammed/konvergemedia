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

//custom directive monitor image loading process from start to finish
.directive('awesomeImg', function($timeout) {
       return {
           restrict: 'E',
           scope:{
              url : '@url',
              style  : '@style',
              boxX   : '@boxx',
              boxY   : '@boxy',
           },
           template: [
               '<div class="spinner-c" ng-show="imageLoading.statusType != \'loaded\'">',
                   '<div class="overlay" style="width:{{boxX}}px; height:{{boxY}}px;">',
                     '<div class="spinner">',
                         '<div class="double-bounce1"></div>',
                         '<div class="double-bounce2"></div>',
                     '</div>',
                     '<div class="msg">',
                         '<div ng-switch on="imageLoading.statusType">',
                             '<div ng-switch-when="error">',
                                  'Template was not loaded. Click to',
                                  '<button  class="btn btn-xs btn-default" ng-click="reloadImg()">',
                                    'retry </button> ...',
                             '</div>',
                             '<div ng-switch-when="retry">',
                                  'Attempting to reload image please wait...',
                             '</div>',
                             '<div ng-switch-when="loading">',
                                  'Template loading {{imageLoading.progress}}% ..',
                             '</div>',
                             '<div ng-switch-when="loaded">',
                                  'Template loading complete {{imageLoading.progress}}%',
                             '</div>',
                         '</div>',
                     '</div>',
                   '</div>',
                '</div>',
                '<img ng-src="{{imageLoading.url}}" alt="" style="{{style}}" />',
         ].join(''),
         controller: function($scope , $timeout){
              //Define the image loading object that binds to the view
              $scope.imageLoading = {
                   statusType : 'loading',
                   url : '',
                   progress: 0
              };

              $scope.$watch('url' , function(newVal , oldVal){
                    if(oldVal != newVal && angular.isDefined(newVal)){
                        loadImage(newVal);
                    }
              });

              //
              function loadImage(url){
                  $scope.imageLoading.url = 'phooney.png';
                  $scope.imageLoading.statusType = 'loading';
                  var imageUrl = url;
                  //DO the xhr dance
                  var imgObj = new Image();
                  var request = new XMLHttpRequest();
                  request.onprogress = function(event) {
                    $timeout(function(){
                        if (!event.lengthComputable) {
                          return;
                        }
                        var loaded = event.loaded;
                        var total = event.total;
                        $scope.imageLoading.progress = parseInt( ( loaded / total ) * 100 );
                    });
                  };

                  request.onload = function(event) {
                    request.onloadend = function(event){
                        $timeout(function(){
                            $scope.imageLoading.statusType = 'loaded';
                            console.log('Complete' , imageUrl);
                        } , 3000);
                    };
                    $timeout(function(){
                      console.log('loading', imageUrl);
                      $scope.imageLoading.statusType = 'loading';
                      $scope.imageLoading.url = imageUrl;
                    });
                  };

                  request.onerror = function(event) {
                    $timeout(function(){
                        $scope.imageLoading.statusType = 'error';
                        console.log('error');
                    });

                  }

                  //Retrieve the image from the server
                  request.open('GET', imageUrl, true);
                  request.overrideMimeType('text/plain; charset=x-user-defined');
                  request.send(null);
              }

              //Releads the image
              $scope.reloadImg = function(){
                  $scope.imageLoading.statusType = 'retry';
                  $timeout(function(){
                        loadImage($scope.url);
                  } , 2000);
              }
         }
    };
})

//A directive for reading txt files
.directive('fileSelect', ['$window', function ($window) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, el, attr, ngModel) {
            var fileReader = new $window.FileReader();
            var fileName;

            fileReader.onload = function () {
                console.log(fileReader.result);
                var result = {
                   fileName:fileName,
                   data : fileReader.result
                };
                ngModel.$setViewValue(result);

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
                fileName = e.target.files[0];

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
.factory('Roles' ,function($http , $q , $timeout){
    var rolesArr = [];
    var certsArr = [];

    function rolesAsync(){
       var promise = $q.defer();
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

       return promise.promise;
    }

    //
    function rolesSync(){
       return rolesArr
    }

    //
    function certsAsync(){
        var promise = $q.defer();

        if(certsArr.length == 0){
             $http({
                method: 'GET',
                url:'/digifyBytes/templates'
             })
             .success(function(data){
                  certsArr = data;
                  promise.resolve(certsArr);
             })
             .error(function(err){
                  promise.reject(err);
             });
        }
        else{
           promise.resolve(certsArr);
        }

        return promise.promise;
    }

    //
    function saveCert(template){
       var promise = $q.defer();
       console.log(template);

       $http({
           method:'POST',
           url:'/digifyBytes/templates',
           data:template
       })
       .success(function(data){
           promise.resolve(data);
       })
       .error(function(err){
           promise.reject(err);
       });

       return promise.promise;
    }

    //
    function deleteCert(_id , name){
        console.log(_id);
        var promise = $q.defer();

        $http({
            method:'DELETE',
            url:'/digifyBytes/templates',
            params:{_id:_id , name:name}
        })
        .success(function(data){
            promise.resolve(data);
        })
        .error(function(err){
            promise.reject(err);
        });

        return promise.promise;
    }

    //
    return {
       rolesAsync:rolesAsync,
       rolesSync:rolesSync,
       certsAsync:certsAsync,
       saveCert:saveCert,
       deleteCert:deleteCert
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
           function isValidPerson(personArr){
             var personObj = {status:'pending'};
             var personDataArr = personArr;

             //
             for(var i=personDataArr.length; i<4; i++){
                 personDataArr[i] = '';
             }

             //test cases
             var validFirstName = /^[a-zA-Z]/.test(personDataArr[0].trim());
             var validlastName =  /^[a-zA-Z]/.test(personDataArr[1].trim());
             var validemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(personDataArr[2].trim());
             var validRole = roles.indexOf(personDataArr[3])>=0;

             //compile result
             personObj.firstname =  $filter('capitalize')(personDataArr[0]);
             personObj.lastname =  $filter('capitalize')(personDataArr[1]);
             personObj.email = personDataArr[2];
             personObj.role = personDataArr[3];

             if(validFirstName && validlastName && validemail && validRole){
                  personObj.isValid = true;
                  personObj.linesValid = [validFirstName , validlastName , validemail , validRole];
                  return personObj;
             }
             else{
                 personObj.isValid = false;
                 personObj.linesValid = [validFirstName , validlastName , validemail , validRole];
                 return personObj;
             }
           }

           //
           for(var i=0; i<data.length; i++){
               if(i == data.length-1 && data[i].length==1){
                   //
                   console.log('last line is an empty string');
               }
               else{
                 var validPerson = isValidPerson(data[i]);
                 validPerson.line = i+1; //The line the data appeared in the csv file
                 result.push(validPerson);
               }

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
     if(Auth.isAuth()){
       //Enable scrolling
       $document.find('html').css({overflow:'auto'});
     }
     else{
       //Disble scrolling to pin dispaly down
       $document.find('html').css({overflow:'hidden'});
     }

      $scope.views = [
          'bulk',
          'manual',
          'template'
      ];



      //
      $scope.active = $scope.views[0];

      //
      $scope.setView = function(view){
           $scope.active = view;
      }

     //Controls login and views
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
             $scope.file.data.data = $scope.file.data.data.substr($scope.file.data.data.indexOf(',')+1);
             //use custom filer to format data
             Papa.parse($window.atob($scope.file.data.data) , {
               complete: function(result){
                   $timeout(function(){
                       $scope.decodedArr = $filter('mailFormatter')(result.data);

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
               },
               error: function(err){
                   alert('Invalid txt or csv file');
               }
             });
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
      $scope.index = 0;
      $scope.sendBulkMails = function(){
           $scope.index = 0;
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
                              $scope.index++;
                           },
                           function(err){
                              person.status = 'failed';
                              worker(++index);
                              $scope.index++;
                           }
                       );
                       /*$timeout(function(){
                         person.status = 'sent';
                         $scope.index++;
                         worker(++index);
                       } , 500);*/
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

    //
    $scope.instructions = false;
    //
    $scope.showOutAlert = true;
    $scope.showIns = function(){
         $scope.instructions = !$scope.instructions;
    }
})

//
.controller('dragController'  , function($scope  , $state , $timeout, $document , Roles , Auth){
     //Bounce users who are not yet auth to home
     /*if(!Auth.isAuth()){
         $state.go('home');
     }*/

     //Disble scrolling to pin dispaly down
     $document.find('html').css({overflow:'hidden'});

     //
     $scope.view = 'settings';

     //
     $scope.toggleView  = function(view){
         $scope.view = view;
     }


     //
     Roles.certsAsync().then(
         function(certs){
            $scope.certTemplates = certs;
            $scope.certTemplate = $scope.certTemplates[0];
         },
         function(err){
            console.log(err);
         }
     );

     //
     $scope.activeTemplateClass = function(template){
         return $scope.certTemplate == template?'btn-primary':'';
     }

     //
     $scope.addTemplate = function(){
          $scope.certTemplates.unshift({
             imgUrl:'buddy.jpg',
             color:'#000',
             font:{
                face:'Arial',
                weight:'normal',
                size:30,
                style:'normal'
             },
             placeholderText:'placeholderText',
             categoryName:'NewCategoryName',
             x:300,
             y:300
         });
         $scope.certTemplate = $scope.certTemplates[0];
         $scope.view = 'settings';
     }

     //
     $scope.selectFromDropBox = function(){
           options = {
              // Required. Called when a user selects an item in the Chooser.
              success: function(files) {
                  $timeout(function(){
                      console.log(files[0].link);
                      $scope.certTemplate.imgUrl = files[0].link.substr(0 , files[0].link.indexOf('?')).replace('www.dropbox' , 'dl.dropboxusercontent');
                      console.log($scope.certTemplate.imgUrl);//

                      //inferr category name from file name
                      $scope.certTemplate.categoryName = files[0].name.substr(0 , files[0].name.indexOf('.'));
                  });
              },

              // Optional. Called when the user closes the dialog without selecting a file
              // and does not include any parameters.
              cancel: function() {
                   console.log('Selection cancelled');
              },

              linkType: "preview", // or "direct"
              multiselect: false,  // or true
              extensions: ['.jpg', '.png'],
          };

          Dropbox.choose(options);
     };

     //
     $scope.saveTemplate = function(){
         $scope.savingTemplate = true;
         if(angular.isDefined($scope.certTemplate)){
           Roles.saveCert(angular.copy($scope.certTemplate)).then(
               function(_id){
                   $scope.savingTemplate = false;
                   $scope.certTemplate._id = _id;
               },
               function(err){
                   console.log(err);
               }
           );
         }
     };

     //
     $scope.deleteTemplate = function(){
       var index = $scope.certTemplates.indexOf($scope.certTemplate);

       if(angular.isDefined($scope.certTemplate._id)){
         $scope.deletingTemplate = true;
         Roles.deleteCert($scope.certTemplate._id , $scope.certTemplate.categoryName).then(
             function(status){
                 $scope.deletingTemplate = false;
                 $scope.certTemplates.splice(index , 1);
                 $scope.certTemplate =  $scope.certTemplates[0];
             },
             function(err){
                 console.log(err);
                 //$scope.deletingTemplate = false;
             }
         );
       }
       else{
          $scope.certTemplates.splice(index , 1);
          $scope.certTemplate =   $scope.certTemplates[0];
       }

     }

     //
     $scope.canDelete = function(){
          if(angular.isDefined($scope.certTemplate)){
               return angular.isDefined($scope.certTemplate._id) && $scope.certTemplates.length>0;
          }
          return false;
     }

     //
     $scope.canPreview = function(){
         if(angular.isDefined($scope.certTemplate)){
              return angular.isDefined($scope.certTemplate._id) && $scope.certTemplates.length>0;
         }
         return false;
     }

    //
    $scope.changeActiveTemplate = function(template){
        if(template){
          $scope.certTemplate = template;
        }
        else{
           //Temporarily load a different template from this outline
           var temp = $scope.certTemplate;
           $scope.certTemplate = '';
           $timeout(function(){
               $scope.certTemplate = temp;
           } , 100);
           $scope.certTemplate
        }
    }

     //
     $scope.toggleStyle = function(property){
         if(property == 'style'){
             $scope.certTemplate.font[property] = $scope.certTemplate.font[property] == 'normal'? 'italic' : 'normal';
         }
         else if(property == 'weight'){
            $scope.certTemplate.font[property] =  $scope.certTemplate.font[property] == 'normal'? 'bold' : 'normal';
         }
     }

     //
     $scope.mT = 80; //margin-top
     $scope.mL = 400; //margin-left
     $scope.boxX = 800;
     $scope.boxY = 600;
     $scope.recordParent = function(e){
         if($scope.pinned){
            if(e.clientX-$scope.pinX-$scope.mL >= 0
                 && e.clientY-$scope.pinY-$scope.mT >=0
                   && e.clientX-$scope.mL+(e.target.offsetWidth+(e.target.offsetLeft*2)-$scope.pinX) <=$scope.boxX
                     && e.clientY-$scope.mT+(e.target.offsetHeight+(e.target.scrollHeight/2)-$scope.pinY) <=$scope.boxY){
                $scope.certTemplate.x = e.clientX-$scope.pinX-$scope.mL;
                $scope.certTemplate.y = e.clientY-$scope.pinY-$scope.mT;
            }

         }
     }

     //
     $scope.pinned = false;
     $scope.recordDown  = function(e){
         console.log(e);
         $scope.pinned = !$scope.pinned;
         $scope.pinX = e.layerX;
         $scope.pinY = e.layerY;
     }
});
