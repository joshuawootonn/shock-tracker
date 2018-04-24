const bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

var SendCharacteristic = require('./characteristics/send-characteristic');

var moment = require('moment');
var fs = require('fs');

var DEVICE_NAME = 'shockIOT';
var DEVICE_UUID = ['B8:27:EB:27:65:9B'];

var lastSeenDate = '2018-04-24';
var filedata = null;


var dateTimeCh = new BlenoCharacteristic({
    uuid: '0x2A08',
    properties: ['write'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x2A08'
        })
    ],

    onWriteRequest: function (data, offset, withoutResponse, callback) {
        console.log('date recieved: ' + data.toString());
        lastSeenDate = data.toString();

        callback(this.RESULT_SUCCESS);
    }

});

var latitudeCh = new BlenoCharacteristic ({
    uuid: '0x9999',
    properties: ['read'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x2AAE',
            value: 'latitude',
        })
    ],

    onReadRequest: function (offset, callback) {
        console.log('hello');
        console.log(readFile());
        readFile().then( function (resolve) {
            console.log(resolve);
            callback(this.RESULT_SUCCESS, Buffer.from(resolve, 'utf8'));
        });
        //            console.log(this.RESULT_SUCCESS);
  //          console.log(resolve);
    //        callback(this.RESULT_SUCCESS, Buffer.from(resolve, 'utf8'));
      //  });
    }
});

function readFile () {
    if ( !lastSeenDate ) {
        return Buffer.from('null', 'utf8');
    }
    
    var baseDir = '/home/pi/shock-tracker/device/sessions/';
    var date = moment(lastSeenDate, 'YYYY-MM-DD');

    new Promise( function(resolve, reject) {
        fs.readdir(baseDir, function (err, fnames) {
            if (err) {
                console.log(err);
            }
            resolve(fnames);
        });
    })
    .then( function (filenames) {
        console.log('filenames: ' + filenames);
        return new Promise(function (resolve, reject) {
            filenames.forEach( function (file) {
                fs.readFile(baseDir + file, 'utf-8', function (err, data) {
                    if (err) {
                        console.log(err);
                    }

                    var json = JSON.parse(data);
                    console.log(json.start_date);
                    if ( moment(json.start_date, 'YYYY-MM-DD').isSameOrAfter(date) ) {
                        resolve(data);
                    }
                });
            });
        });
    })
}


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
