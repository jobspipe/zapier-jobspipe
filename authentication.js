const testAuth = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.jobspipe.dev/v1/account',
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new z.errors.Error('Invalid API key', 'AuthenticationError', response.status);
  }

  return response.data;
};

const addBearerHeader = (request, z, bundle) => {
  if (bundle.authData.apiKey) {
    request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`;
  }
  return request;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText:
        'Your JobsPipe API key. Get one at https://jobspipe.dev/dashboard. It starts with `jp_live_` for production keys.',
    },
  ],
  test: testAuth,
  connectionLabel: (z, bundle) => {
    const account = bundle.inputData;
    if (account && account.email) {
      const plan = account.plan_name || 'Free';
      return `${account.email} (${plan})`;
    }
    return 'JobsPipe Account';
  },
};
