var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var EchoCharacteristic = require('./characteristics/echo-characteristic');
var Descriptor = bleno.Descriptor;

var devicename = 'shockIOT';
var deviceuuid = ['B8:27:EB:27:65:9B'];

bleno.on('stateChange', function(state) {
	console.log('on -> stateChange: ' + state);

	if (state == 'poweredOn') {
		bleno.startAdvertising(devicename, deviceuuid);
	} else {
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', function(error) {
	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

	if (!error) {
		bleno.setServices([
			new BlenoPrimaryService({
				uuid: deviceuuid[0],
				characteristics: [
					new EchoCharacteristic()
				]
			})
		]);
	}
});

bleno.on('accept', function(clientAddr) {
    console.log('on -> accept client address: ' + clientAddr);    
});
