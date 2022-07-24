// import fetch from "node-fetch";


// import moment from "moment";

let temps = [];
let dates = [];
let weatherData = new Map();
let c = 0;

function getData(form) {
    const {elements} = form;
    return Array.from(elements)
        .map((element) => {
            const {name, value} = element;
            return {name, value};
        });
}

function changeVisibility(element) {
    if (element.style.display === "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}

function createTable() {
    let tableSection = document.querySelector('.weather-table-section');
    tableSection.innerHTML = '';
    let table = document.createElement('table');
    table.classList.add('weather-table');
    let head = document.createElement('thead');
    let columns = document.createElement('tr');
    columns.classList.add('weather-table-columns');
    let tableDate = document.createElement('th');
    tableDate.classList.add('weather-table-date');
    tableDate.innerText = 'Day';
    columns.appendChild(tableDate);
    head.appendChild(columns);
    table.appendChild(head);
    let body = document.createElement('tbody');
    let tableMaxTemp = document.createElement('tr');
    let maxTemp = document.createElement('td');
    maxTemp.innerText = 'Max temp.';
    let tableMinTemp = document.createElement('tr');
    let minTemp = document.createElement('td');
    minTemp.innerText = 'Min temp.';
    tableMaxTemp.classList.add('weather-table-maxtemp');
    tableMinTemp.classList.add('weather-table-mintemp');
    tableMaxTemp.appendChild(maxTemp);
    tableMinTemp.appendChild(minTemp);
    body.appendChild(tableMaxTemp);
    body.appendChild(tableMinTemp);
    table.appendChild(body);
    tableSection.appendChild(table);
}

function fillTable() {
    createTable();
    let days = document.querySelector('.weather-table-columns');
    let maxTemps = document.querySelector('.weather-table-maxtemp');
    let minTemps = document.querySelector('.weather-table-mintemp');
    for (let [key, value] of weatherData) {
        let currentDay = document.createElement('th');
        currentDay.innerText = key;
        days.appendChild(currentDay);
        let currentMaxTemp = document.createElement('td');
        currentMaxTemp.innerText = kelvinToCelsius(value.maxTemp).slice(0, -2);
        maxTemps.appendChild(currentMaxTemp);
        let currentMinTemp = document.createElement('td');
        currentMinTemp.innerText = kelvinToCelsius(value.minTemp).slice(0, -2);
        minTemps.appendChild(currentMinTemp);
    }
}

function showCurrentWeather(results) {
    myChart.destroy();
    let tempContainer = document.querySelector('.tempContainer');
    let timeContainer = document.querySelector('.time');
    let currentUTCTime = moment().utc();
    let offsetUTC = results["city"]["timezone"];
    console.log(offsetUTC);
    let displayedTime = currentUTCTime.add(offsetUTC, 'seconds').format("MM-DD-YYYY HH-mm-ss");
    weatherData.clear();
    temps.length = 0;
    dates.length = 0;
    let city = results["city"]["name"];
    let lon = results["city"]["coord"]["lon"];
    let lat = results["city"]["coord"]["lat"];
    timeContainer.style.visibility = 'visible';
    resultsContainer.style.visibility = 'visible';
    tempContainer.style.visibility = 'visible';
    timeContainer.innerHTML = `${displayedTime}`;
    name.innerHTML = `\n ${city}`;
    coords.innerHTML = `${lon} ${lat}`;
    let sunrise = moment.unix(results["city"]["sunrise"]).utc().add(offsetUTC, 'seconds').format("HH-mm");
    let sunset = moment.unix(results["city"]["sunset"]).utc().add(offsetUTC, 'seconds').format("HH-mm");

    for (let forecast of results["list"]) {
        let temp = forecast["main"]["temp"];
        let press = forecast["main"]["pressure"];
        let humid = forecast["main"]["humidity"];
        let imageIcon = forecast["weather"][0]["icon"];
        let date = moment.unix(forecast["dt"]).format("DD-MM-YYYY HH-mm-ss");
        console.log(forecast["dt"]);
        if (c === 0) {
            temperature.innerHTML = `${kelvinToCelsius(temp)}`;
            weatherIcon.src = `https://openweathermap.org/img/wn/${imageIcon}.png`
            pressure.innerHTML = `${hPaTommHg(press)}`;
            humidity.innerHTML = `${humid}%`;
            sun.innerHTML = `Sunrise: ${sunrise} <br> Sunset: ${sunset}`;
        } else {
            temps.push(kelvinToCelsius(temp).slice(0, -2));
            dates.push(date);
        }
        let day = Number(date.slice(0, 2));
        let minTemp = forecast["main"]["temp_min"];
        let maxTemp = forecast["main"]["temp_max"];
        if (weatherData.has(day)) {
            let obj = weatherData.get(day);
            if (minTemp < obj.minTemp) {
                obj.minTemp = minTemp;
            }
            if (maxTemp > obj.maxTemp) {
                obj.maxTemp = maxTemp;
            }
        } else {
            weatherData.set(day, {minTemp: minTemp, maxTemp: maxTemp});
        }

        c++;
    }
    c = 0;

    console.log(temps);
    console.log(dates);
    console.log(weatherData);
    console.log(c);

    fillTable();
    drawChart();
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
    return await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`)
        .then(resp => resp.json())
        .then(results => showCurrentWeather(results));
}

async function sendCoordinatesData([lat, lon]) {
    return await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`)
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
    let celsius = Number((degrees - 273.15).toFixed(0));
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
let sun = document.querySelector('#sunrise-sunset');
let weatherIcon = document.getElementById('weather-icon');
form.addEventListener('submit', handleFormSubmit);

document.getElementById('currentLoc').onclick = () => {
    navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});
};

document.querySelector('.chartButton').onclick = () => {
    let x = document.querySelector(".chartContainer");
    changeVisibility(x);
}

document.querySelector('.weather-table-button').onclick = () => {
    let x = document.querySelector(".weather-table-section");
    changeVisibility(x);
}

let ctx = document.querySelector('#tempChart').getContext('2d');
let myChart = new Chart();

function drawChart() {
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{label: 'Temps', data: temps, backgroundColor: ['rgba(227, 120, 97)']}]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

