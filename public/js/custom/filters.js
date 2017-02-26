angular.module('filtersModule' , [])

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
});