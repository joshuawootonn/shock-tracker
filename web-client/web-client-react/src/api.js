import axios from 'axios';
const PROXY = "https://cors-anywhere.herokuapp.com/";

export const search = (lat,lng,radius) => {
  return axios.get(`${PROXY}http://iot4-env-1.us-east-1.elasticbeanstalk.com/api/session/byLocation/${lng}/${lat}/${radius}`)
}