/* UI PART BEGIN ------------------------------------------------------------ */
//configuration data
var mqtt = require('mqtt');
const TBHost = "demo.thingsboard.io"
var ACCESS_TOKEN = 'YbJ6xYgOhu1AnGpwql5E';

//internal variable
var mqtt_client_object;

function connect(callback)
{
	mqtt_client_object = mqtt.connect('mqtt://' + TBHost, {username: ACCESS_TOKEN});

	mqtt_client_object.on('connect', function () {
		console.log('Connected');
	})

	mqtt_client_object.on('message', function on_msg(topic, message){
			console.log('Received message:');
			console.log('request.topic: ' + topic);
			console.log('request.body: ' + message.toString());
			var requestId = topic.slice(('v1/devices/me' + topic).length);
			var messageData = JSON.parse(message.toString());
			callback(requestId, messageData);
	});
}

function subscribe(topic){
	mqtt_client_object.subscribe('v1/devices/me' + topic);
}

function publish(topic, data) {
	console.log('Sending message:');
	console.log('topic: ' + topic);
	console.log('body: ' + data.toString());
	mqtt_client_object.publish(topic, data);
}
/* UI PART END -------------------------------------------------------------- */

/* usage example */
var mytopic = '/rpc/response/';
var suscribeTopic = '/rpc/request/+';
var controlValue;
var realValue = 23;

function on_message(requestId, messageData) {
	 if (messageData.method === 'setValue') {
		controlValue = messageData.params;
		console.log('Going to set new control value: ' + controlValue);
	} else {
		publish('v1/devices/me' + mytopic + requestId, message);
	}
}

function publishTelemetry() {
	emulateTemperatureChanging();
	publish('v1/devices/me/telemetry', JSON.stringify({temperature: realValue}));
}

function emulateTemperatureChanging() {
	if(controlValue !== undefined) {
		if(controlValue >= realValue) {
			realValue += (Math.random() + (Math.abs(controlValue - realValue)/20));
		} else {
			realValue -= (Math.random() + (Math.abs(controlValue - realValue)/20));
		}
	}
}

function main() {
	connect(on_message);
	subscribe(suscribeTopic);
	setInterval(publishTelemetry, 1000);
}

main()
