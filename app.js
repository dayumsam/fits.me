const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    const fs = require('fs');
    fs.readFile('index.html', (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end('Error loading index.html');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
    });
});