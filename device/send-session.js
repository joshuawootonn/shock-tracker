var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var SendCharacteristic = require('./characteristics/send-characteristic');
var Descriptor = bleno.Descriptor;

var DEVICE_NAME = 'shockIOT';
var DEVICE_UUID = ['B8:27:EB:27:65:9B'];

bleno.on('stateChange', function(state) {
	console.log('on -> stateChange: ' + state);

	if (state == 'poweredOn') {
		bleno.startAdvertising(DEVICE_NAME, DEVICE_UUID);
	} else {
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', function(error) {
	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

	if (!error) {
		bleno.setServices([
			new BlenoPrimaryService({
				uuid: DEVICE_UUID[0],
				characteristics: [
					new SendCharacteristic()
				]
			})
		]);
	}
});

bleno.on('accept', function(clientAddr) {
    console.log('on -> accept client address: ' + clientAddr);

});
