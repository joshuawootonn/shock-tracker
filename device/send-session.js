const bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

var SendCharacteristic = require('./characteristics/send-characteristic');

var moment = require('moment');
var fs = require('fs');

var DEVICE_NAME = 'shockIOT';
var DEVICE_UUID = ['B8:27:EB:27:65:9B'];

var lastSeenDate = '2018-04-23 01:23:45';
var filedata = null;
var dataTotalSize = 0;


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

var transferCh = new BlenoCharacteristic ({
    uuid: '0x9999',
    properties: ['read'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x2AAE',
            value: 'latitude',
        })
    ],

    onReadRequest: function (offset, callback) {

        try {
            if ( filedata == null ) {
                console.log('reading new file');
                //filedata = readFile();
                filedata = 'aaaaaaaaaaaaaabbbbbbbbbbbbbbbbbccccccccccccccccdddddddddddddddddddeeeeeeeeeeeeeeeeefffffffffffffffffffggggggggggggggg';
                dataTotalSize = filedata.length;
            } else if ( filedata == '' ) {
                console.log('####################');
                console.log('end of message: DONE');
                filedata = null;
                callback(this.RESULT_SUCCESS, Buffer.from('DONE'));
                return;
            } 


            var response = Buffer.from(filedata.slice(0, 20));
            filedata = filedata.slice(20);

            dataTotalSize = dataTotalSize - 20;

            console.log('sending data: ' + response + '        ' + dataTotalSize + ' characters left');
            callback(this.RESULT_SUCCESS, response);

//        try {
//            var data = readFile();
//            console.log('sending data:' + data);
//            //var slice = data.slice(0,22);
//            callback(this.RESULT_SUCCESS, Buffer.from('abcdefghijklmnopqrst'));
        } catch (e) {
            console.log("## ERROR ##");
            console.log(e);
        }
    }
});

function readFile () {
    var result = "";

    if ( !lastSeenDate ) {
        console.log("!lastSeenDate");
        return Buffer.from('null', 'utf8');
    }
    
    var sessionDir = '/home/pi/shock-tracker/device/sessions/';
    var date = moment(lastSeenDate, 'YYYY-MM-DD HH:mm:ss');

    filenames = fs.readdirSync(sessionDir);

    filenames.forEach( function (filename) {
        var data = fs.readFileSync(sessionDir + filename, 'utf-8');
        var json = JSON.parse(data);
        
        var sessionStart = moment(json.start_time, 'YYYY-MM-DD HH:mm:ss');
        var lastDate = moment(lastSeenDate, 'YYYY-MM-DD HH:mm:ss');

        if ( moment(json.start_time, 'YYYY-MM-DD HH:mm:ss').isSameOrAfter( moment(lastSeenDate, 'YYYY-MM-DD HH:mm:ss') ) ) {
            result = data;
        }
        
    });

    return result;
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
                uuid: '13333333-3333-3333-3333-333333333337',
                characteristics: [ dateTimeCh ]
            }),
            new BlenoPrimaryService({
                uuid: '13333333-3333-3333-3333-333333333338',
                characteristics: [ transferCh ]
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
