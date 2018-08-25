const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const log = require('./log');

const {
  authenticate
} = require('./middleware');

const port = (process.env.PORT || '3000');
const app = express();

app.use(bodyParser.json());
app.get('/', (req, res) => {
  log.info({ name: 'HEALTH_OK' }, 'Health reported');
  res.status(200).send('OK');
});

app.post('/authenticate', authenticate);
app.use((err, req, res, next) => {
	log.error(err);
	res.status(500).send({
		msg: 'Unexpected server error'
	});
});

const server = http.createServer(app);
server.listen(port, () => {
  log.info({ name: 'READY', address: server.address() }, 'Listening');
});

