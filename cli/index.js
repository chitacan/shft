const ptr = require('puppeteer');
const got = require('got');
const oauth = require('./oauth');

(async () => {
  const browser = await ptr.launch({headless: false});

  try {
    const {
      email,
      account_auth_token,
      employee_auth_token
    } = await oauth(browser);
    const res = await got.post(process.env.API, {
      json: {
        email,
        account_token: account_auth_token,
        employee_token: employee_auth_token
      }
    })
    .json();

    console.log(`user ${res.message}. login on https://shft.chitacan.io 😎`);
  } catch (e) {
    console.error(e);
  }

  browser.close();
})();
