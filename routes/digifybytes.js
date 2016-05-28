var express = require('express');
var router = express.Router();
var path = require('path');

/*This api is responsible for sending certificates to digifyBytes graduates*/
module.exports = function(emailClient , certClient){
	console.log('Digify Bytes Loaded');

	////
	var roles = [
	     'Trainer-AfricaWide',
	     'Trainer-ZA',
	     'DigitalStrategy101-ZA',
	     'DigitalStrategy101-AfricaWide',
	     'DigitalStrategy101-Online',
	     'Digital101-ZA',
	     'Digital101-AfricaWide',
	     'Digital101-Online',
	     'Strategy101-ZA',
	     'Strategy101-AfricaWide',
	     'Strategy101-Online'
	];

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
		 var htmlData = '<b>Congratulations '+person.firstname+' '+person.lastname+'</b>, <span>your Digify Africa certificate is here!</span>';
		 var attachment = attachment;
		 var subject = 'Digify Africa Certificate';
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
 	router.route('/getRoles')
 		.get(function(req , res){
        res.status(200).send(roles);
 		 });

  //
	router.route('/sendCert') //add authentication rules
	   .post(function(req , res){
		    var person = req.body;
				if(req.query.auth){
						getCert(person,  function(err , cert , certImg){
								if(err){
									res.status(500).send(err);
								}
								else{
									sendEmail(person, cert , function(err , status){
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
					    console.log(req.query.role);
							//init query object to default or with values from query string parameters
							var baseUrl = process.env.NODE_ENV == 'production'? 'http://digifyBytes.herokuapp.com/' : 'http://localhost:4000/';

							//Information to be bound to views
							var index = req.query.role && roles.indexOf(req.query.role)>=0 ? roles.indexOf(req.query.role) : 0;
							var data = {
								  firstname : req.query.firstname || 'JULIAN',
									lastname : req.query.lastname || 'MAYS',
									certUrl : baseUrl+'img/'+roles[index]+'.jpg',
									position : index<=1? '415' : '340',
								  color: '#BC5192',
									fontSize:index<=1? '2.5em' : '3.5em',
							};

							//render results
							res.render('digifycert.ejs' , data);
				 }
				 else{
					   res.status(400).send('Cannot view certificate not admin');
				 }

	   });


	//This router exposes certain api needed by client
    return router;
};
