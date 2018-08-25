const log = require('./log');
const {
  createResponse,
  fetchUserData,
} = require('./utils');

const authenticate = (req, res) => {
  log.debug({ name: 'REQUEST_IN', body: req.body });
  const token = req.body && req.body.spec && req.body.spec.token;

  if (typeof token !== 'string') {
    log.info({ name: 'INVALID_PAYLOAD', token, payload: req.body });
    return res
      .status(401)
      .send(createResponse(false));
  }

  return fetchUserData(token)
    .then((userData) => {
      log.info({ name: 'AUTHENTICATED', userData }, 'User successfully authenticated');
      const response = createResponse(true, userData);
      log.debug({ name: 'RESPONSE', response });
      return res
        .status(200)
        .send(response);
    })
    .catch((err) => {
      if (err.statusCode === 401) {
        log.info(err);
      } else {
        log.error(err);
      }

      return res
        .status(401)
        .send(createResponse(false));
    });
};

module.exports = {
	authenticate,
};
