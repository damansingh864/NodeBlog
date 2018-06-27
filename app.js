//We use express so we required the express modules
var express = require('express');   
var bodyParser = require('body-parser');
var fs = require('fs');
//var Busyboy = require('busyboy-body-parser');
var session = require('express-session');
var path = require('path');

const mongoose = require('mongoose');
var app = express();

app.set('view engine','ejs');
app.use(express.static('./public'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
mongoose.Promise = global.Promise;



app.set('trust proxy', 1); // trust first proxy
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 12000000 }}));

// Access the session as req.session

//Creating Connection
mongoose.connect('mongodb://localhost/OnlineBlog', {useMongoClient: true});

const Schema = mongoose.Schema;

const Login = new Schema({
    fullName: String,
    email: String,
    password:String,
    imageId: Schema.Types.Mixed,
    bio:String,
    BlogId:[Schema.Types.Mixed]
}); //new Schema so Schema is const Schema 
const Blogs = new Schema({

    CreatorId:Schema.Types.Mixed,
    CreatingDate:Date,
    tags:String,
    title:String,    
    featuresImage:Schema.Types.Mixed,
    Views:Number,
    content: {
        subtitle:String,
        caption:String,
        bodyModel: Schema.Types.Mixed
    }
    
});


var Logging =  mongoose.model('login',Login);
var Blogging = mongoose.model('blogs',Blogs);

//Mongoose Connection
mongoose.connection.once('open', function() {
    //gfs= Grid(mongoose.connection.db);
    console.log("Connection has been made, now make fireworks...");		

//Link to Home Page
app.get('/', function(req,res) {
      
    if(req.session.someAttribute) {                
        var someAttribute = req.session.someAttribute;      
        var email = req.session.email;                      
    } else {
        req.session.regenerate(function(err) {            
          });
    }    
    res.render('index',{someAttribute:req.session.someAttribute, userId:req.session.userId,Image:req.session.imageId});                
});

//Link to Getting Started
app.get('/GettingStarted', function(req,res) {
    res.render('GettingStarted');
});

app.get('/topic/:paramater', function(req,res) {
    var parms = req.params.paramater;      
    Blogging.find({tags:  { $regex : new RegExp(parms, "i") }  },function(err, user){        
            if(user){                
                var arr= [];
                 for(var i = 0 ; i<user.length;i++) {
                    arr.push(user[i].CreatorId);
                 }                             
                    Logging.find({_id:{$in:arr}}, function(err, user1){
                        if(user1) {                                                    
                            res.render("topic/technology.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, user:user,Image:req.session.imageId,name:parms,user1:user1});       
                        } else if (err) {

                        }
                    });                                    
            }
            else {
                
            }
        });                    
});

app.post("/signUp", (req, res,next) => {
    
    Logging.findOne({email: req.body.email}, function(err,user) {
        if(user) {                      
            res.send("Found");
            //    res.redirect('/GettingStarted');
                     
        } else {
            req.body.imageId = "/assets/images/login.png";
    
            var myData = new Logging(req.body);
            myData.save()
            .then(item => {     
    
                var sessData = req.session;
                sessData.someAttribute = myData.fullName;
                sessData.email = myData.email;
                sessData.userId = myData._id;
                sessData.imageId = myData.imageId;                                    
    
                res.send('/');
            })
                .catch(err => {
                res.status(400).send("unable to save to database");
            });
        }
    });
});


app.get("/self/:name", function(req,res) {
         
        Blogging.findOne({_id: req.params.name},function(err, user){
            if(err) {                
                err= "invalid password";
                res.send(err);
            }
            else if(user){
                var d = user;
                var a = user.content.bodyModel.dataIt;
                Logging.findOne({_id:user.CreatorId}, function(err,user1) {
                
                    var title = d["title"];
                    var artId = d["_id"];
                    var obj = {
                        title:title,
                        arti:artId
                    };                                                
                res.render("page1.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, daman:d,da:a,os:obj,Image:req.session.imageId,user1:user1});
            });
            }
            else {
                
                err="Invalid pass";
                //res.send(err);
            }
        });    
                    
});


app.get("/enter", function(req,res) {
    
    if(req.session.someAttribute) {
        res.render("enter.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, Image:req.session.imageId});        
    } else {
        res.redirect("/");
    }    
});



app.post("/endpoint", function(req,res,next) {          
    var blu = new Blogging(req.body);    
    
    blu.save()
    .then(item => {                                        
        res.send("/self/" +blu._id);            
            
    }).catch(err => {
    
        res.status(400).send("unable to save to database");
    });   
});


app.post("/update", function(req,res,next) {      
   Logging.findOneAndUpdate({_id:req.session.userId},{fullName:req.body.fullName,bio:req.body.bio,imageId:req.body.imageId})
   .then(function(){
       res.redirect('/profile');    
   });
});

app.get("/blog/:persons", (req,res) => {
    
        Blogging.find({CreatorId: req.params.persons},function(err, user){
            if(user){
                Logging.findOne({_id:req.params.persons}, function(err,user1) {
                
                var d = user;
                var a = user.content;              

                res.render("blog.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, user:user,Image:req.session.imageId,user1:user1});       
                });
            }
            else {                
                err="Invalid pass";
            
            }
        });    
    
});


app.get("/profile", (req,res) => {
    if(req.session.someAttribute) {
        Logging.findOne({_id: req.session.userId,email:req.session.email}, function(err, user){
            if(err) {

                err= "invalid password";                                
                res.status(500).send('Something broke!');
            }
            else if(user){
                var sessData = req.session;
                sessData.someAttribute = user.fullName;
                sessData.email = user.email;
                sessData.userId = user._id;
                
                res.render('profile.ejs',{someAttribute:req.session.someAttribute,email:req.session.email,image:user.imageId,bio:user.bio,userId:user._id,userName:user.fullName});        
            }
            else {
                                      
            }
        });                
    } else {
        res.redirect("/");
    }
    
});

app.post("/signIn", (req, res) => {     
    Logging.findOne({email: req.body.email, password: req.body.password}, function(err, user){
        if(err) {            
            err= "invalid password";            
            res.status(500).send('Something broke!')
        }
        else if(user){
            var sessData = req.session;
            sessData.someAttribute = user.fullName;
            sessData.email = user.email;
            sessData.userId = user._id;
            sessData.imageId = user.imageId;
            res.send("/");       
            
        }
        else {        
            res.send("Not Found");                       
        }        
    });        
});

    
app.get('/logout', function(req, res){             
    req.session.destroy(function (err) {
           res.redirect('/'); //Inside a callback… bulletproof!
    });  
});    

}).on("error",function(error) {
    console.log("Connection error",error);
});


app.listen(3000);