const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('Find Jobs Search', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should search jobs with multiple filters', async () => {
    const mockResponse = {
      metadata: {
        total_results: 1,
        credits_charged: 1,
      },
      data: [
        {
          id: 'job-123',
          job_title: 'Senior Data Scientist',
          company: 'Data Inc',
          company_domain: 'datainc.com',
          url: 'https://datainc.com/jobs/123',
          location: 'New York, NY',
          country: 'United States',
          country_code: 'US',
          remote: false,
          seniority: 'senior',
          employment_statuses: ['full_time'],
          technology_slugs: ['python', 'tensorflow'],
          keyword_slugs: ['machine-learning', 'ai'],
          date_posted: '2026-11-01T10:00:00Z',
          discovered_at: '2026-11-01T11:00:00Z',
          status: 'active',
          description: 'Looking for a senior data scientist...',
          salary_min: 150000,
          salary_max: 200000,
          salary_currency: 'USD',
          sources: [],
        },
      ],
    };

    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search', (body) => {
        return (
          body.job_title_or &&
          body.job_title_or[0] === 'data scientist' &&
          body.seniority_or &&
          body.seniority_or[0] === 'senior' &&
          body.job_country_code_or &&
          body.job_country_code_or[0] === 'US' &&
          body.limit === 10
        );
      })
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        keyword: 'data scientist',
        seniority: 'senior',
        country_code: 'US',
        limit: 10,
      },
    };

    const results = await appTester(
      App.searches.findJobs.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('job-123');
    expect(results[0].seniority).toBe('senior');
  });

  it('should use default limit when not specified', async () => {
    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search', (body) => {
        return body.limit === 25;
      })
      .reply(200, {
        metadata: { total_results: 0, credits_charged: 0 },
        data: [],
      });

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {},
    };

    const results = await appTester(
      App.searches.findJobs.operation.perform,
      bundle
    );

    expect(results).toHaveLength(0);
  });

  it('should handle company domain filter', async () => {
    const mockResponse = {
      metadata: {
        total_results: 1,
        credits_charged: 1,
      },
      data: [
        {
          id: 'job-456',
          job_title: 'Product Manager',
          company: 'Example Corp',
          company_domain: 'example.com',
          url: 'https://example.com/jobs/456',
          location: 'San Francisco, CA',
          country: 'United States',
          country_code: 'US',
          remote: false,
          seniority: 'mid',
          employment_statuses: ['full_time'],
          technology_slugs: [],
          keyword_slugs: [],
          date_posted: '2026-11-01T10:00:00Z',
          discovered_at: '2026-11-01T11:00:00Z',
          status: 'active',
          description: 'Product manager role...',
          sources: [],
        },
      ],
    };

    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search', (body) => {
        return (
          body.company_domain_or &&
          body.company_domain_or[0] === 'example.com'
        );
      })
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        company_domain: 'example.com',
      },
    };

    const results = await appTester(
      App.searches.findJobs.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    expect(results[0].company_domain).toBe('example.com');
  });
});
