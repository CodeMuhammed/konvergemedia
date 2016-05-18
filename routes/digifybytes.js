var express = require('express');
var router = express.Router();
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

	//
	router.route('/auth')
		.post(function(req , res){
         if(req.body.password === 'admin@digify'){
					    res.status(200).send('Successfully authenticated admin');
				 }
				 else{
					   res.status(500).send('Failed authenticate admin');
				 }
		 });

  //
	router.route('/sendCert') //add authentication rules
	   .post(function(req , res){
		    var person = req.body;
				if(req.query){
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
				}
				else{
					 res.status(400).send('Cannot send certificate');
				}

	   });

	//
	router.route('/viewCert') //add authentication rules
	  .get(function(req , res){
			   if(req.query.auth){
							 //init query object to default or with values from query string parameters
							var baseUrl = process.env.NODE_ENV == 'production'? 'http://digifyBytes.herokuapp.com/' : 'http://localhost:4000/';

							var roleCertObj = {
									'trainerNG':{certUrl:baseUrl+'img/DTCA.jpg' , position:'415'},
									'trainerSA':{certUrl:baseUrl+'img/DTCSA.jpg', position:'415'},
									'learnerNG':{certUrl:baseUrl+'img/DSCA.jpg' , position:'400'},
									'learnerSA':{certUrl:baseUrl+'img/DSCSA.jpg', position:'450'}
							};

							var role = req.query.role || 'learnerSA';

							//Information to be bound to views
							var data = {
								firstname : req.query.firstname || 'JULIAN',
								lastname : req.query.lastname || 'MAYS',
								certUrl : roleCertObj[role].certUrl,
								position : roleCertObj[role].position
							};

							res.render('digifycert.ejs' , data);
				 }
				 else{
					   res.status(400).send('Cannot view certificate not admin');
				 }

	   });


	//This router exposes certain api needed by client
    return router;
};
