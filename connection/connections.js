const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/OnlineBlog', {useMongoClient: true});

mongoose.connection.once('open', function() {
    console.log("Connection has been made, now make fireworks...");		
 }).on("error",function(error) {
    Console.log("Connection error",error);
});