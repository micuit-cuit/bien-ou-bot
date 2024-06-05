const dotenv = require('dotenv');
dotenv.config({ path: __dirname + "/config/.env" });
const { login, get } = require('./src/bobAPI.js');
