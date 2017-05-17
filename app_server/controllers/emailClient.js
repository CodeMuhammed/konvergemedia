var nodemailer =  require('nodemailer');
var sg = require('nodemailer-sendgrid-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var options = {
  auth: {
    api_key: process.env.sendgrid_api_key
  }
}   

module.exports = function() {
	return {
		sendEmail: (htmlData, email, subject, attachment,  cb) => {
        console.log('send email called with the following data');
				console.log(attachment);
        var nodemailerTransport = nodemailer.createTransport(sg(options));
    		var email = {
    		   from: 'Konverge Media <certificate@knvgmedia.com>',
    		   to: email,
    		   subject: subject,
    		   'h:Reply-To': 'certificate@knvgmedia.com',
    		   html: htmlData,
    		   attachments: [
						 {
							 path: attachment
							}
						]
    		};

    		nodemailerTransport.sendMail(email, function (err, info) {
    			if (err) {
            console.log('We have an error while sending email');
    				console.log(err);
    				return cb(err , null);
    			} else {
                    console.log('Email successfully sent');
    				console.log(info);
    				return cb(null , info);
    			}
    		});
    }
	};
}