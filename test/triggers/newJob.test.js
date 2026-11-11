const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('New Job Trigger', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch new jobs with keyword filter', async () => {
    const mockResponse = {
      metadata: {
        total_results: 2,
        credits_charged: 2,
      },
      data: [
        {
          id: '6caa6709-30c2-436c-85a1-4d16f711393f',
          job_title: 'Software Engineer',
          company: 'Tech Corp',
          company_domain: 'techcorp.com',
          url: 'https://techcorp.com/jobs/123',
          location: 'San Francisco, CA',
          country: 'United States',
          country_code: 'US',
          remote: false,
          seniority: 'mid',
          employment_statuses: ['full_time'],
          technology_slugs: ['javascript', 'react'],
          keyword_slugs: ['frontend', 'react'],
          date_posted: '2026-11-01T10:00:00Z',
          discovered_at: '2026-11-01T11:00:00Z',
          status: 'active',
          description: 'We are looking for a software engineer...',
          salary_min: 120000,
          salary_max: 180000,
          salary_currency: 'USD',
          sources: [
            {
              provider: 'greenhouse',
              url: 'https://techcorp.com/jobs/123',
              seen_at: '2026-11-01T11:00:00Z',
            },
          ],
        },
        {
          id: '7dbb7810-41d3-547d-96b2-5e27g822404g',
          job_title: 'Senior Software Engineer',
          company: 'Startup Inc',
          company_domain: 'startup.io',
          url: 'https://startup.io/careers/456',
          location: 'Remote',
          country: 'United States',
          country_code: 'US',
          remote: true,
          seniority: 'senior',
          employment_statuses: ['full_time'],
          technology_slugs: ['python', 'django'],
          keyword_slugs: ['backend', 'api'],
          date_posted: '2026-11-02T14:30:00Z',
          discovered_at: '2026-11-02T15:00:00Z',
          status: 'active',
          description: 'Join our backend team...',
          salary_min: 150000,
          salary_max: 220000,
          salary_currency: 'USD',
          sources: [
            {
              provider: 'lever',
              url: 'https://startup.io/careers/456',
              seen_at: '2026-11-02T15:00:00Z',
            },
          ],
        },
      ],
    };

    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search', (body) => {
        return (
          body.job_title_or &&
          body.job_title_or[0] === 'software engineer' &&
          body.posted_at_max_age_days === 30
        );
      })
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        keyword: 'software engineer',
      },
    };

    const results = await appTester(
      App.triggers.newJob.operation.perform,
      bundle
    );

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('6caa6709-30c2-436c-85a1-4d16f711393f');
    expect(results[0].job_title).toBe('Software Engineer');
    expect(results[1].id).toBe('7dbb7810-41d3-547d-96b2-5e27g822404g');
    expect(results[1].remote).toBe(true);
  });

  it('should fetch jobs with remote filter', async () => {
    const mockResponse = {
      metadata: {
        total_results: 1,
        credits_charged: 1,
      },
      data: [
        {
          id: 'remote-job-123',
          job_title: 'Remote Developer',
          company: 'Remote First',
          company_domain: 'remotefirst.com',
          url: 'https://remotefirst.com/jobs/123',
          location: 'Remote',
          country: 'United States',
          country_code: 'US',
          remote: true,
          seniority: 'mid',
          employment_statuses: ['full_time'],
          technology_slugs: [],
          keyword_slugs: [],
          date_posted: '2026-11-05T10:00:00Z',
          discovered_at: '2026-11-05T11:00:00Z',
          status: 'active',
          description: 'Remote position available...',
          sources: [],
        },
      ],
    };

    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search', (body) => {
        return body.remote === true;
      })
      .reply(200, mockResponse);

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {
        remote: true,
      },
    };

    const results = await appTester(
      App.triggers.newJob.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    expect(results[0].remote).toBe(true);
  });

  it('should handle empty results', async () => {
    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search')
      .reply(200, {
        metadata: {
          total_results: 0,
          credits_charged: 0,
        },
        data: [],
      });

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {},
    };

    const results = await appTester(
      App.triggers.newJob.operation.perform,
      bundle
    );

    expect(results).toHaveLength(0);
  });

  it('should handle API errors', async () => {
    nock('https://api.jobspipe.dev')
      .post('/v1/jobs/search')
      .reply(429, {
        error: 'Rate limit exceeded',
      });

    const bundle = {
      authData: {
        apiKey: 'jp_live_test_key',
      },
      inputData: {},
    };

    await expect(
      appTester(App.triggers.newJob.operation.perform, bundle)
    ).rejects.toThrow();
  });
});
