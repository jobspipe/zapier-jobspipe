const perform = async (z, bundle) => {
  const key = bundle.inputData.key;

  if (!key) {
    throw new z.errors.Error(
      'Company domain, name, or email is required',
      'InvalidInput',
      400
    );
  }

  const response = await z.request({
    url: `https://api.jobspipe.dev/v1/companies/${encodeURIComponent(key)}`,
    method: 'GET',
    skipThrowForStatus: true,
  });

  if (response.status === 404) {
    const candidates = response.data.candidates || [];
    if (candidates.length > 0) {
      const msg = `Company not found. Did you mean: ${candidates
        .map((c) => `${c.name} (${c.domain})`)
        .join(', ')}`;
      throw new z.errors.Error(msg, 'NotFound', 404);
    }
    throw new z.errors.Error('Company not found', 'NotFound', 404);
  }

  if (response.status !== 200) {
    throw new z.errors.Error(
      `Failed to fetch company: ${response.data.error || 'Unknown error'}`,
      'SearchError',
      response.status
    );
  }

  const company = response.data;

  return [
    {
      key: company.key,
      name: company.name,
      domain: company.domain,
      url: company.url,
      logo: company.logo,
      employee_count: company.employee_count,
      linkedin_url: company.linkedin_url,
      description: company.description,
      location_street: company.location?.street,
      location_city: company.location?.city,
      location_region: company.location?.region,
      location_postal_code: company.location?.postal_code,
      location_country: company.location?.country,
      founded: company.founded,
    },
  ];
};

module.exports = {
  key: 'findCompany',
  noun: 'Company',
  display: {
    label: 'Find Company',
    description: 'Look up a company by domain, name, or email.',
  },
  operation: {
    perform: perform,
    inputFields: [
      {
        key: 'key',
        label: 'Company Domain, Name, or Email',
        type: 'string',
        helpText:
          'Enter a company domain (e.g., "stripe.com"), company name (e.g., "Stripe"), careers URL, or employee email to look up the company profile.',
        required: true,
      },
    ],
    outputFields: [
      { key: 'key', label: 'Company Key', type: 'string' },
      { key: 'name', label: 'Company Name', type: 'string' },
      { key: 'domain', label: 'Domain', type: 'string' },
      { key: 'url', label: 'Website URL', type: 'string' },
      { key: 'logo', label: 'Logo URL', type: 'string' },
      { key: 'employee_count', label: 'Employee Count', type: 'number' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'location_street', label: 'Street Address', type: 'string' },
      { key: 'location_city', label: 'City', type: 'string' },
      { key: 'location_region', label: 'State/Region', type: 'string' },
      { key: 'location_postal_code', label: 'Postal Code', type: 'string' },
      { key: 'location_country', label: 'Country Code', type: 'string' },
      { key: 'founded', label: 'Founded Year', type: 'string' },
    ],
    sample: {
      key: '9002',
      name: 'Google',
      domain: 'google.com',
      url: 'https://google.com',
      logo: null,
      employee_count: 190000,
      linkedin_url: 'https://www.linkedin.com/company/google',
      description: 'Technology company specializing in Internet-related services.',
      location_street: null,
      location_city: 'Mountain View',
      location_region: 'California',
      location_postal_code: null,
      location_country: 'US',
      founded: '1998',
    },
  },
};
