var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/*This api is responsible for sending certificates to digifyBytes graduates*/
module.exports = function(emailClient , certClient){
	console.log('Digify Bytes Loaded');

	//
	function getCert(person, cb){
		 console.log('getting certificate for', person.firstname , person.lastname);
	   var dirNamedFile = path.join(__dirname , 'pdf' , person.firstname+person.lastname+person.role);
		 var dirImgFile = path.join(__dirname , '../' , 'public' ,'img' , person.firstname+person.lastname+person.role);
	   certClient.getCert(person, dirNamedFile  , dirImgFile , function(err , cert , certImg){
		  if(cert && certImg){
			  return cb(null , cert , certImg);
		  }
		  else if(err){
			  return cb(err , null , null);
		  }
	   });
	}

	//
	function sendEmail(person , attachment , cb){
		 console.log('sending certificate to', person.firstname , person.lastname);
		 var htmlData = '<b>Congratulations '+person.firstname+' '+person.lastname+'</b>, <span>your Digify Bytes certificate is here!</span>';
		 var attachment = attachment;
		 var subject = 'Digify Bytes Certificate';
		 var email = person.email;
		 emailClient.sendEmail(htmlData , email , subject , attachment,  function(err , status){
			  if(status){
				  return cb(null , status);
			  }
			  else if(err){
				  return cb(err , null);
			  }
		 });
	}

	router.route('/sendCert')
	   .post(function(req , res){
		    //use defaults
		    var person = req.body;
		    getCert(person,  function(err , cert , certImg){
				if(err){
					res.status(500).send(err);
				}
				else{
					sendEmail(person, certImg , function(err , status){
					   if(err){
						  res.status(500).send(err);
					   }
					   else{
							 console.log(status);
						   res.status(200).send(certImg);
					   }
					});
				}
			});
	   });

	//
	router.route('/viewCert')
	  .get(function(req , res){
		   //init query object to default or with values from query string parameters
			 var baseUrl = process.env.NODE_ENV == 'production'? 'http://digifyBytes.herokuapp.com/' : 'http://localhost:4000/';
			 var certUrl = '';
			 var position= '';
			 var color = '';
			 var role = req.query.role;
			 var roleCertObj = {
				   'trainerNG':{certUrl:baseUrl+'img/DTCA.jpg' , color:'#B17092' , position:'415'},
				   'trainerSA':{certUrl:baseUrl+'img/DTCSA.jpg', color:'#B17092' , position:'415'},
					 'learnerNG':{certUrl:baseUrl+'img/DSCA.jpg' , color:'#000' , position:'400'},
					 'learnerSA':{certUrl:baseUrl+'img/DSCSA.jpg', color:'#000' , position:'450'}
			 };

			 if(role){
           certUrl = roleCertObj[role].certUrl;
					 color = roleCertObj[role].color;
					 position = roleCertObj[role].position;
			 }
			 else{
           certUrl = roleCertObj['learnerSA'].certUrl;
					 color = roleCertObj['learnerSA'].color;
					 position = roleCertObj['learnerSA'].position;
			 }

			 //Information to be bound to views
		   var data = {
			   firstname : req.query.firstname || 'JULIANS',
			   lastname : req.query.lastname || 'MAYS',
				 certUrl: certUrl ,
				 color:color,
				 position:position
		   };

			 console.log(data);

		   res.render('digifycert.ejs' , data);
	   });


	//This router exposes certain api needed by client
    return router;
};
