
const config = {};

if (typeof process.env.ASSERT_TEAM_ORGANIZATION === 'string') {
	config.assertTeamOrganization = process.env.ASSERT_TEAM_ORGANIZATION.toLowerCase();
}

module.exports = config;
