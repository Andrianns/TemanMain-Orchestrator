require('dotenv').config();

const Redis = require('ioredis');

const redis = new Redis({
  port: process.env.PORT_REDIS,
  host: process.env.HOST_REDIS,
  password: process.env.PASSWORD_REDIS,
});

module.exports = redis;
