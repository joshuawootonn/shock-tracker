## IoT Device

### Overview
  - Small computing device to record data and send to a paired phone when session is complete

### Bluetooth Terminology
Central: the device with more computing power  
Peripheral: the less powerful device

Client: the device that wants information  
Server: the device which has information it wishes to share

In our case: IoT device is Peripheral/Server; Phone is Central/Client

### Technologies
###### Hardware
  - Raspberry Pi
    - Sense Hat
    - GPS module
  - Battery
  - Waterproof case

###### Software
  - Raspbian strech lite
  - Node.js & node `bleno` library

### Data Collection
Records the following data points at intervals of 0.25s:
  - GPS location (lat, long)
  - Accelerometer (x, y, z)
  - Gyroscope (roll, pitch, yaw)

Stores these data points in JSON file for the current session. Sends all data since last transfer over bluetooth upon connection.

### Session Recording 
Here is the outline of a session file:
```
{
    'start_time': 'YYYY-MM-DD HH:mm:ss',
    'end_time': 'YYYY-MM-DD HH:mm:ss',
    'data': [
    {
        'timestamp': 'YYYY-MM-DD HH:mm:ss',
        'gyro': {
            'score': // a number n, where 1.0 <= n <= 10.0. 1.0 means low danger for that point, 10.0 means high danger
            'pitch': 3.102,
            'roll': 0.339,
            'yaw': 0.974
        },
        'gps': {
            'score': // a number n, where 1.0 <= n <= 10.0. 1.0 means low danger for that point, 10.0 means high danger
            'latitude': 41.48392,
            'longitude': -91.29492
        },
        'accel': {
            'score': // a number n, where 1.0 <= n <= 10.0. 1.0 means low danger for that point, 10.0 means high danger
            'x': 2.445,
            'y': 0.443,
            'z': 0.332
        }
    },
    {
        'timestamp': 'YYYY-MM-DD HH:mm:ss',
        'score': // a number n, where 1.0 <= n <= 10.0. 1.0 means low danger for that point, 10.0 means high danger
        'gyro': {
            'pitch': 3.102,
            'roll': 0.339,
            'yaw': 0.974
        },
        'gps': {
            'latitude': 41.48392,
            'longitude': -91.29492
        },
        'accel': {
            'x': 2.445,
            'y': 0.443,
            'z': 0.332
        }
    },
    
    ...
      
  ]
}
```
