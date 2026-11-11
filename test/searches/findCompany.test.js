const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('Find Company Search', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should find company by domain', async () => {
    const mockResponse = {
      key: '9002',
      name: 'Google',
      domain: 'google.com',
      url: 'https://google.com',
      logo: 'https://example.com/logo.png',
      employee_count: 190000,
      linkedin_url: 'https://www.linkedin.com/company/google',
      description: 'Technology company specializing in Internet-related services.',
      location: {
        street: '1600 Amphitheatre Parkway',
        city: 'Mountain View',
        region: 'California',
        postal_code: '94043',
        country: 'US',
      },
      founded: '1998',
    };

    nock('https://api.jobspipe.dev')
      .get('/v1/companies/google.com')
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        key: 'google.com',
      },
    };

    const results = await appTester(
      App.searches.findCompany.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Google');
    expect(results[0].domain).toBe('google.com');
    expect(results[0].employee_count).toBe(190000);
    expect(results[0].location_city).toBe('Mountain View');
  });

  it('should find company by name', async () => {
    const mockResponse = {
      key: '1234',
      name: 'Stripe',
      domain: 'stripe.com',
      url: 'https://stripe.com',
      logo: null,
      employee_count: 8000,
      linkedin_url: 'https://www.linkedin.com/company/stripe',
      description: 'Online payment processing platform.',
      location: {
        street: null,
        city: 'San Francisco',
        region: 'California',
        postal_code: null,
        country: 'US',
      },
      founded: '2010',
    };

    nock('https://api.jobspipe.dev')
      .get('/v1/companies/Stripe')
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        key: 'Stripe',
      },
    };

    const results = await appTester(
      App.searches.findCompany.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Stripe');
    expect(results[0].domain).toBe('stripe.com');
  });

  it('should handle company not found with suggestions', async () => {
    const mockResponse = {
      error: 'Company not found',
      candidates: [
        {
          name: 'Acme Corp',
          domain: 'acme.com',
        },
        {
          name: 'Acme Inc',
          domain: 'acmeinc.com',
        },
      ],
    };

    nock('https://api.jobspipe.dev')
      .get('/v1/companies/acme')
      .reply(404, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        key: 'acme',
      },
    };

    await expect(
      appTester(App.searches.findCompany.operation.perform, bundle)
    ).rejects.toThrow(/Did you mean/);
  });

  it('should handle company not found without suggestions', async () => {
    nock('https://api.jobspipe.dev')
      .get('/v1/companies/nonexistent.com')
      .reply(404, {
        error: 'Company not found',
        candidates: [],
      });

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        key: 'nonexistent.com',
      },
    };

    await expect(
      appTester(App.searches.findCompany.operation.perform, bundle)
    ).rejects.toThrow('Company not found');
  });

  it('should require key parameter', async () => {
    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {},
    };

    await expect(
      appTester(App.searches.findCompany.operation.perform, bundle)
    ).rejects.toThrow(/required/);
  });
});
