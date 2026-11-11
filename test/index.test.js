const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

describe('App', () => {
  it('should have authentication defined', () => {
    expect(App.authentication).toBeDefined();
    expect(App.authentication.type).toBe('custom');
  });

  it('should have triggers defined', () => {
    expect(App.triggers).toBeDefined();
    expect(App.triggers.newJob).toBeDefined();
  });

  it('should have searches defined', () => {
    expect(App.searches).toBeDefined();
    expect(App.searches.findJobs).toBeDefined();
    expect(App.searches.findCompany).toBeDefined();
  });

  it('should have correct version', () => {
    expect(App.version).toBeDefined();
  });

  it('should have correct platform version', () => {
    expect(App.platformVersion).toBeDefined();
  });
});
