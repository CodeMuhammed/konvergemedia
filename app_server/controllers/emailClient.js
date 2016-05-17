
var ObjectId = require('mongodb').ObjectId;
var nodemailer =  require('nodemailer');
var path = require('path');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'certificate@digifyafrica.com',
        pass: 'pFz5_Rb1'
    }
});

module.exports = function(){

  function sendEmail(htmldata , email , subject , attachment , cb){
      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: 'Digify Africa <certificate@digifyafrica.com>', // sender address
          to: email, // list of receivers
          subject: subject, // Subject line
          html: htmldata, // html body
          'h:Reply-To': 'certificate@digifyafrica.com',
          attachments: [{path:attachment}]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              cb(error , null);
          }
          else {
              cb(null , info);
          }

      });
  }

	return {
		sendEmail : sendEmail
	};
}
/*var nodemailer =  require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: 'key-18c67bbd84cc584ccfa534f2be922bba',
    domain: 'palingram.com'
  }
}

//
var nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports = function(){

    function sendEmail(htmlData , email , subject , attachment ,  cb){
		var options = {
		   from: 'digifyBytes Africa <certificate@digifyafrica.com>',
		   to: email, // An array if you have multiple recipients.
		   //cc:'second@domain.com',
		   //bcc:'secretagent@company.gov',
		   subject: subject,
		   'h:Reply-To': 'certificate@digifyafrica.com',
		   html: htmlData,
		   attachment: attachment // could also be in an array format
		};

		nodemailerMailgun.sendMail(options, function (err, info) {
			if (err) {
				console.log(err);
				return cb(err , null);
			}
			else {
				console.log(info);
				return cb(null , info);
			}
		});
  }

	return {
		sendEmail : sendEmail
	};
}*/
