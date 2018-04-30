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

var readfailed = false;
var lastbytes = '';

var totaldata = '';


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

var errorCh = new BlenoCharacteristic({
    uuid: '0x9911',
    properties: ['write'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x9911'
        })
    ],

    onWriteRequest: function (data, offset, withoutResponse, callback) {
        console.log('read failed!');
        readfailed = true;
    }
});

var fixCh = new BlenoCharacteristic({
    uuid: '0x7777', 
    properties: ['read'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x7777',
            value: 'fix'
        })
    ],

    onReadRequest: function (offset, callback) {
        callback(this.RESULT_SUCCESS, Buffer.from('fix'));
    }
});

var verifyCh = new BlenoCharacteristic({
    uuid: '0x4444',
    properties: ['write'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x4444'
        })
    ],

    onWriteRequest: function (data,offset,withoutResponse,callback) {
        
        console.log('aligning to: ' + data.toString());

        if (data.toString().length != 20) { callback(this.RESULT_SUCCESS); }

        for (var i = 0; i < totaldata.length - 20; i+=20) {
            if (totaldata.slice(i, i+20) == data.toString()) {
                console.log('found alignment');
                filedata = totaldata.slice(i+20);
                callback(this.RESULT_SUCCESS);
            }
        }
    }
});


var transferCh = new BlenoCharacteristic ({
    uuid: '0x9999',
    properties: ['read'],
    descriptors: [
        new BlenoDescriptor({
            uuid: '0x9999',
        })
    ],

    onReadRequest: function (offset, callback) {

        try {
            if ( filedata == null && !readfailed ) {
                console.log('reading new file');
                totaldata = readFile();
                filedata = totaldata
            } else if ( filedata == '' ) {
                if ( readfailed ) {
                    console.log('read failed!');
                    readfailed = true;
                    callback(this.RESULT_SUCCESS, Buffer.from(lastbytes));
                    return;
                } else {
                    console.log('\n####################');
                    console.log('end of message: DONE');
                    filedata = null;
                    lastbytes = 'DONE';
                    callback(this.RESULT_SUCCESS, Buffer.from('DONE'));
                    return;
                }
            }


            if ( readfailed ) {

                // last read request failed; send previous bytes

                console.log('read failed!')
                readfailed = false;
                callback(this.RESULT_SUCCESS, Buffer.from(lastbytes));

            } else {

                /* Last read request did not fail; send bytes as usual */

                // get next 20 bytes and update file data
                var response = filedata.slice(0, 20);
                filedata = filedata.slice(20);

                // update last sent bytes
                lastbytes = response;

                console.log('sending data: ' + response);
                callback(this.RESULT_SUCCESS, Buffer.from(response));

            }

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
                characteristics: [ dateTimeCh, verifyCh ]
            }),
            new BlenoPrimaryService({
                uuid: '13333333-3333-3333-3333-333333333338',
                characteristics: [ transferCh ]
            }),
            new BlenoPrimaryService({
                uuid: '00000000-0000-0000-0000-000000000911',
                characteristics: [ errorCh, fixCh ]
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
