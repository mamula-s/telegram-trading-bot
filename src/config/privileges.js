const privilegedUserIds = process.env.PRIVILEGED_USER_IDS
  ? process.env.PRIVILEGED_USER_IDS.split(',').map(id => id.trim())
  : [];

const developerId = process.env.DEVELOPER_ID;

module.exports = {
  privilegedUserIds,
  developerId
};