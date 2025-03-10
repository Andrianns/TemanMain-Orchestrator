require('dotenv').config();

const redis = require('../helper/redis.js');
const axios = require('axios');
const baseURLApp = process.env.BASE_URL_APP;
//'https://temanmain-app-production.up.railway.app';
const baseURLUser = process.env.BASE_URL_USER;
//'https://temanmain-user-production.up.railway.app';
class MagnetController {
  static async readAllMagnet(req, res) {
    try {
      const magnetCache = await redis.get('app:magnets');

      if (magnetCache) {
        const magnets = JSON.parse(magnetCache);

        res.status(200).json(magnets);
      } else {
        const { data: magnets } = await axios({
          method: 'GET',
          url: `${baseURLApp}/magnets`,
        });

        await redis.set('app:magnets', JSON.stringify(magnets));

        res.status(200).json(magnets);
      }
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async readMagnetById(req, res) {
    try {
      const { id: userId } = req.user;

      const { data: magnets } = await axios({
        method: 'GET',
        url: `${baseURLApp}/magnets/user`,
        headers: {
          user_id: userId,
        },
      });

      res.status(200).json(magnets);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async createMagnet(req, res) {
    try {
      const data = req.body;
      data.UserId = req.user.id;

      const { data: newMagnet } = await axios({
        method: 'POST',
        url: `${baseURLApp}/magnets`,
        data,
      });

      await redis.del('app:magnets');

      res.status(201).json(newMagnet);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async showMagnet(req, res) {
    try {
      const { magnetId } = req.params;
      const { access_token } = req.headers;
      const { data: magnet } = await axios({
        method: 'GET',
        url: `${baseURLApp}/magnets/` + magnetId,
      });
      let usersCache = await redis.get('user:users');
      if (usersCache) {
        usersCache = JSON.parse(usersCache);
      } else {
        const { data: users } = await axios({
          method: 'GET',
          url: `${baseURLUser}/users`,
          headers: {
            access_token,
          },
        });
        await redis.set('user:users', JSON.stringify(users));
        usersCache = users;
      }
      const creatorMagnet = await usersCache.find(
        (el) => el.id === magnet.UserId
      );
      magnet.Participant.forEach((req) => {
        const reqCreator = usersCache.find((el) => el.id === req.UserId);
        req.User = reqCreator;
      });
      magnet.User = creatorMagnet;
      res.status(200).json(magnet);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async updateMagnet(req, res) {
    try {
      const { magnetId } = req.params;
      const data = req.body;
      const { id: user_id } = req.user;

      const { data: magnet } = await axios({
        method: 'PUT',
        url: `${baseURLApp}/magnets/` + magnetId,
        headers: {
          user_id,
        },
        data,
      });

      await redis.del('app:magnets');

      res.status(200).json(magnet);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async deleteMagnet(req, res) {
    try {
      const { magnetId } = req.params;
      const { id: user_id } = req.user;

      const { data: magnet } = await axios({
        method: 'DELETE',
        url: `${baseURLApp}/magnets/` + magnetId,
        headers: {
          user_id,
        },
      });

      await redis.del('app:magnets');

      res.status(200).json(magnet);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
}

module.exports = MagnetController;
