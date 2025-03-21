require('dotenv').config();

const redis = require('../helper/redis.js');
const axios = require('axios');
const baseURL = process.env.BASE_URL_APP;
//'https://temanmain-app-production.up.railway.app';
class CategoryController {
  static async readAllCategory(req, res) {
    try {
      const categoriesCache = await redis.get('app:categories');

      if (categoriesCache) {
        const categories = JSON.parse(categoriesCache);

        res.status(200).json(categories);
      } else {
        const { data: categories } = await axios({
          method: 'GET',
          url: `${baseURL}/categories`,
        });

        await redis.set('app:categories', JSON.stringify(categories));

        res.status(200).json(categories);
      }
    } catch (error) {
      console.log(error, '<< error');

      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }

  static async createCategory(req, res) {
    try {
      const data = req.body;

      const { data: newCategory } = await axios({
        method: 'POST',
        url: `${baseURL}/categories`,
        data,
      });

      await redis.del('app:categories');

      res.status(201).json(newCategory);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const data = req.body;

      const { data: category } = await axios({
        method: 'PUT',
        url: `${baseURL}/categories/` + categoryId,
        data,
      });

      await redis.del('app:categories');

      res.status(200).json(category);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;

      const { data: category } = await axios({
        method: 'DELETE',
        url: `${baseURL}/categories/` + categoryId,
      });

      await redis.del('app:categories');

      res.status(200).json(category);
    } catch (error) {
      const { status, data } = error.response;

      res.status(status).json(data);
    }
  }
  static async fetchOneCategory(req, res) {
    try {
      const { categoryId } = req.params;

      let categoriesCache = await redis.get('app:categories');
      let categories = [];
      if (categoriesCache) {
        categories = JSON.parse(categoriesCache);
      } else {
        const { data: categoriesData } = await axios({
          method: 'GET',
          url: `${baseURL}/categories` + categoryId,
        });

        await redis.set('app:categories', JSON.stringify(categories));

        categories = categoriesData;
      }
      const targetCategory = categories.find((el) => el.id === +categoryId);
      if (!targetCategory) {
        throw {
          response: {
            status: 404,
            data: {
              message: 'Category Not Found',
            },
          },
        };
      }
      res.status(200).json(targetCategory);
    } catch (error) {
      const { status, data } = error.response;
      res.status(status).json(data);
    }
  }
}

module.exports = CategoryController;
