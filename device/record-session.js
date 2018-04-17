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
    var ts = moment().format(DATE_FORMAT);

    if (shouldPersist(imudata, ts)) {
        session.data.push({
            timestamp: ts,
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
}

function shouldPersist(imudata, ts) {

    // if 5 or more seconds have passed since last recorded reading
    // save it
    if (ts.diff(session.data.slice(-1).timestamp, 'seconds') >= 5) {
        return true;
    }

    // if the current reading is >10% off of any of the 5 previous readings
    // then save the reading as it is a relevant data point
    if (session.data.length >= 5) {
        session.data.slice(-5).forEach(function (d, i) {
            // relative differences
            pitchDiff = Math.abs(d.gyro.x, imudata.gyro.x) / d.gyro.x;
            rollDiff = Math.abs(d.gyro.y, imudata.gyro.y) / d.gyro.y;
            yawDiff = Math.abs(d.gyro.z, imudata.gyro.z) / d.gryo.z;

            xdiff = Math.abs(d.accel.x, imudata.accel.x) / d.accel.x;
            ydiff = Math.abs(d.accel.y, imudata.accel.y) / d.accel.y;
            zdiff = Math.abs(d.accel.z, imudata.accel.z) / d.accel.z;

            // if greatest relative difference is > 10% then save
            maxdiff = Math.max(pitchDiff, rollDiff, yawDiff, xdiff, ydiff, zdiff);
            if (maxdiff > 1.10) {
                return true;
            }
        });
    }

    return false;
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

