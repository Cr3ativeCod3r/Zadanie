require('dotenv').config({ path: '../.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 1337;

app.use(cors());


const ENVIRONMENT_ID = process.env.ENVIRONMENT_ID;
const ACCESS_KEY = process.env.ACCESS_KEY;


app.get('/', (req, res) => {
  const payload = {
    aud: ENVIRONMENT_ID,
    iat: Math.floor(Date.now() / 1000),
    sub: 'user-1',
    user: {
      email: 'adam@kowalski.com',
      name: 'zaliczenieLab'
    },
    auth: {
      collaboration: {
        '*': {
          role: 'writer'
        }
      }
    }
  };

  const token = jwt.sign(payload, ACCESS_KEY, { 
    algorithm: 'HS256'
  });

  res.set('Content-Type', 'text/plain');
  res.send(token);
});

app.listen(PORT, () => {
  console.log(`Token endpoint listening on port ${PORT}`);
});