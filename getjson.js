var express = require('express');
var fs = require("fs");

var app = express();

app.get('/',function(request,response)
{
    fs.readFile(__dirname+"/"+"users.json","UTF8",function(err,dataString){
        if(err)
        {
            console.log("omgg, cannot read file");

        }
        // console.log(dataString);
        response.end(dataString);

    });
});

var server = app.listen(3000,function()
{
   var host = server.address().address
   var port = server.address.port
   console.log("server listeing at http://"+host+"port "+port);  
})


