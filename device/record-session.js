var nodeimu = require('nodeimu');
var moment = require('moment');
var fs = require('fs');
var jsonfile = require('jsonfile');
var serialport = require('serialport');
//var sensejoystick = require('sense-joystick');
var IMU = new nodeimu.IMU();
var serial = new serialport('/dev/ttyUSB0', { baudRate: 115200 });

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var hasLocation = false;
var lat_reading = 0;
var lon_reading = 0;

var session = {
    start_time: moment().format(DATE_FORMAT),
    end_time: null,
    data: []
}

var min = {};
var max = {};

serial.on('open', function() {
    console.log('Serial connection opened');
    serial.on('data', function(data) {
        hasLocation = true;
        console.log('data.toString(): ' + data.toString());
        latlon = data.toString().split(',');
        console.log(latlon[0] + ',' + latlon[1]);
        lat_reading = parseFloat(latlon[0]);
        lon_reading = parseFloat(latlon[1]);
    });
});

//sensejoystick.getJoystick()
//.then((joystick) => {
//    joystick.on('press', (direction) => {
//        console.log('press');
//    })
//});

function getReadings() {
    var imudata = IMU.getValueSync();
    var ts = moment();

    if (shouldPersist(imudata, ts)) {

        var dat = getData(imudata);

        if (session.data == {}) {
            min.accel = reduce(dat.x, dat.y, dat.z);
            min.gyro = reduce(dat.pitch, dat.roll, dat.yaw);

            max.accel = reduce(dat.x, dat.y, dat.z);
            max.gyro = reduce(dat.pitch, dat.roll, dat.yaw);
        else {
            min.accel = Math.min( min.accel, reduce(dat.x, dat.y, dat.z) );
            min.gyro = Math.min( min.gyro, reduce(dat.pitch, dat.roll, dat.yaw) );

            max.accel = Math.max( max.accel, reduce(dat.x, dat.y, dat.z) );
            max.gyro = Math.max( max.accel, reduce(dat.pitch, dat.roll, dat.yaw) );
        }

        console.log("Recording data @ " + ts.format("HH:mm:ss"));
        session.data.push({
            timestamp: ts.format(DATE_FORMAT),
            gyro: {
                score: getGryoScore(dat)
                pitch: dat.pitch,
                roll: dat.roll,
                yaw: dat.yaw,
            },
            gps: {
                latitude: lat_reading.toFixed(5),
                longitude: lon_reading.toFixed(5),
            },
            accel: {
                score: getAccelScore(dat)
                x: dat.x,
                y: dat.y,
                z: dat.z,
            }
        });
    }
}

function reduce(a, b, c) {
    return Math.sqrt( Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2) );
}

function getData(imudata) {
    return {
        x: imudata.accel.x.toFixed(3),
        y: imudata.accel.y.toFixed(3),
        z: imudata.accel.z.toFixed(3)
        pitch: imudata.gyro.x.toFixed(3),
        roll: imudata.gyro.y.toFixed(3),
        yaw: imudata.gyro.z.toFixed(3)
    }
}

function calculateDanger(readings, dat) {
    var min = readings[0];

   
    
    var danger = 0;

    return danger;
}

function shouldPersist(imudata, ts) {
    
    if (!hasLocation) {
        return false;
    }

    // if 5 or more seconds have passed since last recorded reading
    // save it
    if (session.data.length > 0) { 
        if (ts.diff(session.data[session.data.length - 1].timestamp, 'seconds') >= 5) {
            return true;
        }
    }

    // if the current reading is >10% off of any of the 5 previous readings
    // then save the reading as it is a relevant data point
    if (session.data.length >= 5) {
        session.data.slice(-1).forEach(function (d, i) {
            // relative differences
            pitchDiff = Math.abs(d.gyro.pitch - imudata.gyro.x) / d.gyro.pitch;
            rollDiff = Math.abs(d.gyro.roll - imudata.gyro.y) / d.gyro.roll;
            yawDiff = Math.abs(d.gyro.yaw - imudata.gyro.z) / d.gyro.yaw;

            xdiff = Math.abs(d.accel.x - imudata.accel.x) / d.accel.x;
            ydiff = Math.abs(d.accel.y - imudata.accel.y) / d.accel.y;
            zdiff = Math.abs(d.accel.z - imudata.accel.z) / d.accel.z; 

            // if greatest relative difference is > 10% then save
            maxdiff = Math.max(pitchDiff, rollDiff, yawDiff, xdiff, ydiff, zdiff); 
        });
        if (maxdiff > 2.0) {
            return true;
        }
    } else {
        return true;
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
setInterval(getReadings, 3000);

// call exitHandler on program exit
//process.on('exit', exitHandler.bind(null, {cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

