angular.module('controllersModule' , [])

// This controller controls authentication
.controller('authController', function($scope, $state, Auth) {
    $scope.login = function(password) {
          $scope.authenticating = true;
          Auth.login({password:password}).then(
             function(status) {
                 $state.go('home');
              },
              function(err){
                $scope.authenticating = false;
                $scope.loginError = err;
              }
          );
     }

     $scope.resetError = function() {
         $scope.loginError = undefined;
     }
})

// This is the controller that controls the home view
.controller('homeController' , function($scope, $state, Auth ,  $timeout , $document) {
    if(!Auth.isAuth()) {
         $state.go('auth');
    }

    var loaded = [];

    $scope.getPartial = function(view) { 
        switch(view) {
            case 'overview': {
                return 'views/partials/overview.tpl.html'
            }
            case 'bulk': {
                return 'views/partials/bulk.tpl.html'
            }
            case 'manual': {
                return 'views/partials/manual.tpl.html'
            }
            default: {
                return ''
            }
        }
    }

    $scope.loadBuilder = function() {
        $state.go('drag');
    }
})

//manual Mailer controller
.controller('manualMailerController' , function($scope , $timeout , $filter ,manualMailer , Auth , Roles){
   $timeout(() => {
        componentHandler.upgradeAllRegistered();
   });
   Roles.rolesAsync().then(function(roles) {
      $scope.person = {};
      $scope.roles = roles;
      $scope.person.role = $scope.roles[0];

      $scope.certImg = 'img/test.png';
      $scope.error = {msg:'No error at this time' , status:false};

      $scope.sendCert = function(person) {
          $scope.sendingCert = true;

          person.firstname = $filter('capitalize')(person.firstname);
          person.lastname = $filter('capitalize')(person.lastname);
          manualMailer.sendCert(person).then(
              function(certImg) {
                 $timeout(function() {
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
              });
      }
   });
})

//Bulk mailer controller
.controller('bulkMailerController' , function($scope , $window , $timeout , $interval ,  $filter , manualMailer , Auth){
      $scope.file = {};
      $scope.myLoaded = function(){
           $timeout(function() {
             $scope.fileName = $scope.file.data.fileName.name;
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
     if(!Auth.isAuth()){
         $state.go('auth');
     }

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
     $scope.selectFromDropBox = function() {
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
                 && e.clientY-$scope.mT+(e.target.offsetHeight+(e.target.scrollHeight/2)-$scope.pinY) <=$scope.boxY) {
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