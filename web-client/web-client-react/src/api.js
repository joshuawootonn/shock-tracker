import axios from 'axios';
const key = process.env.GOOGLE_MAPS_API;


export const search = (lat,lng,radius) => {
  axios.get(`http://iot4-env-1.us-east-1.elasticbeanstalk.com/api/session/byLocation/${lng}/${lat}/${radius}`)
}