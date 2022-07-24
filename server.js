// берём Express
let express = require('express');

// создаём Express-приложение
let app = express();

// создаём маршрут для главной страницы
// http://localhost:8080/
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/styles.css', function (req, res) {
    res.sendFile(__dirname + '/styles.css');
});

app.get('/app.js', function (req, res) {
    res.sendFile(__dirname + '/app.js');
});

app.get('/icons/location.svg', function (req, res) {
    res.sendFile(__dirname + '/icons/location.svg');
});
// запускаем сервер на порту 8080
app.listen(8080);
// отправляем сообщение
console.log('Сервер стартовал!');