angular.module('directivesModule' , [])

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
}]);