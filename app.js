var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose= require('mongoose');
let session = require('express-session');
var hbs = require('express-handlebars');
const dotenv = require('dotenv')


var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'user-layout',
layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials',
helpers:{
  format:function(date){
    newdate=date.toUTCString()
     return newdate.slice(0,16)
  },
  Inc1:function(context){
    return context + 1
  },
   eq: function (v1,v2) {return v1 === v2;},
   gt: function (v1,v2) {return v1 > v2;},
   ne: function (v1, v2) { return v1 !== v2; },
   lt: function (v1, v2) { return v1 < v2; },
   lte: function (v1, v2) { return v1 <= v2; },
   gte: function (v1, v2) { return v1 >= v2; },
   and: function (v1, v2) { return v1 && v2; },
   or: function (v1, v2) { return v1 || v2; },
}}))

// Mongoose Connection
mongoose.connect(process.env.DATABASE_URL).then(()=>{
  console.log('DB connected Successfuly')
}).catch((err)=>{
   console.log('somthing wrong',err)
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "BUY001",resave: true,  saveUninitialized: true, cookie:{maxAge: 1000 * 60 * 60 * 24 }}));

app.use((req,res,next)=>{
  res.set("Cache-Control","no-store");
  next();
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('404');
});

module.exports = app;
