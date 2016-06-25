//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var cors  = require('cors');
var path = require('path');

//Instantiate a new express app
var app = express();

//set the model source
var dbResource = require('./app_server/models/dbResource')('digify' , {} , app);

//initialize database
dbResource.initColls(function(){
	//Email client
	var emailClient = require('./app_server/controllers/emailClient')();

	//Digifybytes Certificate client
	var certClient = require('./app_server/controllers/certClient')();

	//
	var Templates  = dbResource.model('Templates');

	//Configure the express app
	app.set('view cache' , true);
  app.set('views' , 'views');
  app.set('view engine' , 'ejs');
	app.set('port' , process.env.PORT || 4000);

  //configure functions that matches all routes
	app.use(cors({credentials: true, origin: true}));
	app.use(compression({threshold:1}));
	app.use(methodOverride('_method'));

	//configure router to use cookie-parser  ,body-parser
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(cookieParser());
	app.use(session({resave:true , secret:'this string' , saveUninitialized:true}));

	//configure express static
  app.use(express.static(path.join(__dirname , 'public')));

	//Certificate mailer routeEvents
	Templates.find({} , {_id:0 , categoryName:1}).toArray(function(err , results){
		   if(err){
				   throw new Error('Unable to get roles from db');
			 }
			 else{
				   for(var i=0; i<results.length; i++){
						   results[i] = results[i].categoryName;
					 }
				   app.use('/digifyBytes' , require('./routes/digifybytes')(emailClient , certClient, dbResource , results));
			 }
	});


	//handle errors using custom or 3rd party middle-wares
	app.use(errorHandler());

	//Start the main Express server
  app.listen(app.get('port'), function() {
		  console.log("Listening on " + app.get('port'));
  });
});
