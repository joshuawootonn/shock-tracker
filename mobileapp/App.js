import React from 'react';
import {
  AsyncStorage,
  AppRegistry,
  AppState,
  Alert,
  Button,
  Dimensions,
  ListView,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import MapView from 'react-native-maps';
import BleManager from 'react-native-ble-manager';
import { stringToBytes, bytesToString } from 'convert-string';
import axios from 'axios';

import Buffer from 'buffer';

const {width, height} = Dimensions.get('window')
const SCREEN_HEIGHT = height
const SCREEN_WIDTH = width
const ASPECT_RATIO = width / height
const LATTITUDE_DELTA = 0.02
const LONGTITUDE_DELTA = LATTITUDE_DELTA * ASPECT_RATIO

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

class HomeScreen extends React.Component {

  static navigationOptions = {
    title: 'Home',
  }

  render() {
    return (
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <Button
              title="Bluetooth"
              onPress={() => this.props.navigation.navigate('Bluetooth')}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Map"
              onPress={() => this.props.navigation.navigate('Details')}
            />
            <View style={styles.buttonContainer}>
            </View>
          </View>
        </View>
    );
  }
}

class BluetoothScreen extends React.Component {

  static navigationOptions = {
    title: 'Bluetooth',
  };

  constructor() {
    super()

    this.state = {
      scanning:false,
      date: "2000-01-01 00:00:00",
      peripherals: new Map(),
      appState: '',
      data: {}
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  dataSync() {
    //this.syncDate();
    console.log(this.state.data);
    axios.post("http://iot4-env-1.us-east-1.elasticbeanstalk.com/api/session", this.state.data)
    .then(() => {
      Alert.alert('Data Synced', 'Press OK To Continue');
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('Connection Error', 'Please Check Your Connection And Try Again');
    });
  }

  syncDate() {
    var value = this.state.data.end_time;
    console.log(value);
    //AsyncStorage.setItem("lastSync", value);
  }

  componentDidMount() {

    AsyncStorage.getItem("lastSync", (error, value) => {
      if(!error) {
        if(value !== null) {

          this.setState({date: value});
        }
        else
        {
          this.setState({date: "2000-01-01 00:00:00"});
        }
        //console.log(this.state.date);
      }
    });


    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );



    if (Platform.OS === 'android' && Platform.Version >= 23) {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("Permission is OK");
            } else {
              PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                  console.log("User accept");
                } else {
                  console.log("User refuse");
                }
              });
            }
      });
    }

  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false });
  }

  startScan() {
    if (!this.state.scanning) {
      this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        this.setState({scanning:true});
      });
    }
  }

  retrieveConnected(){
    BleManager.getConnectedPeripherals([]).then((results) => {
      //console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
      }
    });
  }

  handleDiscoverPeripheral(peripheral){
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)){
      //console.log('Got ble peripheral', peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  test(peripheral) {
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        BleManager.connect(peripheral.id).then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({peripherals});
          }
          console.log('Connected to ' + peripheral.id);


          setTimeout(() => {
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              //console.log(peripheralInfo);
              var readService = '13333333-3333-3333-3333-333333333338';
              var writeService = '13333333-3333-3333-3333-333333333337';
              var readCharacteristic = '00000000-0000-0000-0000-000000009999';
              var writeCharacteristic = '00000000-0000-0000-0000-000000002a08';
              var dataWrite = stringToBytes(this.state.date);
              var readData;
              BleManager.write(peripheral.id, writeService, writeCharacteristic, dataWrite)
              .then(async () => {
                console.log('Write: ' + dataWrite);
                var isnotdone = true;
                var longresult = "";
                while(isnotdone)
                {
                  var readPromise = BleManager.read(peripheral.id, readService, readCharacteristic);
                  var timerPromise = new Promise((resolve, reject) => {
                    setTimeout(resolve, 1000, "TIMEOUT");
                  });
                  await Promise.race([readPromise, timerPromise])
                  .then((readData) => {
                    if(readData != "TIMEOUT")
                    {
                      var result = bytesToString(readData);
                      
                      if(result == "DONE")
                      {
                        isnotdone = false;
                      }
                      else
                      {
                        console.log('Read: ' + result);
                        longresult = longresult + result;
                      }
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                }
                console.log(longresult);
                var convData = JSON.parse(longresult);
                this.setState(data: convData);
              })
              .catch((error) => {
                console.log(error);
              });
            });
          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const dataSource = ds.cloneWithRows(list);


    return (
      <View style={blestyles.container}>
        <TouchableHighlight style={{marginTop: 40,margin: 20, padding:20, backgroundColor:'#ccc'}} underlayColor={'#abcdef'} onPress={() => this.startScan() }>
          <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
        </TouchableHighlight>
        <TouchableHighlight style={{marginTop: 0,margin: 20, padding:20, backgroundColor:'#ccc'}} underlayColor={'#abcdef'} onPress={() => this.retrieveConnected() }>
          <Text>Retrieve connected peripherals</Text>
        </TouchableHighlight>
        <ScrollView style={blestyles.scroll}>
          {(list.length == 0) &&
            <View style={{flex:1, margin: 20}}>
              <Text style={{textAlign: 'center'}}>No peripherals</Text>
            </View>
          }
          <ListView
            enableEmptySections={true}
            dataSource={dataSource}
            renderRow={(item) => {
              const color = item.connected ? 'green' : '#fff';
              return (
                <TouchableHighlight onPress={() => this.test(item) }>
                  <View style={[blestyles.row, {backgroundColor: color}]}>
                    <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
                    <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 10}}>{item.id}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
          />
        </ScrollView>
        <TouchableHighlight style={{marginTop: 0,margin: 20, padding:20, backgroundColor:'#ccc'}} underlayColor={'#abcdef'} onPress={() => this.dataSync() }>
          <Text>Sync</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

class DetailsScreen extends React.Component {
  
  static navigationOptions = {
    title: 'Map',
  };

  constructor(props) {
    super(props)

    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      markerPosition: {
        latitude: 0,
        longitude: 0
      }
    }
  }

  watchID: ?number = null

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)

      var initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATTITUDE_DELTA,
        longitudeDelta: LONGTITUDE_DELTA
      }
      
      this.setState({initialPosition: initialRegion})
      this.setState({markerPosition: initialRegion})
    },
    (error) => alert(JSON.stringify(error)),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000})

    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lat = parseFloat(position.coords.latitude)
      var long = parseFloat(position.coords.longitude)

      var lastRegion = {
        latitude: lat,
        longitude: long,
        longitudeDelta: LONGTITUDE_DELTA,
        latitudeDelta: LATTITUDE_DELTA
      }

      this.setState({initialPosition: lastRegion})
      this.setState({markerPosition: lastRegion})
    })
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  render() {
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={this.state.initialPosition}
        >
          <MapView.Marker
            coordinate={this.state.markerPosition}
          >
          </MapView.Marker>
        </MapView>
      </View>
    );
  }
}

const RootStack = StackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Details: {
      screen: DetailsScreen,
    },
    Bluetooth: {
      screen: BluetoothScreen,
    },
  },
  {
    initialRouteName: 'Home',
  }
);

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'flex-end',
  },
  buttonContainer: {
    margin: 10
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});

const blestyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10
  },
});