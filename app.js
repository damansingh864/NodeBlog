//We use express so we required the express modules
var express = require('express');   
var bodyParser = require('body-parser');
var fs = require('fs');
//var Busyboy = require('busyboy-body-parser');
var multer = require("multer");
var session = require('express-session');
var path = require('path');

const mongoose = require('mongoose');
//var blogController = require('./controllers/blogController');
var app = express();

app.set('view engine','ejs');
app.use(express.static('./public'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
mongoose.Promise = global.Promise;

//let Grid = require("gridfs-stream");
/*
app.use(session({ secret: 'this-is-a-secret-token',
            resave: false,
            saveUninitialized: true,
             cookie: { secure:true, maxAge: 60000 }}));
*/

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
           /* {htmlContent: [Schema.Types.Mixed]
            /*[{
                tag:String,
                tagContent:String,
                isSubtitle:Boolean,
                isFigure:Boolean,
                figures:{
                    imageId: String,
                    contentType: String
                    //imageId:String 
                }
                
            }]*/
            /*paragraphs: [{
                name:Number,
                type:Number,
                text:String,
                markups:[],
                layout:Number,
                metadata:{
                    id:Number,
                    originalHeight:Number,
                    originalWidth:Number,
                    isFeatured:Boolean
                }
            }],
            sections:[
                {
                    name:Number,
                    startIndex:Number
                }, 
                {
                    name:Number,
                    startIndex:Number
                }
            ],
            postDisplay: {coverless:Boolean},
            metaDescription:String        
        }
            */
    
        /*virtuals : {
            wordCounts:Number,
            imageCount:Number,
            readingTime:Number,
            subtitle:String,
            tags:[]
        }*/
    }
    
    //Schema.Types.Mixed, {strict: false}
         /*  name:String,
        title:String*/

});
//Blogs.index({'$**': 'text'});

var Logging =  mongoose.model('login',Login);
var Blogging = mongoose.model('blogs',Blogs);
//Blogs.index({'title': 'text'});


//Grid.mongo = mongoose.mongo;
//let gfs;

//Mongoose Connection
mongoose.connection.once('open', function() {
    //gfs= Grid(mongoose.connection.db);
    console.log("Connection has been made, now make fireworks...");		



//Link to Home Page
app.get('/', function(req,res) {
    if(req.session.someAttribute) {
        var someAttribute = req.session.someAttribute;      
        var email = req.session.email;  
        console.log(email);
        console.log(someAttribute);                
    } else {
        req.session.regenerate(function(err) {
            // will have a new session here
          })
    }
    //res.send(`This will print the attribute I set earlier: ${someAttribute}`);
  
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
                            console.log("Dmaan");
                        }
                    });
                                    
            }
            else {
                console.log('Invalid Password');
                err="Invalid pass";
                
            }
        });    
            
    
});

app.post("/signUp", (req, res,next) => {
    console.log("Working");
    Logging.findOne({email: req.body.email}, function(err,user) {
        if(user) {                      
                res.redirect('/GettingStarted');
            //res.render('/GettingStarted',{err:"User Already Exists"});
//            return res.status(403).send("Unauthorized");            
        } else {
            req.body.imageId = "/assets/images/login.png";
            console.log(req.body);
            var myData = new Logging(req.body);
            myData.save()
            .then(item => {     
                console.log("wo");
                var sessData = req.session;
                sessData.someAttribute = myData.fullName;
                sessData.email = myData.email;
                sessData.userId = myData._id;
                sessData.imageId = myData.imageId;                                    
                console.log(sessData.userId + " " +  sessData.email);
                res.redirect('/');
            })
                .catch(err => {
                res.status(400).send("unable to save to database");
            });
        }
    });
});


console.log(Logging.findOne({email:'damansingh864@gmail.com'}, function(err,user) {
    if(err) {
        console.log(err);
    } else if(user) {      
        console.log(user.fullName);
    }
}));

app.get("/self/:name", function(req,res) {
    console.log(req.session.someAttribute);         
    console.log( req.session.email);
    console.log(req.session.userId);
         
        Blogging.findOne({_id: req.params.name},function(err, user){
            if(err) {
                console.log(err);
                err= "invalid password";
                res.send(err);
            }
            else if(user){
                var d = user;
                var a = user.content.bodyModel.dataIt;
                /* title:String,
    content: { subtitle:String, caption:String,bodyModel: {
            htmlContent: [{ tag:String,tagContent:String,isSubtitle:Boolean,
                isFigure:Boolean,figures:{imageId: String,
                    contentType: String
                    //imageId:String 
                }
                */                    
                Logging.findOne({_id:user.CreatorId}, function(err,user1) {
                
                    var title = d["title"];
                    var artId = d["_id"];
                    var obj = {
                        title:title,
                        arti:artId
                    }                                                
                res.render("page1.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, daman:d,da:a,os:obj,Image:req.session.imageId,user1:user1});
            });
            }
            else {
                console.log('Invalid Password');
                err="Invalid pass";
                //res.send(err);
            }
        });    
        
        //alert("ok");
    
});


app.get("/enter", function(req,res) {
    console.log(req.session.someAttribute);
    console.log(req.session.userId);
    if(req.session.someAttribute) {
        res.render("enter.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, Image:req.session.imageId});
        //var ad = req.session.someAttribute.trim().toLowerCase();
        //ad = ad.replace(/\s+/g,'');
        //console.log('@'+ad);
        //alert("ok");
    } else {
        res.redirect("/");
    }
    
});

const Storage = multer.diskStorage({
    destination: './public/assets/uploads/',
    filename: function(req,file,callback) {
        callback(null,file.fieldname + '-' + "daman" +  path.extname(file.originalname));
    }
});

//Init upload
const upload = multer({
    storage: Storage
}).any('imgs');

app.post("/endpoint", function(req,res,next) {
     
     //console.log(req.body);
    var blu = new Blogging(req.body);    
    console.log("this ge");
    blu.save()
    .then(item => {
        
            //console.log(blu);
            console.log("woring");
            /*upload(req,res,(err)=> {
                if(err) {
                    //res.render('index',{msg:err});                    
                    console.log(err);
                } else {                    

                    console.log(req.file);          
                    if(req.file==undefined) {
                        i++;
                    } else {
                        req.file.filename = blu._id + i;
                        console.log(req.file.filename);
                        console.log(req.file);
                    }
                    res.send('test');                    

                }
            });*/
           /* for(var i =0;i<req.body.content.bodyModel.htmlContent.length;i++) {
                if(req.body.content.bodyModel.htmlContent[i].isFigure) {
                    var o = req.body.content.bodyModel.htmlContent[i].figures.imageId;
                    o = fs.readFileSync(o);
                }
            }*/            
            console.log("Dmanassdasdasdas");
            console.log(blu._id);
            res.send("/self/" +blu._id);
            
            
    }).catch(err => {
        console.log(err);
        res.status(400).send("unable to save to database");
        });
   /* if(req.session.someAttribute) {
        var aData = new Blogging(req.body);
        aData.save(function(err,aData) {
            if(err){
                console.log(err);
                return handleError(err);            
            }
             res.redirect('/');
            console.log(aData);
        });
        console.log("wo");           
        res.redirect('/');
    } else {
        res.redirect("/");
    }
*/
});


app.post("/update", function(req,res,next) {      
   Logging.findOneAndUpdate({_id:req.session.userId},{fullName:req.body.fullName,bio:req.body.bio,imageId:req.body.imageId})
   .then(function(){
       res.redirect('/profile');
       //res.render("profile.ejs",{someAttribute:req.session.someAttribute,email:req.session.email,image:user.imageId,bio:user.bio});
       
   });

});
/*
app.get("/search", (req,res) => {
    console.log(req.param.search);
    

    Blogging.find( { $text: { $search: 'dman', $language: 'en' } }, function(err, done) {
        if(err) {
            console.log(err);
            console.log("Daman");   
        } else if(done) {
            console.log(done);
            console.log("done");
        }
    });

    //res.send(req.query);
});
*/
app.get("/blog/:persons", (req,res) => {
    console.log(req.session.someAttribute);         
    console.log( req.session.email);
    console.log(req.session.userId);
    
        Blogging.find({CreatorId: req.params.persons},function(err, user){
            if(user){
                Logging.findOne({_id:req.params.persons}, function(err,user1) {
                    console.log(user1);
                
                var d = user;
                var a = user.content;              
                for(var obj in a) {
                    console.log(a[obj]);
                    console.log(daman);
                }                
                
                //res.send(user[0].content.bodyModel.dataIt);

                /*
                    var title = d["title"];
                    var artId = d["_id"];
                    var obj = {
                        title:title,
                        arti:artId
                    }                                             */   
                res.render("blog.ejs",{someAttribute:req.session.someAttribute, userId:req.session.userId, user:user,Image:req.session.imageId,user1:user1});       
                });
            }
            else {
                console.log('Invalid Password');
                err="Invalid pass";
                //res.send(err);
            }
        });    
        
        //alert("ok");
    
});


app.get("/profile", (req,res) => {
    if(req.session.someAttribute) {
        Logging.findOne({_id: req.session.userId,email:req.session.email}, function(err, user){
            if(err) {
                console.log(err);
                err= "invalid password";
                
                
                res.status(500).send('Something broke!')
            }
            else if(user){
                var sessData = req.session;
                sessData.someAttribute = user.fullName;
                sessData.email = user.email;
                sessData.userId = user._id;
                
                res.render('profile.ejs',{someAttribute:req.session.someAttribute,email:req.session.email,image:user.imageId,bio:user.bio,userId:user._id});        
            }
            else {
                console.log('Invalid Password');
                //err="Invalid pass";
                //res.send(err);
               
            }
        });        
        //alert("ok");
    } else {
        res.redirect("/");
    }
    
});

app.post("/signIn", (req, res) => {    
    
    Logging.findOne({email: req.body.email, password: req.body.password}, function(err, user){
        if(err) {
            console.log(err);
            err= "invalid password";''
            
            res.status(500).send('Something broke!')
        }
        else if(user){
            var sessData = req.session;
            sessData.someAttribute = user.fullName;
            sessData.email = user.email;
            sessData.userId = user._id;
            sessData.imageId = user.imageId;
            res.redirect('/');
        }
        else {
            console.log('Invalid Password');
            res.render("GettingStarted.ejs",{err:"NotFound"});
            //return res.send({err:"Derr"});
            //err="Invalid pass";
            //res.send(err);
           
        }        
    });    
    
});

    
app.get('/logout', function(req, res){    
   // cookie = req.cookies;
      
    req.session.destroy(function (err) {
           res.redirect('/'); //Inside a callback… bulletproof!
       });
  
    //req.session.destroy(function(err){
        // cannot access session here
        //console.log(err);
      //});
    //req.session.destroy();
    //res.redirect('/');
});
    /*.then(item => {     
       console.log("wo");
       var sessData = req.session;
       sessData.someAttribute = myData.fullName;
        res.redirect('/');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });*/

}).on("error",function(error) {
    console.log("Connection error",error);
});


app.listen(3000);