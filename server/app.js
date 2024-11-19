const express = require('express');
const port = 5000;
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Если нужно
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    return next();
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
    console.log(`Сервер работает на порту ${port}`);
});