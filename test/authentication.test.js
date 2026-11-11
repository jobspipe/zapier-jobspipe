const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../index');

const appTester = zapier.createAppTester(App);

describe('Authentication', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should authenticate successfully with valid API key', async () => {
    nock('https://api.jobspipe.dev')
      .get('/v1/account')
      .reply(200, {
        email: 'test@example.com',
        plan_name: 'Pro',
        credits_remaining: 1000,
      });

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
    };

    const result = await appTester(App.authentication.test, bundle);

    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
    expect(result.plan_name).toBe('Pro');
  });

  it('should fail authentication with invalid API key', async () => {
    nock('https://api.jobspipe.dev')
      .get('/v1/account')
      .reply(401, {
        error: 'Invalid API key',
      });

    const bundle = {
      authData: {
        apiKey: 'invalid_key',
      },
    };

    await expect(appTester(App.authentication.test, bundle)).rejects.toThrow();
  });

  it('should create connection label from account data', () => {
    const bundle = {
      inputData: {
        email: 'test@example.com',
        plan_name: 'Pro',
      },
    };

    const label = App.authentication.connectionLabel({}, bundle);
    expect(label).toBe('test@example.com (Pro)');
  });

  it('should create default connection label when no account data', () => {
    const bundle = {
      inputData: {},
    };

    const label = App.authentication.connectionLabel({}, bundle);
    expect(label).toBe('JobsPipe Account');
  });
});
