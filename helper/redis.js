const Redis = require('ioredis');

const redis = new Redis({
  port: 19698,
  host: 'redis-19698.c299.asia-northeast1-1.gce.cloud.redislabs.com',
  password: 'HJCEunzbxrKA6P8pObAyX17zuZFfYZ6T',
});

module.exports = redis;
