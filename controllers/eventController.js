const redis = require('../helper/redis');
require('dotenv').config();
const axios = require('axios');
const baseURL = process.env.BASE_URL_APP;
//'https://temanmain-app-production.up.railway.app';
const baseURLUser = process.env.BASE_URL_USER;
//'https://temanmain-user-production.up.railway.app';

class EventController {
  static async getAllEvents(req, res) {
    try {
      let eventsCache = await redis.get('event:events');
      if (eventsCache) {
        // console.log("CACHE");
        eventsCache = JSON.parse(eventsCache);
        await redis.del('event:events');
      } else {
        // console.log("axiois");
        const { data: events, status } = await axios({
          method: 'GET',
          url: `${baseURL}/events`,
        });
        eventsCache = events;
        await redis.set('event:events', JSON.stringify(events));
        await redis.del('event:events');
      }
      let usersCache = await redis.get('user:users');
      if (usersCache) {
        // console.log("CACHE");
        usersCache = JSON.parse(usersCache);
        await redis.del('user:users');
      } else {
        // console.log("axiois");
        const { data: users } = await axios({
          method: 'GET',
          url: `${baseURLUser}/users/public`,
        });
        usersCache = users;
        await redis.set('user:users', JSON.stringify(users));
        await redis.del('user:users');
      }
      // console.log(usersCache);
      // console.log(eventsCache);
      eventsCache.forEach((event) => {
        const User = usersCache.filter((el) => el.id === event.AdminId);
        event.Admin = User;
      });
      res.status(200).json(eventsCache);
    } catch (error) {
      console.log(error);
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
  static async findOneEvent(req, res) {
    try {
      const { access_token } = req.headers;
      const { eventId } = req.params;
      const { data: event, status } = await axios({
        method: 'GET',
        url: `${baseURL}/events/${eventId}`,
      });
      let usersCache = await redis.get('user:users');
      if (usersCache) {
        // console.log("CACHE");
        usersCache = JSON.parse(usersCache);
      } else {
        // console.log("axiois");
        const { data: users } = await axios({
          method: 'GET',
          url: `${baseURLUser}/users/public`,
        });
        usersCache = users;
        await redis.set('user:users', JSON.stringify(users));
      }
      const admin = usersCache.find((el) => el.id);
      event.Magnets.forEach((magnet) => {
        const userTarget = usersCache.find((user) => user.id === magnet.UserId);
        magnet.User = userTarget;
      });
      res.status(200).json(event);
    } catch (error) {
      console.log(error, '<<<<<<<<');
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
  static async getEventsbyCategory(req, res) {
    try {
      const { categoryId } = req.params;
      let categoriesCache = await redis.get('app:categories');

      if (categoriesCache) {
        categoriesCache = JSON.parse(categoriesCache);
      } else {
        const { data: categories } = await axios({
          method: 'GET',
          url: `${baseURL}/categories`,
        });
        await redis.set('app:categories', JSON.stringify(categories));
        categoriesCache = categories;
      }
      const targetCategory = categoriesCache.find(
        (el) => el.id === +categoryId
      );
      let eventsCache = await redis.get('event:events');
      if (eventsCache) {
        eventsCache = JSON.parse(eventsCache);
      } else {
        const { data: events, status } = await axios({
          method: 'GET',
          url: `${baseURL}/events`,
        });
        eventsCache = events;
        await redis.set('event:events', JSON.stringify(events));
        // await redis.del("event:events");
      }
      eventsCache = eventsCache.filter(
        (el) => el.CategoryId === targetCategory.id
      );
      let usersCache = await redis.get('user:users');
      if (usersCache) {
        // console.log("CACHE");
        usersCache = JSON.parse(usersCache);
      } else {
        // console.log("axiois");
        const { data: users } = await axios({
          method: 'GET',
          url: `${baseURLUser}/users/public`,
        });
        usersCache = users;
        await redis.set('user:users', JSON.stringify(users));
      }
      eventsCache.forEach((event) => {
        const User = usersCache.filter((el) => el.id === event.AdminId);
        event.Admin = User;
      });
      res.status(200).json(eventsCache);
    } catch (error) {
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
  static async createEvent(req, res) {
    try {
      const {
        CategoryId,
        name,
        location,
        description,
        eventDate,
        eventHomepageLink,
        eventDuration,
        image,
        ticketPrice,
      } = req.body;
      const { id: User } = req.user;
      const { data: message, status } = await axios.post(`${baseURL}/events`, {
        CategoryId,
        name,
        location,
        description,
        eventDate,
        eventHomepageLink,
        eventDuration,
        image,
        ticketPrice,
        User,
      });
      await redis.del('event:events');
      res.status(status).json(message);
    } catch (error) {
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
  static async editEvent(req, res) {
    try {
      const { eventId } = req.params;
      const {
        CategoryId,
        name,
        location,
        description,
        eventDate,
        eventHomepageLink,
        eventDuration,
        image,
        ticketPrice,
      } = req.body;
      const { data: message, status } = await axios.put(
        `${baseURL}/events/${eventId}`,
        {
          CategoryId,
          name,
          location,
          description,
          eventDate,
          eventHomepageLink,
          eventDuration,
          image,
          ticketPrice,
        }
      );
      await redis.del('event:events');
      res.status(status).json(message);
    } catch (error) {
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
  static async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const { data: message, status } = await axios.delete(
        `${baseURL}/events/${eventId}`
      );
      await redis.del('event:events');
      res.status(status).json(message);
    } catch (error) {
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
}

module.exports = EventController;
