var express = require('express');
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectId;

/*This api is responsible for sending certificates to digifyBytes graduates*/
module.exports = function(emailClient, certClient, dbResource, roles) {
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
	   function getTemplate(firstname, lastname) {
		  console.log('get template called here');
		  return `
                    <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!-- Konverge: Digital Skills for Africa Certificate of Participation -->

    <!--[if gte mso 15]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>*|MC:SUBJECT|*</title>
    
<style type="text/css">
	p{
	margin:1em 0;
	padding:0;
	}
	table{
	border-collapse:collapse;
	}
	h1,h2,h3,h4,h5,h6{
	display:block;
	margin:0;
	padding:0;
	}
	img,a img{
	border:0;
	height:auto;
	outline:none;
	text-decoration:none;
	}
	body,#bodyTable,#bodyCell{
	height:100%;
	margin:0;
	padding:0;
	width:100%;
	}
	#outlook a{
	padding:0;
	}
	img{
	-ms-interpolation-mode:bicubic;
	}
	table{
	mso-table-lspace:0pt;
	mso-table-rspace:0pt;
	}
	.ReadMsgBody{
	width:100%;
	}
	.ExternalClass{
	width:100%;
	}
	p,a,li,td,blockquote{
	mso-line-height-rule:exactly;
	}
	a[href^=tel],a[href^=sms]{
	color:inherit;
	cursor:default;
	text-decoration:none;
	}
	p,a,li,td,body,table,blockquote{
	-ms-text-size-adjust:100%;
	-webkit-text-size-adjust:100%;
	}
	.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
	line-height:100%;
	}
	a[x-apple-data-detectors]{
	color:inherit !important;
	text-decoration:none !important;
	font-size:inherit !important;
	font-family:inherit !important;
	font-weight:inherit !important;
	line-height:inherit !important;
	}
	#bodyCell{
	padding:9px;
	}
	.templateImage{
	height:auto;
	max-width:564px;
	}
	.templateContainer{
	max-width:600px !important;
	}
	#templatePreheader{
	padding-right:9px;
	padding-left:9px;
	}
	#templatePreheader .columnContainer td{
	padding:0 9px;
	}
	#footerContent{
	padding-top:27px;
	padding-bottom:18px;
	}
	#templateHeader,#templateBody,#templateFooter{
	padding-right:18px;
	padding-left:18px;
	}
	/*
	@tab Page
	@section Background Style
	*/
	body,#bodyTable{
	/*@editable*/background-color:#FAFAFA;
	}
	/*
	@tab Page
	@section Email Border
	*/
	.templateContainer{
	/*@editable*/border:0;
	}
	/*
	@tab Page
	@section Heading 1
	*/
	h1{
	/*@editable*/color:#222222;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:40px;
	/*@editable*/font-style:normal;
	/*@editable*/font-weight:bold;
	/*@editable*/line-height:150%;
	/*@editable*/letter-spacing:normal;
	/*@editable*/text-align:left;
	}
	/*
	@tab Page
	@section Heading 2
	*/
	h2{
	/*@editable*/color:#222222;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:28px;
	/*@editable*/font-style:normal;
	/*@editable*/font-weight:bold;
	/*@editable*/line-height:150%;
	/*@editable*/letter-spacing:normal;
	/*@editable*/text-align:left;
	}
	/*
	@tab Page
	@section Heading 3
	*/
	h3{
	/*@editable*/color:#444444;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:22px;
	/*@editable*/font-style:normal;
	/*@editable*/font-weight:bold;
	/*@editable*/line-height:150%;
	/*@editable*/letter-spacing:normal;
	/*@editable*/text-align:left;
	}
	/*
	@tab Page
	@section Heading 4
	*/
	h4{
	/*@editable*/color:#999999;
	/*@editable*/font-family:Georgia;
	/*@editable*/font-size:20px;
	/*@editable*/font-style:italic;
	/*@editable*/font-weight:normal;
	/*@editable*/line-height:150%;
	/*@editable*/letter-spacing:normal;
	/*@editable*/text-align:left;
	}
	/*
	@tab Preheader
	@section Preheader Style
	*/
	#templatePreheader{
	/*@editable*/background-color:#FAFAFA;
	/*@editable*/background-image:none;
	/*@editable*/background-repeat:no-repeat;
	/*@editable*/background-position:center;
	/*@editable*/background-size:cover;
	/*@editable*/border-top:0;
	/*@editable*/border-bottom:0;
	/*@editable*/padding-top:9px;
	/*@editable*/padding-bottom:9px;
	}
	/*
	@tab Preheader
	@section Preheader Text
	*/
	#templatePreheader,#templatePreheader p{
	/*@editable*/color:#656565;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:12px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:left;
	}
	/*
	@tab Preheader
	@section Preheader Link
	*/
	#templatePreheader a,#templatePreheader p a{
	/*@editable*/color:#656565;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	/*
	@tab Header
	@section Header Style
	*/
	#templateHeader{
	/*@editable*/background-color:#FFFFFF;
	/*@editable*/background-image:none;
	/*@editable*/background-repeat:no-repeat;
	/*@editable*/background-position:center;
	/*@editable*/background-size:cover;
	/*@editable*/border-top:0;
	/*@editable*/border-bottom:0;
	/*@editable*/padding-top:18px;
	/*@editable*/padding-bottom:0;
	}
	/*
	@tab Header
	@section Header Text
	*/
	#templateHeader,#templateHeader p{
	/*@editable*/color:#606060;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:16px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:left;
	}
	/*
	@tab Header
	@section Header Link
	*/
	#templateHeader a,#templateHeader p a{
	/*@editable*/color:#237A91;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	/*
	@tab Body
	@section Body Style
	*/
	#templateBody{
	/*@editable*/background-color:#FFFFFF;
	/*@editable*/background-image:none;
	/*@editable*/background-repeat:no-repeat;
	/*@editable*/background-position:center;
	/*@editable*/background-size:cover;
	/*@editable*/border-top:0;
	/*@editable*/border-bottom:2px solid #EAEAEA;
	/*@editable*/padding-top:0;
	/*@editable*/padding-bottom:9px;
	}
	/*
	@tab Body
	@section Body Text
	*/
	#templateBody,#templateBody p{
	/*@editable*/color:#606060;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:16px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:left;
	}
	/*
	@tab Body
	@section Body Link
	*/
	#templateBody a,#templateBody p a{
	/*@editable*/color:#237A91;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	/*
	@tab Footer
	@section Footer Style
	*/
	#templateFooter{
	/*@editable*/background-color:#FAFAFA;
	/*@editable*/background-image:none;
	/*@editable*/background-repeat:no-repeat;
	/*@editable*/background-position:center;
	/*@editable*/background-size:cover;
	/*@editable*/border-top:0;
	/*@editable*/border-bottom:0;
	/*@editable*/padding-top:36px;
	/*@editable*/padding-bottom:9px;
	}
	/*
	@tab Footer
	@section Social Bar Style
	*/
	#socialBar{
	/*@editable*/background-color:#333333;
	/*@editable*/border:0;
	/*@editable*/padding:18px;
	}
	/*
	@tab Footer
	@section Social Bar Text
	*/
	#socialBar,#socialBar p{
	/*@editable*/color:#FFFFFF;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:12px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:center;
	}
	/*
	@tab Footer
	@section Social Bar Link
	*/
	#socialBar a,#socialBar p a{
	/*@editable*/color:#FFFFFF;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	/*
	@tab Footer
	@section Footer Text
	*/
	#footerContent,#footerContent p{
	/*@editable*/color:#656565;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:12px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:center;
	}
	/*
	@tab Footer
	@section Footer Link
	*/
	#footerContent a,#footerContent p a{
	/*@editable*/color:#656565;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	/*
	@tab Footer
	@section Utility Bar Style
	*/
	#utilityBar{
	/*@editable*/background-color:#FAFAFA;
	/*@editable*/border:0;
	/*@editable*/padding-top:9px;
	/*@editable*/padding-bottom:9px;
	}
	/*
	@tab Footer
	@section Utility Bar Text
	*/
	#utilityBar,#utilityBar p{
	/*@editable*/color:#656565;
	/*@editable*/font-family:Helvetica;
	/*@editable*/font-size:12px;
	/*@editable*/line-height:150%;
	/*@editable*/text-align:center;
	}
	/*
	@tab Footer
	@section Utility Bar Link
	*/
	#utilityBar a,#utilityBar p a{
	/*@editable*/color:#656565;
	/*@editable*/font-weight:normal;
	/*@editable*/text-decoration:underline;
	}
	@media only screen and (max-width: 480px){
	body,table,td,p,a,li,blockquote{
	-webkit-text-size-adjust:none !important;
	}

}	@media only screen and (max-width: 480px){
	body{
	width:100% !important;
	min-width:100% !important;
	}

}	@media only screen and (max-width: 480px){
	.templateImage{
	width:100% !important;
	}

}	@media only screen and (max-width: 480px){
	.columnContainer{
	max-width:100% !important;
	width:100% !important;
	}

}	@media only screen and (max-width: 480px){
	.mobileHide{
	display:none;
	}

}	@media only screen and (max-width: 480px){
	.utilityLink{
	display:block;
	padding:9px 0;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Heading 1
	*/
	h1{
	/*@editable*/font-size:22px !important;
	/*@editable*/line-height:175% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Heading 2
	*/
	h2{
	/*@editable*/font-size:20px !important;
	/*@editable*/line-height:175% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Heading 3
	*/
	h3{
	/*@editable*/font-size:18px !important;
	/*@editable*/line-height:175% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Heading 4
	*/
	h4{
	/*@editable*/font-size:16px !important;
	/*@editable*/line-height:175% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Preheader Visibility
	*/
	#templatePreheader{
	/*@editable*/display:block !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Preheader Text
	*/
	#templatePreheader,#templatePreheader p{
	/*@editable*/font-size:14px !important;
	/*@editable*/line-height:150% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Header Text
	*/
	#templateHeader,#templateHeader p{
	/*@editable*/font-size:16px !important;
	/*@editable*/line-height:150% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Body Text
	*/
	#templateBody,#templateBody p{
	/*@editable*/font-size:16px !important;
	/*@editable*/line-height:150% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Footer Text
	*/
	#templateFooter,#templateFooter p{
	/*@editable*/font-size:14px !important;
	/*@editable*/line-height:150% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Social Bar Text
	*/
	#socialBar,#socialBar p{
	/*@editable*/font-size:14px !important;
	/*@editable*/line-height:150% !important;
	}

}	@media only screen and (max-width: 480px){
	/*
	@tab Mobile Styles
	@section Utility Bar Text
	*/
	#utilityBar,#utilityBar p{
	/*@editable*/font-size:14px !important;
	/*@editable*/line-height:150% !important;
	}

}</style></head>

<body>
    <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
            <tr>
                <td align="center" valign="top" id="bodyCell">
                    <!-- BEGIN TEMPLATE // -->
                    <!--[if gte mso 9]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                    <tr>
                    <td align="center" valign="top" width="600" style="width:600px;">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                        <!-- BEGIN PREHEADER // -->
                        <tr>
                            <td valign="top" id="templatePreheader">

                                <!-- BEGIN MODULE: STANDARD PREHEADER // -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td valign="top">
                                            <!--[if mso]>
                                            <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                            <tr>
                                            <td valign="top" width="384" style="width:384px;">
                                            <![endif]-->
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:384px;" width="100%" class="columnContainer">
                                            
                                            </table>
                                          
                                        </td>
                                    </tr>
                                </table>
                                <!-- // END MODULE: STANDARD PREHEADER -->

                            </td>
                        </tr>
                        <!-- // END PREHEADER -->
                        <!-- BEGIN HEADER // -->
                        <tr>
                            <td valign="top" id="templateHeader">

                                

                            </td>
                        </tr>
                        <!-- // END HEADER -->
                        <!-- BEGIN BODY // -->
                        <tr>
                            <td valign="top" id="templateBody">

                                <!-- BEGIN MODULE: BODY CONTENT // -->
                                <div mc:edit="body_content">
                                    
<h3>Hello ${firstname} ${lastname}!</h3>
                                    
<p><strong>Your Digital Skills for Africa certificate of participation is here!</strong><br>You have completed the first step on your digital skills acquisition journey. If you are wondering how to get the best out of the new stream of knowledge, here are two recommended <strong>First Next Steps</strong>:</p>
1. Use the knowledge/skills you've just been introduced to <br />
2. <a href="https://learndigital.withgoogle.com/digitalskills/?gpid=1728512/">Get even more world class knowledge,</a> all FREE <br />
3. Follow the Digital Skills for Africa social media handles for updates and freebies: <br />
 Instagram: @digitalskillsAF <br />
Facebook:@digitalskillsforafrica <br />
Twitter: @digitalskillsAF <br />
4. Follow the hashtag #Konverge to see pictures from events and join future conversations

<p><h3>More, and even more!</h3></p>
We have aggregated the best and most succinct Digital Skills resources for you.<br />
1. <a href="https://digitalskills.withgoogle.com/?gpid=1728512">Get the Digital Skills Certificate of Completion</a> <br />
2. Download the FREE <a hre="http://www.redandyellow.co.za/wp-content/uploads/emarketing_textbook_download.pdf">5th Edition of Digital Marketing Textbook by Quirk Agency</a> <br />
3. Download the <strong>Primer App by Google</strong> from the Google Play Store or Apple App Store. <br />
4. Easy Graphic Design with <a href="http://www.canva.com">Canva App</a> <br />
5. Search and explore trends using <a href="http://google.com.ng/trends/explore">Google Trends</a> <br />
6. Do not forget to embed <a href="http://www.google.com.ng/analytics">Google Analytics</a> on your website. <br/>
7. Advertise on Facebook and Instagram using <a hre="https://www.google.com.ng/url?sa=t&rct=j&q=&esrc=s&source=web&cd=3&cad=rja&uact=8&ved=0ahUKEwj-nvHH65zUAhVGVBQKHao8AM0QFgg2MAI&url=https%3A%2F%2Fwww.facebook.com%2Fbusiness%2Fa%2Fonline-sales%2Fpower-editor&usg=AFQjCNFqtGjRT0IhdodGPKVn---IDk0mhw&sig2=oKnn37CNG8oYxxmxOM-mWw">Power Editor</a> <br />
8. Go to <a href="http://www.adwords.google.com">Google Adwords </a>for PPC, Display and Youtube Ads  
<p>Congratulations once again, keep learning, keep growing</p>
best regards, <br />
<strong>Olushola A. Aromokun </strong> <br />
Program Manager, <br />
#DigitalSkills4Africa, #Konverge <br />


                                </div>
                                <!-- // END MODULE: BODY CONTENT -->

                            </td>
                        </tr>
                        <!-- // END BODY -->
                        
</body>

</html>
		  `;
	  }

	  //
	  function sendEmail(person , attachment , cb) {
		 console.log('send email called');
         console.log('here is done called 1');
		 let htmlData = getTemplate(person.firstname, person.lastname);
		 let subject = 'Konverge Media Certificate';
		 let email = person.email;
		 console.log('here is done called 2');
		 emailClient.sendEmail(htmlData, email, subject, attachment, (err, status) => {
			  if(status){
				  return cb(null , status);
			  }
			  else if(err){
				  return cb(err , null);
			  }
		 });

		 console.log('here is done called 3');
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
