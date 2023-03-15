const Redis = require('ioredis');

const redis = new Redis({
  port: 10157,
  host: 'redis-10157.c302.asia-northeast1-1.gce.cloud.redislabs.com',
  password: 'Os83Syd7Z53YaWgv0Qhfnfuz08I1J5nd',
});

module.exports = redis;
