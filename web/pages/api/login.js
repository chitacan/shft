import Cookies from 'cookies';
import {getUser} from '../../lib/utils';

export default async function(req, res) {
  const {
    body: {
      email
    },
    method
  } = req;

  const cookies = new Cookies(req, res);

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }

  if (!email && cookies.get('email')) {
    return res.status(200).json({email: cookies.get('email'), message: 'ok'});
  }

  const user = await getUser(email);

  if (user instanceof Error) {
    cookies.set('email');
    res.status(404).json({email, message: user.message});
  } else {
    cookies.set('email', email);
    res.status(200).json({email, message: 'ok'});
  }
};
