angular.module('servicesModule' , [])

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

// Factory for storing authentication
.factory('Auth' , function($http , $q , $timeout, localStorageService){
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
               localStorageService.set('token', password);
               promise.resolve(status);
          })
          .error(function(err){
               promise.reject(err);
          });

          return promise.promise;
     }

     //
     function isAuth() {
         if(localStorageService.get('token')) {
             loggedIn = true;
         }
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
          if(person.status == 'sent'){
              console.log('Email already sent');
              promise.resolve('sent');
          }
          else {
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
          }


          return promise.promise;
      }
      return {
           sendCert:sendCert
      };
})