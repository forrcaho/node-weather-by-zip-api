"use strict";

const axios = require('axios');
const secrets = require('./secrets');
const API_KEY = secrets.API_KEY;

async function getWeatherByZipCode(zipCode) {
    console.log('Getting weather for zip code ' + zipCode);
    try {
        const response = await axios.get('https://api.weatherbit.io/v2.0/current', { 
            params: {
                postal_code: zipCode,
                units: 'I',
                key: API_KEY
            }
        });
        // Optional chaining not supported yet in Node
        // const data = response.data?.data?.[0]
        console.log('Finished getting weather for zip code ' + zipCode);
        if (response.data && response.data.data && response.data.data[0]) {
            const data = response.data.data[0];
            data['postal_code'] = zipCode;
            return data;
        } else {
            throw `Unexpected response getting weather for zip code ${zipCode}`;
        }
    } catch (error) {
        console.error(error);
       throw error;
    }
}

async function getWeatherByMultiZipCodes(zipCodeArray) {
    const weatherArray = [];
    for (const zipCode of zipCodeArray) {
        let data;
        data = getWeatherByZipCode(zipCode).catch( e => {
            console.log(`Caught exception '${e}' getting weather data for zip code ${zipCode}`);
        });
        // An undefined value in our returned JSON list represents an error fetching the data a particular zip code.
        weatherArray.push(data);
    }
    // Wait for all Promises to resolve, get their values (will be undefined for exceptions)
    return (await Promise.allSettled(weatherArray)).map(el => el.value);
}

// async function printData() {
//     const weatherArray = await getWeatherByMultiZipCodes(['30830', 'bogus']);
//     console.log(weatherArray);
// }

// printData();

module.exports = {
    getWeatherByZipCode,
    getWeatherByMultiZipCodes
}