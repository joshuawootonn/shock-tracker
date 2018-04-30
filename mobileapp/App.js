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
import Swiper from 'react-native-swiper';

import Buffer from 'buffer';

const {width, height} = Dimensions.get('window')
const SCREEN_HEIGHT = height
const SCREEN_WIDTH = width
const ASPECT_RATIO = width / height
const LATTITUDE_DELTA = 0.01
const LONGTITUDE_DELTA = LATTITUDE_DELTA * ASPECT_RATIO
const color = '#009688';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

class DetailsScreen extends React.Component {
  
  static navigationOptions = {
    title: 'Map',
    header: null
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
      },
      dangerData: [],
      view: true,
      scanning:false,
      date: "2000-01-01 00:00:00",
      peripherals: new Map(),
      appState: '',
      data: {},
      sycnReady: "#ccc"
    }

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  watchID: ?number = null

  dataSync() {
    //this.syncDate();
    this.setState({sycnReady: "#ccc"});
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

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
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

  async test(peripheral) {
    var readService = '13333333-3333-3333-3333-333333333338';
    var writeService = '13333333-3333-3333-3333-333333333337';
    var readCharacteristic = '00000000-0000-0000-0000-000000009999';
    var writeCharacteristic = '00000000-0000-0000-0000-000000002a08';
    var errorService = '00000000-0000-0000-0000-000000000911';
    var errorCharacteristic = '00000000-0000-0000-0000-000000009911';
    var verifyCharacteristic = '00000000-0000-0000-0000-000000004444';
    var fixErrorCharacteristic = '00000000-0000-0000-0000-000000007777';
    var dataWrite = "";
    var longresult = "";
    var readData = "";
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        var invalid = true;
        var running = false;
        //WHILE LOOP BLUETOOTH CONNECTION ERROR WHILE IN TRANSMITION
        while(invalid)
        {
          await BleManager.connect(peripheral.id)
          .then(async () => {
            let peripherals = this.state.peripherals;
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              this.setState({peripherals});
            }
            console.log('Connected to ' + peripheral.id);
              await BleManager.retrieveServices(peripheral.id)
              .then(async (peripheralInfo) => {
                //console.log(peripheralInfo);
                var errorWrite = true;
                while(errorWrite) {
                  if(running == true) {
                    dataWrite = stringToBytes("ERROR");
                    await BleManager.write(peripheral.id, errorService, errorCharacteristic, dataWrite)
                    .then(() => {
                      console.log('Write:' + dataWrite);
                      errorWrite = false;
                    })
                    .catch(() => {
                      console.log('WRITE ERROR 1');
                      errorWrite = true;
                    });
                  }
                  else
                  {
                    longresult = "";
                    dataWrite = stringToBytes(this.state.date);
                    await BleManager.write(peripheral.id, writeService, writeCharacteristic, dataWrite)
                    .then(async () => {
                      console.log('Write: ' + dataWrite);
                      running = true;
                      errorWrite = false;
                    })
                    .catch(() => {
                      console.log('WRITE ERROR 2');
                      errorWrite = true;
                    });
                  }
                }
                var isnotdone = true;
                //WHILE LOOP TO FIND DONE STRING
                while(isnotdone)
                {
                  var readPromise = BleManager.read(peripheral.id, readService, readCharacteristic);
                  var timerPromise = new Promise((resolve, reject) => {
                    setTimeout(resolve, 1500, "TIMEOUT");
                  });
                  await Promise.race([readPromise, timerPromise])
                  .then(async (readData) => {
                    if(readData != "TIMEOUT")
                    {
                      await BleManager.write(peripheral.id, writeService, verifyCharacteristic, readData)
                      .then(() => {
                        var result = bytesToString(readData);
                        console.log('Write: ' + result);
                      })
                      .catch((error) => {
                        console.log("WRITE ERROR 3");
                      });
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
                  .catch(async (error) => {
                    //READ ERROR
                    errorWrite = true;
                    while(errorWrite) {
                      console.log(error);
                      dataWrite = stringToBytes("ERROR");
                      await BleManager.read(peripheral.id, errorService, fixErrorCharacteristic)
                      .catch(() => {
                        console.log('WRITE ERROR 4');
                      });
                      await BleManager.write(peripheral.id, errorService, errorCharacteristic, dataWrite)
                      .then(() => {
                        errorWrite = false;
                        console.log('Write:' + dataWrite);
                      })
                      .catch(() => {
                        errorWrite = true;
                        console.log('WRITE ERROR 5');
                      });
                    }
                  });
                }
            });
          }).catch((error) => {
            //BLUETOOTH DISCONNECTION ERROR
            console.log('Connection error', error);
          });
          //END OF CONNECTION OR JSON RECIEVED
          try {
            //TRY TO CONVERT STRING TO JSON
            console.log(longresult);
            var convData = JSON.parse(longresult);
            this.setState({data: convData});
            //END LOOP CONDITIONS
            invalid = false;
            running = false;
            this.setState({sycnReady: "#ABCDEF"});
            //TODO: DISCONNECT BLUETOOTH AFTER COMPLETE JSON TRANSFERED
          }
          catch (e) {
            //JSON INCOMPLETE ERROR
            console.log("INVALID JSON: " + e);
          }
        }
      }
    }
  }

  getDangers() {
    var lat = this.state.markerPosition.latitude;
    var long = this.state.markerPosition.longitude;
    var url = 'http://iot4-env-1.us-east-1.elasticbeanstalk.com/api/session/byLocation/'+long+'/'+lat+'/2';
    console.log('URL: ' + url);
     var coordarr = [];
     axios.get(url)
    .then((getData) => {
      getData = getData.data;
      if (getData.length) {
        getData.forEach(element => { // for each session
          //console.log('Element:' + element);

          element.data.forEach( (d) => { // for each point in the session
            if(this.state.view == true) {
              coordarr.push(coord = <MapView.Marker coordinate={{latitude: d.latitude, longitude: d.longitude}} pinColor={this.colorScale(d.speed_score)}></MapView.Marker>);
            }
            else
            {
              coordarr.push(coord = <MapView.Marker coordinate={{latitude: d.latitude, longitude: d.longitude}} pinColor={this.colorScale(d.accel_score)}></MapView.Marker>);
            }
          });
        });
      }
      this.setState({dangerData: coordarr});
      //console.log(this.state.dangerData);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  switchView() {
    if(this.state.view == true)
    {
      this.setState({view: false});
    }
    else
    {
      this.setState({view: true});
    }
    this.getDangers();
  }

  colorScale(dangerScore) {
    //0-9 to A-F (16 Shades)
    dangerScore = Math.ceil(dangerScore * 16);
    var color = '#FF';
    if(dangerScore < 3)
    {
      color = '#00A';
    }
    else if(dangerScore < 10)
    {
      color = color + dangerScore;
    }
    else if(dangerScore == 11)
    {
      color = color + 'A';
    }
    else if(dangerScore == 12)
    {
      color = color + 'B';
    }
    else if(dangerScore == 13)
    {
      color = color + 'C';
    }
    else if(dangerScore == 14)
    {
      color = color + 'D';
    }
    else if(dangerScore == 15)
    {
      color = color + 'E';
    }
    else
    {
      color = color + 'F';
    }
    color = color + '000';
    return color;
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
      this.getDangers();
    })
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const dataSource = ds.cloneWithRows(list);

    return (
      <Swiper showsButtons={true} showsPagination={false} loop={false}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={this.state.initialPosition}
          >
            <MapView.Marker
              coordinate={this.state.markerPosition}
              pinColor={color}
            >
            </MapView.Marker>
            {this.state.dangerData}
          </MapView>
          <TouchableHighlight style={{marginTop: 40,margin: 20, padding:20, backgroundColor:'#ccc', opacity: 0.75}} underlayColor={'#abcdef'} onPress={() => this.switchView()}>
            <Text>{this.state.view ? 'Speed' : 'Acceleration'}</Text>
          </TouchableHighlight>
        </View>
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
          <TouchableHighlight style={{marginTop: 0,margin: 20, padding:20, backgroundColor:this.state.sycnReady}} underlayColor={'#00adef'} onPress={() => this.dataSync() }>
            <Text>Sync</Text>
          </TouchableHighlight>
        </View>
      </Swiper>
    );
  }
}

const RootStack = StackNavigator(
  {
    Details: {
      screen: DetailsScreen,
    },
  },
  {
    initialRouteName: 'Details',
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
  buttonText: {
    fontSize: 25,
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