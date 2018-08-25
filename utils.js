const github = require('octonode');
const config = require('./config');
const log = require('./log');

const createResponse = (authenticated, { username, groups } = {}) => {
	if (!authenticated) {
		return {
			apiVersion: 'authentication.k8s.io/v1beta1',
			kind: 'TokenReview',
			status: {
				Authenticated: false,
			},
		};
	}

	return {
    apiVersion: 'authentication.k8s.io/v1beta1',
    kind: 'TokenReview',
    status: {
      authenticated: true,
      user: {
        username: username,
        groups: Array.isArray(groups) ? groups : undefined,
      }
    }
  };
};

const parseUserResponse = ([status, body, headers]) => {
	log.debug({ name: 'USER_RESPONSE', body });
	return body.login;
};

const parseTeamResponse = ([status, body, headers]) => {
	log.debug({ name: 'TEAM_RESPONSE', body });
	return body.reduce((result, team) => {
		const include = (
			!config.assertTeamOrganization
			|| team.organization.login.toLowerCase() === config.assertTeamOrganization
		);
		if (include) {
			result.push(team.slug);
		}
		return result;
	}, []);
};

const handleNoTeamAccess = (err) => {
	if (err.statusCode === 404) {
		log.info({ name: 'NO_TEAM_ACCESS' }, 'Token lacks read:org scope');
		return [];
	}
	throw err;
};

const fetchUserData = (token) => {
  const client = github.client(token);

  return Promise.all([
	  client.getAsync('/user', {}).then(parseUserResponse),
	  client.getAsync('/user/teams', { per_page: 100 })
	  	.then(parseTeamResponse)
	  	.catch(handleNoTeamAccess),
  ]).then(([ username, groups]) => {
  	return {
  		username,
  		groups,
  	};
  });
};

module.exports = {
	createResponse,
	fetchUserData,
};
