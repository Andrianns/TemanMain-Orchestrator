const Redis = require('ioredis');

const redis = new Redis({
  port: 15952,
  host: 'redis-15952.c1.asia-northeast1-1.gce.redns.redis-cloud.com',
  password: 'ekc6TvdgyHa5L7fGlLLTD3NdymmCq7x1',
});

module.exports = redis;
