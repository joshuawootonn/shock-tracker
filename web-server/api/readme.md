# user
### get all
This request allows you to get a array of all the users
```javascript
  axios.get('http://localhost:3000/api/users', {
      params: {
        ID: 12345
      }
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### get 
This request allows you to get an object containing the data of a user you specify by the param of your request
```javascript
  axios.get('http://localhost:3000/api/user/1')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```
### post
This request allows you to create a user with fields of user_name and uuid
```javascript
  axios.post('http://localhost:3000/api/user', {
      user_name: 'josh wootonn',
      uuid: '23412341234123' // This should be taken from the user creation response from aws or firbase
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### put
This request allows you to edit an existing user based on the id provided in params and data fields in body
```javascript
  axios.put('http://localhost:3000/api/user/?id=12345', {
      user_name: 'josh wootonn2'// just the params you want to update     
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### delete
This request allows you to delete an existing user base on the id provided in params
```javascript
  axios.delete('http://localhost:3000/api/user/?id=12345', {
      user_name: 'josh wootonn',
      uuid: '23412341234123' 
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```

# session
### get all
This request allows you to get a list of all sessions with their data. Don't use this request lol
```javascript
   axios.get('http://localhost:3000/api/sessions')
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### get by user
This request allows you to get all the sessions of a particular user. 
```javascript
  axios.get('http://localhost:3000/api/session/byUser/1')
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### get 
This request allows you to get a particular session by it's id
```javascript
  axios.get('http://localhost:3000/api/session/22')
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```
### post
This request allows you to create a new session 
```javascript
  axios.post("http://localhost:3000/api/session", {
    user_id: "2",
    start_time: "now()",
    end_time: "now()",
    data: [
      {
        timestamp: "now()",
        gyro: {
          pitch: "1",
          yaw: "1",
          roll: "1"
        },
        gps: {
          longitude: "2",
          latitude: "2"
        },
        accel: {
          x: "3",
          y: "3",
          z: "3"
        }
      },
      {
        timestamp: "now()",
        gyro: {
          pitch: "1",
          yaw: "1",
          roll: "1"
        },
        gps: {
          longitude: "2",
          latitude: "2"
        },
        accel: {
          x: "3",
          y: "3",
          z: "3"
        }
      }
    ]
  })
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
```
### delete
This request allows you to delete a session base on param provided id
```javascript
  axios.delete('http://localhost:3000/api/session/22')
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
```