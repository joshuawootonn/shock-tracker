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
    var ts = moment();

    if (shouldPersist(imudata, ts)) {
        console.log("Recording data @ " + ts.format("HH:mm:ss"));
        session.data.push({
            timestamp: ts.format(DATE_FORMAT),
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
    } else {
        console.log("ignoring data @ " + ts.format("HH:mm:ss"));
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
        session.data.slice(-1).forEach(function (d, i) {

            console.log(d);
            
            var newobj = {
                timestamp: ts,
                gyro: {
                    pitch: imudata.gyro.x,
                    roll: imudata.gyro.y,
                    yaw: imudata.gyro.z
                },
                gps: {
                    latitude: null,
                    longitude: null
                },
                accel: {
                    x: imudata.accel.x,
                    y: imudata.accel.y,
                    z: imudata.accel.z
                }
            };

            console.log(newobj);
            console.log('');
            console.log('');

            // relative differences
            console.log(typeof d.gyro.pitch);
            console.log(typeof imudata.gyro.x);
            pitchDiff = Math.abs(d.gyro.pitch - imudata.gyro.x) / d.gyro.pitch;
            console.log('pitchDiff ' + pitchDiff);
            rollDiff = Math.abs(d.gyro.roll - imudata.gyro.y) / d.gyro.roll;
            console.log('rollDiff ' + rollDiff);
            yawDiff = Math.abs(d.gyro.yaw - imudata.gyro.z) / d.gyro.yaw;
            console.log('yawDiff ' + yawDiff);

            xdiff = Math.abs(d.accel.x, imudata.accel.x) / d.accel.x;
            console.log('xdiff ' + xdiff);
            ydiff = Math.abs(d.accel.y, imudata.accel.y) / d.accel.y;
            console.log('ydiff ' + ydiff);
            zdiff = Math.abs(d.accel.z, imudata.accel.z) / d.accel.z;
            console.log('zdiff ' + zdiff); 

            // if greatest relative difference is > 10% then save
            maxdiff = Math.max(pitchDiff, rollDiff, yawDiff, xdiff, ydiff, zdiff);
            console.log('');
            console.log('maxdiff ' + maxdiff); 
            if (maxdiff > 1.10) {
                return true;
            }
        });
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
setInterval(getReadings, 1000);

// call exitHandler on program exit
//process.on('exit', exitHandler.bind(null, {cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
//process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

