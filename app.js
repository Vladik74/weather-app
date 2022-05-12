// import fetch from "node-fetch";


function getData(form) {
    const {elements} = form;
    return Array.from(elements)
        .map((element) => {
            const {name, value} = element;
            return {name, value};
        });
}

function showCurrentWeather(results) {
    let city = results["name"];
    let lon = results["coord"]["lon"];
    let lat = results["coord"]["lat"];
    let temp = results["main"]["temp"];
    let press = results["main"]["pressure"];
    let humid = results["main"]["humidity"];
    let imageIcon = results["weather"][0]["icon"];
    resultsContainer.style.visibility = 'visible';
    name.innerHTML = `\n ${city}`;
    coords.innerHTML = `${lon} ${lat}`;
    temperature.innerHTML = `${kelvinToCelsius(temp)}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${imageIcon}.png`
    pressure.innerHTML = `${hPaTommHg(press)}`;
    humidity.innerHTML = `${humid}%`;
}

async function getLocation() {
    navigator.geolocation.getCurrentPosition(function ({coords}) {
        const {latitude, longitude} = coords;
        console.log(latitude, longitude);
        return sendCoordinatesData([latitude, longitude]);
    }, function (error) {
        alert(error.message);
    });
}

function success({coords}) {
    const {latitude, longitude} = coords;
    const position = [latitude, longitude];
    return sendCoordinatesData(position);
}

function error({message}) {
    console.log(message);
}

async function sendCityData(city) {
    return await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`)
        .then(resp => resp.json())
        .then(results => showCurrentWeather(results));
}

async function sendCoordinatesData([lat, lon]) {
    return await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`)
        .then(resp => resp.json())
        .then(results => showCurrentWeather(results));
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const data = getData(form);
    const city = data[0].value;
    const resp = await sendCityData(city);
}


function kelvinToCelsius(degrees) {
    let celsius = Number(degrees - 273.15).toFixed(1);
    if (celsius > 0) {
        return `+${celsius}°C`
    }
    return `${celsius}°C`;
}

function hPaTommHg(hpa) {
    let mmHg = Number(hpa / 1.33322387415).toFixed(0);
    return `${mmHg} mmHg`
}

const key = 'ea7fce4aa8a50adb6c69b2a3753591e0';

const form = document.getElementById('weather-form');
let resultsContainer = document.getElementById('resultsContainer');
let name = document.querySelector("#name");
let coords = document.querySelector("#coords");
let temperature = document.querySelector("#temp");
let pressure = document.querySelector("#pressure");
let humidity = document.querySelector("#humidity");
let weatherIcon = document.getElementById('weather-icon');
form.addEventListener('submit', handleFormSubmit);
document.getElementById('currentLoc').onclick = () => {
    navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});
};

