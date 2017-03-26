var nodemailer =  require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: 'key-3b6de9d34d16fda2f5694bf57e69ba8c',
    domain: 'mg.automaticpallet.com'
  }
}

module.exports = function() {
	return {
		sendEmail: (htmlData, email, subject, attachment,  cb) => {
        console.log('send email called with the following data');
        console.log(htmlData, email, subject, attachment);
        var nodemailerMailgun = nodemailer.createTransport(mg(auth));
    		var options = {
    		   from: 'Konverge Media <certificate@knvgmedia.com>',
    		   to: email,
    		   subject: subject,
    		   'h:Reply-To': 'certificate@knvgmedia.com',
    		   html: htmlData,
    		   attachment: attachment
    		};

    		nodemailerMailgun.sendMail(options, function (err, info) {
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