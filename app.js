
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , crypto = require('crypto')
  , redis = require('redis')
  , config = require('./config');

 

/*
 * Redis client setup
 */
 
var client = redis.createClient(config.redis.port, config.redis.host, {parser: 'javascript'});
var RedisStore = require('connect-redis')(express),
    // MemoryStore = express.session.MemoryStore,
    sessionStore = module.exports.sessionStore = new RedisStore({
    	client: client,
    	pass: config.redis.pass,
    	prefix: 'session:'});


/*
 * crypt　authentication function
 */    	
function pass(pass) {
	return crypto.createHash('sha1').update(pass).digest('hex');
}


/*
 * App configuration
 */  
  
var app = express();


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret'));
  app.use(express.session({
    store: sessionStore
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/*
 * Routes
 */  
 
app.get('/', routes.index);

app.get('/admin', function(req, res) {
  res.send('<form method="POST" action="/admin">'
           + '<input type="text" name="user"/>'
           + '<input type="password" name="pass"/>'
           + '<input type="submit" value="ok"/>'
           + '</form>');
});

app.post('/admin', function(req, res) {
  req.session.admin = false;
  if (req.body.user === config.admin.user &&
      pass(req.body.pass) === config.admin.pass) {
    req.session.admin = true;
  }
  res.redirect('/');
});


module.exports.app = http.createServer(app).listen(3000);
module.exports.sessionStore = sessionStore;
