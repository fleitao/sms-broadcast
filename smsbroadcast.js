var express = require('express');
var fs = require("fs");
var request = require('request');


// ============================== Restcomm Account Details ============================== 

  var rc_server         = "cloud.restcomm.com";
  var rc_restCommBase   = "restcomm";
  var rc_accountBase    = "2012-04-24/Accounts";
  var rc_accountSid     = "<<your_restcomm_account_sid>>";
  var rc_accountToken   = "<<your_restcomm_account_token>>";
  var rc_application    = "SMS/Messages";
  
  var rc_path =  rc_restCommBase + '/' 
                + rc_accountBase + '/'  
                + rc_accountSid + '/' 
                + rc_application;

const serviceName       = "ECHO"

//console.log("[LOG] DEBUG - Restcomm API Path Loaded: %s",rc_path);


// ============================== RESTful API Creation ============================== 

var rest = express();



// ================= RESTful POST API ADD SUBSCRIBER & SEND MESSAGE ================= 


// POST - Add User: https://<<my_api_url>>/smsbroadcast/send?number=123456789&newUser=true
// POST - Send Message: https://<<my_api_url>>/smsbroadcast/send?number=123456789&message=testmessage

// RETURNS:
//  - 0: Not Authorised
//  - 1: Message Broadcasted
//  - 2: Subscription Successful
//  - 3: User Exists

rest.get('/smsbroadcast/send', function (req, res) {
    

    // get timestamp
    var now = new Date();
    var timestamp = 'utc|' + now.getUTCFullYear() 
                           + '/' + (now.getUTCMonth()+1)
                           + '/' + now.getUTCDate()
                           + '|' + now.getHours()
                           + ':' + now.getMinutes();


    // console.log("[%s] DEBUG - Request Content: %s",timestamp,req);



   // First read existing users.
   fs.readFile( "<<path>>/smsbroadcast.json", 'utf8', function (err, data) {
       if (err) {
            return console.error(err.message);
         }
    
        var obj = {
           subscribers: []
        };

        obj = JSON.parse(data); 

        //define SMS origin number (to add)
        var originNumber = req.query.number;
        var newUser = req.query.newUser;
        var listAll = req.query.listAll;


        // if newUser = true, then it's a new subscription attempt
        if (newUser=="true"){
    
            //  double-check if number exists
            if(obj.hasOwnProperty(originNumber)){
                console.log("[%s] SERVER - Double subscription attempt: %s - %s",timestamp, originNumber);
                res.end('3');
            } else{
            
                //add number
                obj[originNumber] = {number:originNumber,created:timestamp};
        
                var json = JSON.stringify(obj);
        
               fs.writeFile("<<path>>smsbroadcast.json", json, 'utf8', function (err, data) {
                    if (err) {
                        return console.error(err.message);
                     }
                    
                    console.log("[%s] SERVER - new subscriber added: %s ",timestamp,originNumber);
                    
                    //res.end('Subscription Successful!');
                    res.end('2');
                });
            }


        } else if(listAll=="true"){
            
            fs.readFile( "<<path>>/smsbroadcast.json", 'utf8', function (err, data) {
                if (err) {
                    return console.error(err.message);
                }
            
            console.log("[%s] SERVER - listall successful", timestamp);
            
            res.end( data );

            });
            
        // otherwise is a existing user and we have a message to broadcast
        } else {         
        
            //define sms text message to send
            var receivedMessage = req.query.message;

            
            //  double-check if number exists
            if(obj.hasOwnProperty(originNumber)){
                
                //console.log("[%s] DEBUG - subscriber exist: %s",timestamp,originNumber);
                //console.log("[%s] DEBUG - message to be sent is: %s",timestamp,receivedMessage);
            

                // walk through all the json file and send the messages
                for(var attributename in obj){
                    
                    var options = {
                        url: 'https://' + rc_server + '/' + rc_path,
                        auth: {
                            username: rc_accountSid,
                            password: rc_accountToken
                        },
                        form: {
                            To: attributename,
                            From: serviceName,    // I want the origin to be a string
                            Body: receivedMessage
                        } 
                    };
                    
                    request.post(options,function(err,resp,body){
                        if (err) { return console.log(err); }
                            // console.log("[%s] DEBUG - Message Sent - Report Received:",timestamp);
                            // console.log(body);
                    });                    
                        
                    // console.log("[%s] DEBUG - Message Sent to: %s",timestamp,attributename);
                }
                
                //res.end('Message Broadcasted!');
                res.end('1');
                    
            } else {
                
                //console.log("[LOG] DEBUG - subscriber not authorised: %s",originNumber);
                
                res.end('0');
            }
        }

    });
})



// ============================== RESTful API DELETE SUBSCRIBER ============================== 

// DELETE - https://<<my_api_url>>/smsbroadcast/delete?number=123456789

// RETURNS:
//  - 1: User Deleted


rest.delete('/smsbroadcast/delete', function (req, res) {
    
        // get timestamp
    var now = new Date();
    var timestamp = 'utc|' + now.getUTCFullYear() 
                       + '/' + (now.getUTCMonth()+1)
                       + '/' + now.getUTCDate()
                       + '|' + now.getHours()
                       + ':' + now.getMinutes();

    
    fs.readFile( "<<path>>/smsbroadcast.json", 'utf8', function (err, data) {
        if (err) {
            return console.error(err.message);
         }
        
        var obj = JSON.parse(data);

        //define sms origin number
        var originNumber = req.query.number;

        // delete number
        delete obj[originNumber];
        
        var json = JSON.stringify(obj); //convert it back to json

       fs.writeFile("<<path>>/smsbroadcast.json", json, 'utf8', function (err, data) {
            if (err) {
                return console.error(err.message);
             }
            console.log("[%s] SERVER - subscriber deleted: %s",timestamp,originNumber);
            // console.log("[%s] SERVER - new table: %s", timestamp,json);
            
            res.end('1');
        });    
    })
})



// ============================== RESTful Server Start ============================== 

var server = rest.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("[LOG] SERVER - SMS Broadcast Application listening at http://%s:%s", host, port)

})
