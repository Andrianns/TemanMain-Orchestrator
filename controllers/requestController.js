require('dotenv').config();

const axios = require('axios');
const fetch = require('node-fetch');
const redis = require('../helper/redis.js');
const baseURLApp = process.env.BASE_URL_APP;
//'https://temanmain-app-production.up.railway.app';
const baseURLUser = process.env.BASE_URL_USER;
// 'https://temanmain-user-production.up.railway.app';
class RequestController {
  static async createRequest(req, res) {
    try {
      const { eventId, magnetId } = req.params;
      const { id: user_id, age, gender } = req.user;
      const { requestDescription } = req.body;
      const { access_token } = req.headers;
      const { data } = await axios({
        method: 'POST',
        url: `${baseURLApp}/requests/event/${eventId}/magnet/${magnetId}`,
        data: {
          requestDescription,
        },
        headers: {
          user_id: user_id,
          target_user_age: age,
          gender: gender,
        },
      });
      const targetUserId = data.magnet.UserId;
      // console.log(data, "<<<<<<<<<<<<");
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
      const targetUser = usersCache.find((el) => el.id === targetUserId);
      const currentUser = usersCache.find((el) => el.id === user_id);

      let eventsCache = await redis.get('event:events');
      if (eventsCache) {
        // console.log("CACHE");
        eventsCache = JSON.parse(eventsCache);
        await redis.del('event:events');
      } else {
        // console.log("axiois");
        const { data: events, status } = await axios({
          method: 'GET',
          url: `${baseURLApp}/events`,
        });
        eventsCache = events;
        await redis.set('event:events', JSON.stringify(events));
        await redis.del('event:events');
      }
      const targetEvent = eventsCache.find((el) => el.id === +eventId);
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer pk_prod_R6NNEYEZ5QMY2CNTVK56Z4DFCNJ4',
        },
        body: JSON.stringify({
          message: {
            to: {
              email: targetUser.email,
            },
            template: '9ZSCQ6QT3R4M8WND42V6C4350HF8',
            data: {
              name: currentUser.firstName,
              userTargetName: targetUser.firstName,
              url: targetEvent.eventHomepageLink,
              eventName: targetEvent.name,
              imageLink: targetEvent.image,
            },
          },
        }),
      };

      fetch('https://api.courier.com/send', options)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      res.status(201).json(data);
    } catch (error) {
      console.log(error);
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
  static async editRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { id: user_id } = req.user;
      const { requestDescription } = req.body;
      const { data } = await axios({
        method: 'PUT',
        url: `${baseURLApp}/requests/${requestId}`,
        data: {
          requestDescription,
        },
        headers: {
          user_id: user_id,
        },
      });
      res.status(200).json(data);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async getRequestByUserId(req, res) {
    try {
      const { id: userId } = req.user;
      const { access_token } = req.headers;

      const { data } = await axios({
        method: 'GET',
        url: `${baseURLApp}/requests/user`,
        headers: {
          user_id: userId,
        },
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
      data.forEach((el) => {
        const targetUser = usersCache.find((user) => el.UserId === user.id);
        el.User = targetUser;
      });
      res.status(200).json(data);
    } catch (error) {
      console.log(error, '<<<<<<');
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
  static async acceptRequest(req, res) {
    try {
      const { access_token } = req.headers;
      const { requestId } = req.params;
      const { id: user_id } = req.user;
      const { data } = await axios({
        method: 'PUT',
        url: `${baseURLApp}/requests/${requestId}/accept`,
        headers: {
          user_id: user_id,
        },
      });

      const { data: targetRequest } = await axios({
        method: 'GET',
        url: `${baseURLApp}/requests/public/${requestId}`,
        headers: {
          user_id: user_id,
        },
      });

      let eventsCache = await redis.get('event:events');
      if (eventsCache) {
        // console.log("CACHE");
        eventsCache = JSON.parse(eventsCache);
        await redis.del('event:events');
      } else {
        // console.log("axiois");
        const { data: events, status } = await axios({
          method: 'GET',
          url: `${baseURLApp}/events`,
        });
        eventsCache = events;
        await redis.set('event:events', JSON.stringify(events));
        await redis.del('event:events');
      }
      const targetEvent = eventsCache.find(
        (el) => el.id === +targetRequest.EventId
      );
      const targetUserId = targetRequest.UserId;
      // console.log(data, "<<<<<<<<<<<<");
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
      const targetUser = usersCache.find((el) => el.id === targetUserId);
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer pk_prod_R6NNEYEZ5QMY2CNTVK56Z4DFCNJ4',
        },
        body: JSON.stringify({
          message: {
            to: {
              email: targetUser.email,
            },
            template: 'GN5MF7NE0FMEHJNNMV07DJM70Y15',
            data: {
              userTargetName: targetUser.firstName,
              url: targetEvent.eventHomepageLink,
              eventName: targetEvent.name,
              imageLink: targetEvent.image,
            },
          },
        }),
      };

      fetch('https://api.courier.com/send', options)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      res.status(200).json(data);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
  static async removeRequested(req, res) {
    try {
      const { requestId } = req.params;
      const { access_token } = req.headers;
      const { id: user_id } = req.user;
      const { data } = await axios({
        method: 'PUT',
        url: `${baseURLApp}/requests/${requestId}/reject`,
        headers: {
          user_id: user_id,
        },
      });
      const { data: targetRequest } = await axios({
        method: 'GET',
        url: `${baseURLApp}/requests/public/${requestId}`,
        headers: {
          user_id: user_id,
        },
      });
      const targetUserId = +targetRequest.UserId;
      const currentUserId = +user_id;
      let eventsCache = await redis.get('event:events');
      if (eventsCache) {
        // console.log("CACHE");
        eventsCache = JSON.parse(eventsCache);
        await redis.del('event:events');
      } else {
        // console.log("axiois");
        const { data: events, status } = await axios({
          method: 'GET',
          url: `${baseURLApp}/events`,
        });
        eventsCache = events;
        await redis.set('event:events', JSON.stringify(events));
        await redis.del('event:events');
      }
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
      const targetUser = usersCache.find((el) => el.id === targetUserId);
      const currentUser = usersCache.find((el) => el.id === currentUserId);
      const targetEvent = eventsCache.find(
        (el) => el.id === +targetRequest.EventId
      );

      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer pk_prod_R6NNEYEZ5QMY2CNTVK56Z4DFCNJ4',
        },
        body: JSON.stringify({
          message: {
            to: {
              email: targetUser.email,
            },
            template: 'S2GFFQSR6TMNZ8MGRZW3K832HGPR',
            data: {
              userTargetName: targetUser.firstName,
              name: currentUser.firstName,
              url: targetEvent.eventHomepageLink,
              eventName: targetEvent.name,
              imageLink: targetEvent.image,
            },
          },
        }),
      };

      fetch('https://api.courier.com/send', options)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      res.status(200).json(data);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
}

module.exports = RequestController;
