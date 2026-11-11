const authentication = require('./authentication');
const newJobTrigger = require('./triggers/newJob');
const findJobsSearch = require('./searches/findJobs');
const findCompanySearch = require('./searches/findCompany');

const addAuthToRequest = (request, z, bundle) => {
  if (bundle.authData.apiKey) {
    request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`;
  }
  return request;
};

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [addAuthToRequest],

  triggers: {
    [newJobTrigger.key]: newJobTrigger,
  },

  searches: {
    [findJobsSearch.key]: findJobsSearch,
    [findCompanySearch.key]: findCompanySearch,
  },

  creates: {},
};
