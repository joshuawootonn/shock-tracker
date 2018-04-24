const bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

var SendCharacteristic = require('./characteristics/send-characteristic');

var DEVICE_NAME = 'shockIOT';
var DEVICE_UUID = ['B8:27:EB:27:65:9B'];

var lastSeenDate = null;
var filedata = null;


var dateTimeCh = new BlenoCharacteristic({
    uuid: '0x2A08',
    properties: [ 'write' ],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x2A08'
        })
    ],

    onWriteRequest: function(data, offset, withoutResponse, callback) {
        console.log('data: ' + data.toString());

        callback(this.RESULT_SUCCESS);
    }

});

var latitudeCh = new BlenoCharacteristic({
    uuid: '0x2AAE',
    properites: [ 'read' ],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x2AAE',
            value = readFile()
        })
    ]
});

(function readFile() {
    if ( !lastSeenDate ) {
        return Buffer.from('null', 'utf8');
    }

    var baseDir = '/home/pi/shock-tracker/device/sessions/';
    var date = moment(lastSeenDate, 'YYYY-MM-DD HH:mm:ss');
    var ch = 'z';

    while (1) {
        fs.readFile( baseDir + date.format('YYYY-MM-DD') + ch, (err, data) => {
            if (!err) {
                return Buffer.from(data, 'utf8');
            }
        });

        if (ch != 'a') {
            ch = String.fromCharCode(ch.charCodeAt(0) - 1);
        } else {
            date = moment(date, 'YYYY-MM-DD HH:mm:ss').subtract({ hours:24 });
            ch = 'z';
        }
    }
})();


bleno.on('stateChange', function(state) {
	console.log('on -> stateChange: ' + state);

	if (state == 'poweredOn') {
		bleno.startAdvertising(DEVICE_NAME, DEVICE_UUID);
	} else {
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', function(error) {
    console.log("advertising start");
    
    if (!error) {

        bleno.setServices([
            new BlenoPrimaryService({
                uuid: '808A',
                characteristics: [ dateTimeCh ]
            }),
            new BlenoPrimaryService({
                uuid:'FFFF',
                characteristics: [ latitudeCh ]
            })
        ]);
    }
});

//bleno.on('advertisingStart', function(error) {
//	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
//
//	if (!error) {
//		bleno.setServices([
//			new BlenoPrimaryService({
//				uuid: DEVICE_UUID[0],
//				characteristics: [
//					new SendCharacteristic()
//				]			}),
//           new BlenoPrimaryService({
//               uuid: '0x1101',
//                characteristics: [
//                    new SendCharacteristic()
//                ]
//            })
//		]);
//	}
//});

bleno.on('accept', function(clientAddr) {
    console.log('on -> accept client address: ' + clientAddr);

});

bleno.on('disconnect', function(clientAddr) {
    console.log('disconnected from ' + clientAddr);
});

bleno.on('advertisingStop', function() {
    console.log('advertising stop');
});
