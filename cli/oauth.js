const got = require('got');
const url = require('url');
const day = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tmz = require('dayjs/plugin/timezone');

day.extend(utc);
day.extend(tmz);
day.tz.setDefault("Asia/Seoul");

const NOW = day();

module.exports = async (browser) => {
  const {authorizationUrl} = await got('https://shiftee.io/api/accounts/login/oauth/google').json();
  const page = await browser.newPage();

  const [location, email] = await Promise.all([
    new Promise(resolve => {
      page.on('response', response => {
        const {location} = response.headers()
        if (location && location.startsWith('io.shiftee.app')) {
          resolve(location);
        }
      });
    }),
    page.waitForSelector('#hiddenEmail[type=email]').then(elementHandler => elementHandler.evaluate(d => d.value)),
    page.goto(authorizationUrl)
  ]);

  const {query: {code}} = url.parse(location, {parseQueryString: true});

  const {account_auth_token} = await got.post('https://shiftee.io/api/accounts/login/oauth', {
    searchParams: {
      authorizationCode: code,
      provider: 'google'
    }
  })
  .json()
  .catch(e => console.error(e));

  const {companyEmployees: [{employee_id}]} = await got('https://shiftee.io/api/company/employee/all', {
    headers: {
      'Authorization': `SHIFTEE-AUTH-TOKENS shiftee_account_auth_token=${account_auth_token}`
    }
  })
  .json();

  const employee_auth_token = await got('https://shiftee.io/api/company/employee/auth', {
    headers: {
      'Authorization': `SHIFTEE-AUTH-TOKENS shiftee_account_auth_token=${account_auth_token}`
    },
    searchParams: {
      employee_id
    }
  })
  .json()
  .then(d => d.employee_auth_token)

  return {
    email,
    account_auth_token,
    employee_auth_token
  };
};

