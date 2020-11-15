import Air from 'airtable';
import day from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tmz from 'dayjs/plugin/timezone';
import drn from 'dayjs/plugin/duration';
import rtt from 'dayjs/plugin/relativeTime';

const base = new Air({apiKey: process.env.SHFT_API_KEY}).base(process.env.SHFT_BASE);
const table = base('users');

day.extend(utc);
day.extend(tmz);
day.extend(drn);
day.extend(rtt);
day.tz.setDefault("Asia/Seoul");

export {day};

export async function getUser(email, onlyVerified = true) {
  return await table
    .select({filterByFormula: `{email} = "${email}"`, maxRecords: 1})
    .firstPage()
    .then(d => {
      if (d.length === 0 || !d[0]) {
        throw new Error('cannot find email');
      }
      if (onlyVerified && !d[0].fields.verified) {
        throw new Error('email not verified');
      }
      return d[0];
    })
    .then(({id, fields}) => ({id, ...fields}))
    .catch(e => e);
};

export async function createOrUpdateUser({email, account_token, employee_token}) {
  const user = await getUser(email, false);
  if (user instanceof Error) {
    await table.create([{
      fields: {
        email,
        account_token,
        employee_token
      }
    }]);
    return {
      email,
      message: 'created'
    };
  } else {
    await table.update([{
      id: user.id,
      fields: {
        account_token,
        employee_token
      }
    }]);
    return {
      email,
      message: 'updated'
    };
  }
};
