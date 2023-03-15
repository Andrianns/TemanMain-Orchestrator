const axios = require('axios');
const baseURL = 'https://temanmain-user-production.up.railway.app';
async function authenticator(req, res, next) {
  try {
    const { access_token } = req.headers;
    if (!access_token) {
      throw {
        response: {
          data: {
            error: 'Please login',
          },
          status: 401,
        },
      };
    }
    const { data: user } = await axios({
      method: 'GET',
      url: `${baseURL}/users/tokenChecker`,
      headers: {
        access_token: access_token,
      },
    });
    // console.log(user, "<<<<<<<<<<<<<<<<<<<<<");
    req.user = user;
    next();
  } catch (error) {
    const { status, data } = error.response;
    res.status(status).json(data);
  }
}

module.exports = authenticator;
