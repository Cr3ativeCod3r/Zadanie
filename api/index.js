require('dotenv').config({ path: '../.env' });

const express = require('express');
const routes = require('./routes/routes');

const app = express();
const PORT = 9001;

app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});