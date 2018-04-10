var util = require('util');
var bleno = require('bleno');
var fs = require('fs');

var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function () {
	EchoCharacteristic.super_.call(this, {
		uuid: 'fffffffffffffffffffffffffffffff1',
		properties: ['read', 'write', 'notify'],
		value: null
	});
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
    // read most recent session file and send it
    fs.readFile('./sample-sessions/2018-04-09a.json', 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            this._value = data;
            console.log('EchoCharacteristic -- onReadRequest: value = ' + this._value);
            callback(this.RESULT_SUCCESS, this._value);
        }

    });
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log('EchoCharacteristic -- onWriteRequest: value = ' + data);

    // handle recieved data here
    
    this._value = data;

	if (this._updateValueCallback) {
		console.log('EchoCharacteristic -- onWriteRequest: notifying');
		this._updateValueCallback(this._value);
	}

	callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
	console.log('EchoCharacteristic -- onSubscribe');
	this._updateValueCallback = updateValueCallback;
	callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
	console.log('EchoCharacteristic -- onUnsubscribe');
	this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;
