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
			spooky.then([{
				baseUrl: baseUrl,
				firstname:person.firstname,
				lastname: person.lastname,
				role: person.role,
				DNF:dirNamedFile,
				DIF:dirImgFile
			}, function () {
				this.viewport(1366, 768, function() {
					this.thenOpen(baseUrl+'digifyBytes/viewCert?'+'firstname='+firstname+'&'+'lastname='+lastname+'&'+'role='+role+'&'+'auth='+true);
					this.then(function() {
						this.waitForSelector('div.cert' , function() {
							this.capture(DNF+'.pdf' , undefined , {quality:100});
							this.capture(DIF+'.jpg' , undefined , {quality:50});
							this.emit('done' , 'screenshot captured');
						}, function(){
								this.emit('error' , 'screenshot captured');
						});
					});
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
