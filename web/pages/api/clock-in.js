import Cookies from 'cookies';
import {getUser} from '../../lib/utils';

const DEFAULT_ATTENDANCE = {
  location_id: 84263,
  position_id: 36479,
  coordinate: [37.50938599954014, 127.0616001923596]
};

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

  const userAttendance = {
    ...DEFAULT_ATTENDANCE,
    ...body.attendance
  };

  const {attendance} = await fetch('https://shiftee.io/api/attendance/me/clock-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `shiftee_employee_auth_token=${user.employee_token}; shiftee_account_auth_token=${user.account_token}`
    },
    body: JSON.stringify(userAttendance)
  })
  .then(d => d.json());
  res.status(200).json({email, attendance});
};
