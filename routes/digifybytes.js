var express = require('express');
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectId;

/*This api is responsible for sending certificates to digifyBytes graduates*/
module.exports = function(emailClient , certClient , dbResource , roles) {
    let DigifyList = dbResource.model('DigifyList');
	let Templates = dbResource.model('Templates');

	//
	function refreshRoles(){
		Templates.find({} , {_id:0 , categoryName:1})
		         .toArray((err , results) => {
					if(err) {
						throw new Error('Unable to get roles from db here');
					}
					else {
						for(var i = 0; i < results.length; i++) {
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
		  if(cert && certImg) {
			  return cb(null, cert, certImg);
		  }
		  else if(err) {
			  console.log('there was error getting certificate');
			  return cb(err, null, null);
		  }
	   });
	}

	//
	router.route('/auth')
		.post(function(req , res){
			if(req.body.password === 'admin@knvgmedia' || req.body.password === 'codemuhammed'){
				res.status(200).send('Successfully authenticated admin');
			} else {
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
				getCert(person, (err, cert, certImg) => {
					if(err) {
						res.status(500).send(err);
					} else {
						console.log('certificate was gotten Successfully here');
						sendEmail(person, cert, (err, status) => {
							if(err) {
							   res.status(500).send(err);
							} else {
							//Squash it down to a comma seperated entity and save person to database
							var newPerson  = {
							data : [
								person.firstname,
								person.lastname,
								person.role
							].join(','),
							email : person.email
							};

							DigifyList.update({email:newPerson.email} , newPerson , {upsert:true} , function(err , stats){
								if(err) {
									console.log('There was an error saving data');
									res.status(200).send(certImg);
								} else {
									res.status(200).send(certImg);
								}
							});
							}
						});
					}
				});
			} else {
				res.status(400).send('Cannot send certificate');
			}
	   });

	   //
	  function sendEmail(person , attachment , cb) {
		 console.log('send email called');
		 console.log(emailClient);
		 var htmlData = getTemplate(firstname, lastname);
		 var attachment = attachment;
		 var subject = 'Konverge Media Certificate';
		 var email = person.email;

		 emailClient.sendEmail(htmlData, email, subject, attachment, (err, status) => {
			  if(status){
				  return cb(null , status);
			  }
			  else if(err){
				  return cb(err , null);
			  }
		 });
	}

	//
	function getTemplate(firstname, lastname) {
		return `
		<div>
			<p>
				Congratulations <b>${firstname} ${lastname}</b>!, your Digital Skills certificate of
				participation is here!
			</p>
			<p>
				You have completed the first step on your digital skills acquisition journey.
				If you are wondering how to get the best out of the new stream of knowledge,
				here are two recommended "next steps".
				<ol>
					<li>Use the knowledge/skills you've just been introduced to</li>
					<li>Get even more world class knowledge, all <b>FREE</b></li>
				</ol>
			</p>
			<br />
			<br />
			<p>
				<h5>More! and even more!</h5>
				<p>
					We have aggregated the best and most succinct digital skills/social Media
					skills resources for you.
					<ol>
						<li>
							Get the Digital Skills Certificate of Completion 
							https://digitalskills.withgoogle.com/?gpid=1728512  
							<i>
								<< doesnt take more than 1 hour to complete on any device (laptops, desktop, tablets & smartphones)
							</i>
						</li>
						<li>
							Download the FREE 5th Edition of Digital Marketing Textbook by Quirk Agency
                            http://www.redandyellow.co.za/wp-content/uploads/emarketing_textbook_download.pdf
						</li>
						<li>
							 Download the <b>Primer App</b> by Google from the Google Play Store or Apple App Store 
							 https://digitalskills.withgoogle.com/?gpid=1728512
						</li>
					</ol>
				</p>
			</p>
		</div>
		`;
	}

	//
	router.route('/viewCert') //add authentication rules
	  .get(function(req , res) {
		if(req.query.auth && req.query.role) {
			Templates.findOne({categoryName:req.query.role} , function(err , result){
				if(err) {
					res.status(400).send('Cannot view certificate db error');
				} else {
					console.log(result);

					//extend result to reflect firstnme lastname
					result.firstname = req.query.firstname || 'JULIAN';
					result.lastname = req.query.lastname || 'MAYS';

					//render result
					res.render('digifycert.ejs' , result);
				}
			});
		} else {
			res.status(400).send('Cannot view certificate not admin');
		}
	});

//
router.route('/templates')
   .get(function(req , res) {
	   Templates.find({})
	            .sort({date:-1})
				.toArray((err,  results) => {
					if(err) {
						res.status(500).send('Error while connecting to database');
					} else if(!results[0]) {
						res.status(200).send([]);
					} else { 
						res.status(200).send(results);
					}
				});
	 })

	 //
	 .post((req , res) => {
		 let old = false;
		 let query = { _: '_'}; // purposely set to look for a document that does not exist

		 if(req.body._id){
			old = true;
			req.body._id = ObjectId(req.body._id);
			query = {_id:req.body._id}
		 }

		 Templates.update(query, req.body, {upsert:true} , function(err , stats) {
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
	 .delete(function(req , res) {
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
