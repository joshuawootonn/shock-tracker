var util = require('util');
var bleno = require('bleno');
var fs = require('fs');

var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function () {
	EchoCharacteristic.super_.call(this, {
		uuid: 'fffffffffffffffffffffffffffffff1',
		properties: ['read'],
		value: new Buffer("asdf")
	});
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
    console.log("onREAD");
    this._value = fs.readFile('./sample-sessions/2018-04-09a.json');
    console.log('EchoCharacteristic -- onReadRequest: value = ' + this._value);
    callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log("onWRITE");
	this._value = data;
	console.log('EchoCharacteristic -- onWriteRequest: value = ' + this._value.toString('hex'));

	if (this._updateValueCallback) {
		console.log('EchoCharacteristic -- onWriteRequest: notifying');
		this._updateValueCallback(this._value);
	}

	callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log("onSUBSCRIBE");
	console.log('EchoCharacteristic -- onSubscribe');
	this._updateValueCallback = updateValueCallback;
    callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
    console.log("onUNSUBSCRIBE");
	console.log('EchoCharacteristic -- onUnsubscribe');
	this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;
