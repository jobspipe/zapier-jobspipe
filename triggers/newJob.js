const perform = async (z, bundle) => {
  const body = {
    limit: 50,
  };

  if (bundle.inputData.keyword) {
    body.job_title_or = [bundle.inputData.keyword];
  }

  if (bundle.inputData.location) {
    body.job_location = bundle.inputData.location;
  }

  if (bundle.inputData.remote !== undefined) {
    body.remote = bundle.inputData.remote === 'true' || bundle.inputData.remote === true;
  }

  if (bundle.inputData.company_domain) {
    body.company_domain_or = [bundle.inputData.company_domain];
  }

  if (bundle.inputData.country_code) {
    body.job_country_code_or = [bundle.inputData.country_code];
  }

  body.posted_at_max_age_days = 30;

  const response = await z.request({
    url: 'https://api.jobspipe.dev/v1/jobs/search',
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (response.status !== 200) {
    throw new z.errors.Error(
      `Failed to fetch jobs: ${response.data.error || 'Unknown error'}`,
      'SearchError',
      response.status
    );
  }

  const jobs = response.data.data || [];

  return jobs.map((job) => ({
    id: job.id,
    job_title: job.job_title,
    company: job.company,
    company_domain: job.company_domain,
    url: job.url,
    location: job.location,
    country: job.country,
    country_code: job.country_code,
    remote: job.remote,
    seniority: job.seniority,
    employment_statuses: job.employment_statuses,
    technology_slugs: job.technology_slugs,
    keyword_slugs: job.keyword_slugs,
    date_posted: job.date_posted,
    discovered_at: job.discovered_at,
    status: job.status,
    description: job.description,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency,
    sources: job.sources,
  }));
};

module.exports = {
  key: 'newJob',
  noun: 'Job',
  display: {
    label: 'New Job Matching Search',
    description: 'Triggers when a new job posting matches your search criteria.',
  },
  operation: {
    type: 'polling',
    perform: perform,
    canPaginate: false,
    inputFields: [
      {
        key: 'keyword',
        label: 'Job Title Keywords',
        type: 'string',
        helpText: 'Search for jobs with this title (e.g., "software engineer", "data scientist").',
        required: false,
      },
      {
        key: 'location',
        label: 'Location',
        type: 'string',
        helpText: 'Filter by location (city, state, or country).',
        required: false,
      },
      {
        key: 'remote',
        label: 'Remote',
        type: 'boolean',
        helpText: 'Filter for remote positions only.',
        required: false,
      },
      {
        key: 'company_domain',
        label: 'Company Domain',
        type: 'string',
        helpText: 'Filter by company domain (e.g., "google.com").',
        required: false,
      },
      {
        key: 'country_code',
        label: 'Country Code',
        type: 'string',
        helpText: 'Two-letter country code (e.g., "US", "GB", "CA").',
        required: false,
      },
    ],
    outputFields: [
      { key: 'id', label: 'Job ID', type: 'string' },
      { key: 'job_title', label: 'Job Title', type: 'string' },
      { key: 'company', label: 'Company Name', type: 'string' },
      { key: 'company_domain', label: 'Company Domain', type: 'string' },
      { key: 'url', label: 'Job URL', type: 'string' },
      { key: 'location', label: 'Location', type: 'string' },
      { key: 'country', label: 'Country', type: 'string' },
      { key: 'country_code', label: 'Country Code', type: 'string' },
      { key: 'remote', label: 'Remote', type: 'boolean' },
      { key: 'seniority', label: 'Seniority Level', type: 'string' },
      { key: 'employment_statuses', label: 'Employment Status', type: 'string' },
      { key: 'date_posted', label: 'Date Posted', type: 'datetime' },
      { key: 'discovered_at', label: 'Discovered At', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'description', label: 'Job Description', type: 'string' },
      { key: 'salary_min', label: 'Minimum Salary', type: 'number' },
      { key: 'salary_max', label: 'Maximum Salary', type: 'number' },
      { key: 'salary_currency', label: 'Salary Currency', type: 'string' },
      { key: 'technology_slugs', label: 'Technologies', type: 'string' },
      { key: 'keyword_slugs', label: 'Keywords', type: 'string' },
    ],
    sample: {
      id: '6caa6709-30c2-436c-85a1-4d16f711393f',
      job_title: 'Director of Finance',
      company: 'Broccoli Inc',
      company_domain: 'broccoli.ai',
      url: 'https://jobs.ashbyhq.com/broccoli/6caa6709-30c2-436c-85a1-4d16f711393f',
      location: 'San Francisco, CA',
      country: 'United States',
      country_code: 'US',
      remote: false,
      seniority: 'director',
      employment_statuses: ['full_time'],
      date_posted: '2026-07-27T17:27:31.444Z',
      discovered_at: '2026-08-03T18:16:04.619757Z',
      status: 'active',
      description: 'We are looking for an experienced Director of Finance...',
      salary_min: 150000,
      salary_max: 200000,
      salary_currency: 'USD',
      technology_slugs: ['excel', 'sql'],
      keyword_slugs: ['accounting', 'financial-modeling', 'excel', 'sql'],
    },
  },
};
