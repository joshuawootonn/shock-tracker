var nodeimu = require('nodeimu');
var moment = require('moment');
var fs = require('fs');
var jsonfile = require('jsonfile');

var IMU = new nodeimu.IMU();
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var session = {
    start_time: moment().format(DATE_FORMAT),
    end_time: null,
    data: []
}

function getReadings() {
    var imudata = IMU.getValueSync();
    session.data.push({
        timestamp: moment().format(DATE_FORMAT),
        gyro: {
            pitch: imudata.gyro.x,
            roll: imudata.gyro.y,
            yaw: imudata.gyro.z,
        },
        gps: {
            latitude: null,
            longitude: null,
        },
        accel: {
            x: imudata.accel.x,
            y: imudata.accel.y,
            z: imudata.accel.z
        }
    });
}

function exitHandler() {
    clearInterval();
    session['data'].pop(); // remove last element as it may be incomplete
    session['end_time'] = session['data'].slice(-1)[0].timestamp; // set end time

    var fn = getNextFileName();
    jsonfile.writeFileSync(fn, session);

    var end = moment(session.end_time, DATE_FORMAT);
    var start = moment(session.start_time, DATE_FORMAT);
    console.log('\nYour ' + moment(end.diff(start)).format('m[min] s[sec]') + ' session has been stored in ' + fn);
    process.exit();
}

function getNextFileName() {
    var ch = 'a';
    var path = '/home/pi/shock-tracker/device/sessions/';
    var date = moment().format('YYYY-MM-DD');
   
    function nextFileName() {
        return path + date + ch + '.json';
    }

    var fname = nextFileName();

    while (fs.existsSync(fname)) {
        ch = String.fromCharCode(ch.charCodeAt(0) + 1);
        fname = nextFileName();

        if (ch == 'z') {
            ch = 'a';
            date = date + 'a';
        }
    }

    return fname;
}

// call getReadings every second
setInterval(getReadings, 1000);

// call exitHandler on program exit
//process.on('exit', exitHandler.bind(null, {cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

