## An Example Node API

# Task

Build a simple NodeJS API with one endpoint the returns the current weather for a given zip code  
with the basic signature GET /weather

* To get the current weather, the NodeJS API should call this API for data:
<https://www.weatherbit.io/api/swaggerui/weather-api-v2#!/Current32Weather32Data/get_current_cities_cities>

* API Key = (redacted)

NodeJS API should support accepting multiple zip codes, returning an array of weather results
When multiple zip codes are passed, weather api calls should be made async but log as results are returned for each postal code without returning the final result until all submitted codes are processed.

Include best practice exception handling.

## Notes

At least for the first iteration we will use a different weatherbit.io API call:
<https://www.weatherbit.io/api/swaggerui/weather-api-v2#!/Current32Weather32Data/get_current_postal_code_postal_code>
as this makes the task much simpler, and is possibly what was originally intended.

## Secret handling

The API Key is a secret that shouldn't be checked in to source control. This goes in the file `secrets.js` which you
won't find in the repository. You need to copy `secrets-template.js` to `secrets.js` and edit it so that it contains
the actual API Key before running.

## Running the API Server

After the `secrets.js` file has been created, start the API server with the command `node server.js`.

## Using the API

By default, the server runs on localhost port 3000. There is one valid endpoint, `/weather`, which responds to GET
requests only. The query parameter `zip` is used to specify a zip code, as in this example:

```http
http://localhost:3000/weather?zip=55113
```

which returns

```json
{"rh":79,"pod":"d","lon":-93.1571,"pres":972.7,"timezone":"America/Chicago","ob_time":"2020-12-30 15:40","country_code":"US","clouds":100,"ts":1609342800,"solar_rad":45.1,"state_code":"MN","city_name":"Roseville","wind_spd":15,"wind_cdir_full":"west","wind_cdir":"W","slp":1009.1,"vis":3.1,"h_angle":-36,"sunset":"22:40","dni":620.71,"dewpt":18.4,"snow":0,"uv":0.9273571,"precip":0,"wind_dir":270,"sunrise":"13:50","ghi":225.75,"dhi":69.39,"aqi":54,"lat":45.0139,"weather":{"icon":"c04d","code":804,"description":"Overcast clouds"},"datetime":"2020-12-30:16","temp":24,"station":"HPN30","elev_angle":15.32,"app_temp":11.4,"postal_code":"55113"}
```

The `zip` query param can be repeated to query for multiple zip codes. This will return a JSON array with data objects
for each zip code. The attribute `postal_code` has been added to each weather data object to indicate which zip it is from.

(A better structure might have been to return an object with zip codes as keys and weather data as values, but I implemented
this as closely as possible to the description I was given.)

A multi-zip example would be

```http
http://localhost:3000/weather?zip=55113&zip=30909
```

which returns

```json
[{"rh":79,"pod":"d","lon":-93.1571,"pres":972.7,"timezone":"America/Chicago","ob_time":"2020-12-30 15:40","country_code":"US","clouds":100,"ts":1609342800,"solar_rad":45.1,"state_code":"MN","city_name":"Roseville","wind_spd":15,"wind_cdir_full":"west","wind_cdir":"W","slp":1009.1,"vis":3.1,"h_angle":-36,"sunset":"22:40","dni":620.71,"dewpt":18.4,"snow":0,"uv":0.9273571,"precip":0,"wind_dir":270,"sunrise":"13:50","ghi":225.75,"dhi":69.39,"aqi":54,"lat":45.0139,"weather":{"icon":"c04d","code":804,"description":"Overcast clouds"},"datetime":"2020-12-30:16","temp":24,"station":"HPN30","elev_angle":15.32,"app_temp":11.4,"postal_code":"55113"},{"rh":66,"pod":"d","lon":-82.0834,"pres":1016.2,"timezone":"America/New_York","ob_time":"2020-12-30 16:00","country_code":"US","clouds":100,"ts":1609344000,"solar_rad":97,"state_code":"GA","city_name":"Martinez","wind_spd":4.6,"wind_cdir_full":"west-southwest","wind_cdir":"WSW","slp":1029.8,"vis":3.1,"h_angle":-18,"sunset":"22:30","dni":804.22,"dewpt":41.8,"snow":0,"uv":1.47946,"precip":0,"wind_dir":244,"sunrise":"12:32","ghi":484.78,"dhi":96.34,"aqi":54,"lat":33.4717,"weather":{"icon":"c04d","code":804,"description":"Overcast clouds"},"datetime":"2020-12-30:16","temp":53,"station":"AR704","elev_angle":29.42,"app_temp":53,"postal_code":"30909"}]
```

## Handling Invalid Input

The underlying weatherbit.io returns a status code of 204 with no data when the zip code provided is invalid.

This API will return a 500 error when a single zip request returns any unexpected value from weatherbit.io, including
the 204 mentioned above.

Here's an example:

```http
http://localhost:3000/weather?zip=bogus
```

which returns

```text
Unexpected response getting weather for zip code bogus
```

For multi-zip queries, I wanted to return all the valid data available and still indicate that some data was missing.
To do this, I use an `undefined` element in the returned JSON array, like this:

```http
http://localhost:3000/weather?zip=bogus&zip=55113
```

returns

```json
[null,{"rh":79,"pod":"d","lon":-93.1571,"pres":972.7,"timezone":"America/Chicago","ob_time":"2020-12-30 15:40","country_code":"US","clouds":100,"ts":1609342800,"solar_rad":45.1,"state_code":"MN","city_name":"Roseville","wind_spd":15,"wind_cdir_full":"west","wind_cdir":"W","slp":1009.1,"vis":3.1,"h_angle":-36,"sunset":"22:40","dni":620.71,"dewpt":18.4,"snow":0,"uv":0.9273571,"precip":0,"wind_dir":270,"sunrise":"13:50","ghi":225.75,"dhi":69.39,"aqi":54,"lat":45.0139,"weather":{"icon":"c04d","code":804,"description":"Overcast clouds"},"datetime":"2020-12-30:16","temp":24,"station":"HPN30","elev_angle":15.32,"app_temp":11.4,"postal_code":"55113"}]
```

## Swagger UI documentation

API docs using the Swagger UI are at `http://localhost:3000/api-docs`.
