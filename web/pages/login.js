import {useState} from 'react';
import {useRouter} from 'next/router';
import Lock from '../components/icons/lock';

const Login = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(false);
  return (
    <div className="sm:min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div>
          <img className="mx-auto h-12 w-auto" src="https://shiftee.io/assets/www/index/images/common/index/c4e9b93822c6fdf93ac47260100e7638-footer-symbol.png" alt="Workflow"/>
          <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8" onSubmit={e => {
          e.preventDefault();
          fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: e.target.email.value})
          })
          .then(async res => {
            const body = await res.json();
            setErrorMessage(res.ok ? false : body.message);

            if (res.ok) {
              router.replace('/');
            }
          });
        }}>
          <input type="hidden" name="remember" value="true"/>
          <div className="rounded-md shadow-sm">
            <div>
              <input aria-label="Email address" name="email" type="email" required className={`${errorMessage ? 'border-red-500' : ''} appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5`} placeholder="Email address"/>
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-xs italic">{errorMessage}</p>}

          <div className="mt-6">
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out">
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock/>
              </span>
              Login
            </button>
          </div>
          <p className="pt-2 text-sm text-gray-600">New to SHFT? Register your email via <a target="_blank" href="https://www.npmjs.com/package/shft-cli" className="text-blue-400">shft-cli</a>.</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
