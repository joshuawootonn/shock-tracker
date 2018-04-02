## IoT Device

### Overview
  - Small computing device to record data and send to a paired phone when session is complete

### Technologies
###### Hardware
  - Raspberry Pi
    - Sense Hat
    - GPS module
  - Battery
  - Waterproof case

###### Software
  - Minibian (minimal raspbian-based distro)
  - Python library for raspberry pi bluetooth connectivity
  - or `pi-bluetooth` package for bluetooth connectivity

### Data Collection
Records the following data points at intervals of 0.25s:
  - GPS location (lat, long)
  - Accelerometer (x, y, z)
  - Gyroscope (roll, pitch, yaw)

Stores these data points in JSON file for the current session. Sends all data since last transfer over bluetooth upon connection.
