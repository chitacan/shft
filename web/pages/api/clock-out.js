import Cookies from 'cookies';
import {day, getUser} from '../../lib/utils';

export default async function(req, res) {
  const {body, method} = req;

  const cookies = new Cookies(req, res);
  const email = body.email ? body.email : cookies.get('email');

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }

  if (!email) {
    return res.status(404).json({email, message: 'cannot find email'});
  }

  const user = await getUser(email);

  if (user instanceof Error) {
    return res.status(404).json({email, message: user.message});
  }

  const now = day();
  const {attendances} = await fetch('https://shiftee.io/api/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `shiftee_employee_auth_token=${user.employee_token}; shiftee_account_auth_token=${user.account_token}`
    },
    body: JSON.stringify({
      attendances: {
        date_ranges: [
          [now.subtract(1, 'day').format(), now.format()]
        ]
      }
    })
  })
  .then(d => d.json());

  if (attendances.length === 0) {
    return res.status(404).json({email, message: 'cannot find attendances'});
  }

  // 오늘 중 마지막 퇴근이 없는 attendance 를 찾아야 함
  const [{attendance_id}] = attendances.reverse();

  await fetch(`https://shiftee.io/api/attendance/me/${attendance_id}/clock-out`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `shiftee_employee_auth_token=${user.employee_token}; shiftee_account_auth_token=${user.account_token}`
    },
    body: JSON.stringify({
      coordinate: [37.50938599954014, 127.0616001923596]
    })
  })
  .then(d => d.json())
  .then(({attendance}) => {
    res.status(200).json({email, attendance});
  })
  .catch(e => {
    console.error(email, e)
    res.status(400).json(e.message);
  });
};
