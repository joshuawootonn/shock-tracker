var util = require('util');
var bleno = require('bleno');
var fs = require('fs');

var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

var SendCharacteristic = function () {
	SendCharacteristic.super_.call(this, {
		uuid: 'f45225be-4713-4531-ab8d-ab4b8662247f',
		properties: ['read', 'write', 'notify'],
        descriptors: [
		    new BlenoDescriptor({
                uuid: 'f45225be-4713-4531-ab8d-ab4b8662247f',
            })
        ],
	});

    this._value = new Buffer(0);
    this._updateValueCallback = null;
};

util.inherits(SendCharacteristic, BlenoCharacteristic);

SendCharacteristic.prototype.onReadRequest = function(offset, callback) {
    console.log("READ Request");
    // read most recent session file and send it
    fs.readFile('/home/pi/shock-tracker/device/sessions/2018-04-24a.json', 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            this._value = new Buffer.from("this is a test", 'utf8');
            console.log('SendCharacteristic -- onReadRequest: value = ' + this._value);
            callback(this.RESULT_SUCCESS, this._value);
        }

    });
};

SendCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log('SendCharacteristic -- onWriteRequest: value = ' + data);

    // handle recieved data here

    this._value = data;

	if (this._updateValueCallback) {
		console.log('SendCharacteristic -- onWriteRequest: notifying');
		this._updateValueCallback(this._value);
	}

	callback(this.RESULT_SUCCESS);
};

SendCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
	console.log('SendCharacteristic -- onSubscribe');
	this._updateValueCallback = updateValueCallback;
	callback(this.RESULT_SUCCESS);
};

SendCharacteristic.prototype.onUnsubscribe = function() {
	console.log('SendCharacteristic -- onUnsubscribe');
	this._updateValueCallback = null;
};

module.exports = SendCharacteristic;
