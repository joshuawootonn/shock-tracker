var util = require('util');
var bleno = require('bleno');
var fs = require('fs');

var BlenoCharacteristic = bleno.Characteristic;

var SendCharacteristic = function () {
	SendCharacteristic.super_.call(this, {
		uuid: 'fffffffffffffffffffffffffffffff1',
		properties: ['read', 'write', 'notify'],
		value: null
	});
};

util.inherits(SendCharacteristic, BlenoCharacteristic);

SendCharacteristic.prototype.onReadRequest = function(offset, callback) {
    // read most recent session file and send it
    fs.readFile('./sample-sessions/2018-04-09a.json', 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            this._value = data;
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
