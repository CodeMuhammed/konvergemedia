//
/*var nodemailer =  require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        XOAuth2 :{
           user: "your_email_address@gmail.com",
           clientId: "your_client_id",
           clientSecret: "your_client_secret",
           refreshToken: "your_refresh_token"
        }
    }
});

//
module.exports = function(){

  function sendEmail(htmldata , email , subject  , attachment, cb){
      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: 'digifyBytes Africa <certificate@digifyafrica.com>', // sender address
          to: email, // list of receivers
          //cc:'second@domain.com',
   		   //bcc:'secretagent@company.gov',
   		   subject: subject,
   		   'h:Reply-To': 'certificate@digifyafrica.com',
   		   html: htmlData,
         attachments:[attachment]
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
	}
}*/

var nodemailer =  require('nodemailer');
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
		   attachment: attachment
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
}
