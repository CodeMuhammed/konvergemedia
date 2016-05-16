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
		   from: 'palingramblog@gmail.com',
		   to: email, // An array if you have multiple recipients.
		   //cc:'second@domain.com',
		   //bcc:'secretagent@company.gov',
		   subject: subject,
		   'h:Reply-To': 'codemuhammed@gmail.com',
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