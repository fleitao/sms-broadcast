# sms-broadcast-rc
Simple SMS broadcast service with self self sign-up (Node.JS, Python and Restcomm)

// Author: 
// Filipe Leitão (contact@fleitao.org)

# Description:
This is an SMS Broadcast/Echo service with a service subscriber list to which users can interact using SMS. 
The service has a (SMS enabled) number associated with it and every short-message sent to that number will be 
broadcasted to the list. A subscriber can manage its participation in the broadcast list through the same number.

# Usage:
1) Subscribing to the list: user texts 'subscribe' or 'Subscribe';
2) Unsubscribing to the list: user texts 'unsubscribe' or 'Unubscribe';
3) Broadcasting message: user texts anything but 'subscribe', 'Subscribe', 'unsubscribe' or 'Unubscribe';

Only subscribed users can text, otherwise there will be a message returned: 

"ECHO  Says: Hey, who are you? I don't know you. If you want to become part of the ECHO Broadcast list just type 
'subscribe' and I'll take you by the hand."

Or if you try to subscribe twice you'll get the short-message back:

"ECHO  Says: Looks like you trying to register a number we already know. If you think that is a mistake, 
you can always opt out by typing 'unsubscribe'."

# Service Architecture:
The service is split into three components: 
- FrontEnd-SMS-Broadcast.zip / Restcomm Visual Designer (RVD) for the front-end and SMS menus interaction;
- smsbroadcast.js / Node.JS middleware between Restcomm and the subscribing list. Where all SMS service logic and 
interactions with Restcomm  for SMS broadcast are created;
- smsbroadcast.json / JSON file that serves as subscriber list to the service; 

Please note that to execute this application you'll need a Restcomm account and a SMS number associated to the application.
You can get a free Restcomm account using the following link: https://cloud.restcomm.com/#/signup
In Restcomm you'll find instructions to get a number or use an existing number of yours.
