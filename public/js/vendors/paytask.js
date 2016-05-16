//==============paytask plugin for angular js=============================
angular.module('paytask' , [])

.directive('paytask' ,   function(){
    return {
       restrict: 'E',
       template : '<button class="btn btn-sm btn-primary btn-block" ng-click="clickBtn()">pay with paytask</button>',
       controller: 'payTaskController'
     }
})

//
.factory('paytaskFactory' , function($rootScope , $window , $document){
     var initialized = false;
     return {
         initOnce:function(){
             if(!initialized){
                 $window.addEventListener('message', function(event) {
                    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
                    if (origin === 'http://localhost:5001'){
                        if(event.data.status === 'cancel'){
                             $document.find('body').children().eq(0).remove()
                             $rootScope.$broadcast("paytask:cancelled" , {});
                        }
                        else if(event.data.status === 'done'){
                            $document.find('body').children().eq(0).remove()
                            $rootScope.$broadcast("paytask:done" , {});
                        }
                        else if(event.data.status === 'verify'){
                            event.source.postMessage({msg:'Verify host', status:'verify'}, '*');
                        }
                    }
                });
                initialized = true;
             }
             
         }
     }
})

//
.controller('payTaskController' , function($rootScope , $scope , $document , $timeout , $window , paytaskFactory){
      $scope.clickBtn = function(){
           var paytask = angular.element('<div id="paytask"><iframe src="http://localhost:5001" class="col-xs-12 col-sm-8 col-sm-offset-2 col-xs-offset-0" style="padding:0; height:628px"></iframe></div>');
           paytask.css({
              width:'100%',
              height:'800px', 
              backgroundColor:'rgba(0 , 0 , 0, .8)',
              position:'fixed',
              zIndex:'100000000000000'
           });
           $document.find('body').eq(0).prepend(paytask);
      };
      
      //initialize the event listener that will recieve messages from paystack.io
      paytaskFactory.initOnce();
})
