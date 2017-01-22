'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'test-bot-mariachiio') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging

    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        if (event.message && event.message.text == 'Hola') {
            let text = event.message.text
            sendTextMessage(sender, "Buen día")
            sendTextMessage(sender, "¿En qué puedo ayudarte?")
        }
        else if (event.message && event.message.text == 'Quiero saber mi ruta al trabajo') {
            let text = event.message.text
            sendTextMessage(sender, "Tu destino es el siguiente")
            sendTextMessage(sender, "https://www.google.com.mx/maps/dir/19.402931, -99.166555/19.4344717,-99.1617392/")
        }
        else if (event.message && event.message.text == 'Gracias') {
            let text = event.message.text
            sendTextMessage(sender, "No hay de qué")
        }
        else if (event.message && event.message.text == 'Auxilio' || event.message.text == 'A' || event.message.text == 'a') {
            var senderID = event.sender.id;
            let text = event.message.text
            sendButtonMessage(senderID)
        }
        else if (event.message && event.message.text == 'Comunicame con el supervisor') {
            var senderID = event.sender.id;
            let text = event.message.text
            sendButtonMessage1(senderID)
        }
        else if (event.message && event.message.text == 'Cuál es mi ruta?') {
        	sendGenericMessage(sender);
        }
        else {
            sendTextMessage(sender, "No te entiendo")
        }
    }
    res.sendStatus(200)
})
//https://www.google.com.mx/maps/dir/25.6414205,-100.3220598/25.586760,-100.257281/
//https://www.google.com.mx/maps/dir/25.6414205,-100.3220598/25.500974,-100.191265/


function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "LLAMADA DE AUXILIO",
          buttons:[{
            type: "phone_number",
            title: "Call Phone Number",
            payload: "5534592414"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendButtonMessage1(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Supervisor",
          buttons:[{
            type: "phone_number",
            title: "Call Phone Number"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ruta a primera zona de descanso",
                    "subtitle": "",
                    "image_url": "http://download.seaicons.com/icons/scafer31000/bubble-circle-3/1024/Maps-icon.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.google.com.mx/maps/dir/25.6414205,-100.3220598/25.586760,-100.257281/",
                        "title": "Mapa"
                    }],
                }, {
                    "title": "Ruta a segunda zona de descanso",
                    "subtitle": "",
                    "image_url": "http://download.seaicons.com/icons/scafer31000/bubble-circle-3/1024/Maps-icon.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.google.com.mx/maps/dir/25.6414205,-100.3220598/25.500974,-100.191265/",
                        "title": "Mapa"
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token:token},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}

const token = process.env.FB_PAGE_ACCESS_TOKEN_TEST_BOT