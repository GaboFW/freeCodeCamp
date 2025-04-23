require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware
app.use((req, res, next) => {
  if (req.method === 'POST') {
    const url = req.body.url;

    if (!url) {
      return res.status(400).json({ error: 'Falta el campo "url" en el cuerpo' });
    }

    try {
      const hostname = new URL(url).hostname;

      dns.lookup(hostname, (err) => {
        if (err) {
          return res.status(400).json({ error: 'URL inválida o dominio no resuelve' });
        }
        next();
      });
    } catch (e) {
      return res.status(400).json({ error: 'URL malformada' });
    }
  } else {
    next();
  }
});

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {};

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const shortUrl = Math.floor(Math.random() * 1000000);

  urlDatabase[shortUrl] = url;

  res.json({ original_url: url, short_url: shortUrl });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  }
  else {
    return res.status(404).json({ error: 'URL no encontrada' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
