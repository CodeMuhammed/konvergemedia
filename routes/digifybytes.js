var express = require('express');
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectId;

/*This api is responsible for sending certificates to digifyBytes graduates*/
module.exports = function(emailClient , certClient , dbResource , roles){
	console.log('Digify Bytes Loaded');
  var DigifyList = dbResource.model('DigifyList');
	var Templates = dbResource.model('Templates');

	//
	function refreshRoles(){
		Templates.find({} , {_id:0 , categoryName:1}).toArray(function(err , results){
				 if(err){
						 throw new Error('Unable to get roles from db here');
				 }
				 else{
						 for(var i=0; i<results.length; i++){
								 results[i] = results[i].categoryName;
						 }
						 roles = results;
				 }
		});
	};

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
					   res.status(500).send('Failed to authenticate admin');
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
													 //Save user to database
													 DigifyList.update({email:person.email} , person , {upsert:true} , function(err , stats){
														    if(err){
																	  console.log('There was an error saving data');
																		res.status(200).send(certImg);
																}
																else{
																	 res.status(200).send(certImg);
																}
													 });
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
			   if(req.query.auth && req.query.role){
							Templates.findOne({categoryName:req.query.role} , function(err , result){
								   if(err){
										   res.status(400).send('Cannot view certificate db error');
									 }
									 else{
										  console.log(result);

											//extend result to reflect firstnme lastname
											result.firstname = req.query.firstname || 'JULIAN';
											result.lastname = req.query.lastname || 'MAYS';

											//render result
											res.render('digifycert.ejs' , result);
									 }
							});
				 }
				 else{
					   res.status(400).send('Cannot view certificate not admin');
				 }
	   });

//
router.route('/templates')
   //
   .get(function(req , res){
		    Templates.find({}).sort({date:-1}).toArray(function(err ,  results){
					    if(err){
								  res.status(500).send('Error while connecting to database');
							}
							else if(!results[0]){
								  res.status(200).send([]);
							}
							else{
								  res.status(200).send(results);
							}
				});
	 })

	 //
	 .post(function(req , res){
			 var old = false;
			 var query = {nonexistent:'nonexistent'}; // purposely set to look for a document that does not exist
			 console.log(req.body);

			 if(req.body._id){
				   old = true;
				   req.body._id = ObjectId(req.body._id);
					 query = {_id:req.body._id}
			 }


			 Templates.update(query, req.body, {upsert:true} , function(err , stats){
						if(err){
							 console.log(err);
							 res.status(500).send('Err updating Templates');
						}
						else{
							refreshRoles();
						  res.status(200).send(old?req.body._id:stats.result.upserted[0]._id);
						}
			  });
	 })

	 //
	 .delete(function(req , res){
		  console.log('Delete called');
      Templates.remove({_id:ObjectId(req.query._id)} , function(err , stats){
					if(err){
						 console.log(err);
						 res.status(500).send('Err deleting Templates');
					}
					else{
							refreshRoles();
							res.status(200).send('done deleting');
					}
			});

	 });

	//This router exposes certain api needed by client
    return router;
};
