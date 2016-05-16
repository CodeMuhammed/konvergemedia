//import spookyjs
var Spooky = require('spooky');
var path = require('path');
var baseUrl = process.env.NODE_ENV == 'production'? 'http://digifyBytes.herokuapp.com/' : 'http://localhost:4000/';
module.exports = function(){
	//
	function initSpooky(person, dirNamedFile, dirImgFile , cb){
		var spooky = new Spooky({
			child: {
				transport: 'http'
			},
			casper: {
				logLevel: 'debug',
				verbose: true
			}
		}, function (err) {
			if (err) {
				e = new Error('Failed to initialize SpookyJS');
				e.details = err;
				throw e;
			}
			console.log('getting cert');
			spooky.start();
			spooky.then(function () {
				this.viewport(1366, 768, function() {

				});
			});
			spooky.thenOpen(baseUrl+'digifyBytes/viewCert?'+'firstname='+person.firstname+'&'+'lastname='+person.lastname+'&'+'role='+person.role);

			spooky.then([{DNF:dirNamedFile , DIF:dirImgFile} , function(){
				this.waitForSelector('div.cert' , function(){
				    this.capture(DNF+'.pdf');
					  this.capture(DIF+'.jpg');
				    this.emit('done' , 'screenshot captured');
			    } , function(){
						 this.emit('error' , 'screenshot captured');
					});
			}]);

			spooky.run();
		});

		spooky.on('error', function (e, stack) {
			console.error('this '+e);
			if (stack) {
				console.log('this here '+stack);
			}
      console.log('Here');
			return cb(stack||e , null);
		});

		spooky.on('done', function (status) {
			return cb(null , status);
		});

		spooky.on('console', function (line) {
			console.log(line);
		});
	}

	//
	function getCert(person, dirNamedFile , dirImgFile ,  cb){
		initSpooky(person, dirNamedFile , dirImgFile , function(err , status){
			if(err){
				return cb(err , null);
			}
			else{
				return cb(null , dirNamedFile+'.pdf' , dirImgFile+'.jpg');
			}
		});
	}

	//
    return {
	    getCert : getCert
	};
}
