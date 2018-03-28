## IoT Device

### Overview


### Technologies
##### Hardware
  - Raspberry Pi
    - Sense Hat
    - GPS module
    - Battery

##### Software
  - Minibian (minimal raspbian-based distro)
  - `pi-bluetooth` package for bluetooth connectivity

### Integration
Records the following data points at intervals of 0.25s:
  - GPS location (lat, long)
  - Accelerometer (x, y, z)
  - Gyroscope (roll, pitch, yaw)

Stores these data points in JSON file for the current session. Sends all data since last transfer over bluetooth upon connection.
