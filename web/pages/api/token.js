import {createOrUpdateUser} from '../../lib/utils';

export default async function(req, res) {
  const {
    body: {
      email,
      account_token,
      employee_token
    },
    method
  } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${method} Not Allowed`)
  }

  const result = await createOrUpdateUser({email, account_token, employee_token});
  res.status(200).json(result);
};
