import {useRouter} from 'next/router'
import Cookies from 'cookies';
import Attendances from '../components/attendances';
import Email from '../components/icons/email';
import Login from '../components/icons/login';
import Logout from '../components/icons/logout';
import {day, getUser} from '../lib/utils';

export async function getServerSideProps({req, res}) {
  const cookies = new Cookies(req, res);
  const email = cookies.get('email');

  if (!email) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  const user = await getUser(email);

  if (user instanceof Error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  };

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
          [now.subtract(10, 'day').format(), now.format()]
        ]
      }
    })
  }).then(d => d.json());

  const todayAttendance = attendances.find(({clock_in_time}) => {
    return day(clock_in_time).startOf('day').unix() === now.startOf('day').unix();
  });

  return {
    props: {
      email,
      today: {
        clockIn: !!todayAttendance && todayAttendance.clock_in_time,
        clockOut: !!todayAttendance && todayAttendance.clock_out_time
      },
      attendances: attendances.sort((a, b) => b.attendance_id - a.attendance_id).map(d => {
        const ci = day(d.clock_in_time).tz();
        const co = day(d.clock_out_time).tz();
        return {
          ...d,
          format: {
            date: day(d.clock_in_time).tz().format('YYYY-MM-DD'),
            clockIn: ci.isValid() ? ci.format('HH:mm:ss') : null,
            clockOut: co.isValid() ? co.format('HH:mm:ss') : null,
            duration: (ci.isValid() && co.isValid()) ? day.duration(co.diff(ci)).humanize() : null
          }
        };
      })
    }
  };
};

const Index = ({email, today, attendances}) => {
  const router = useRouter();
  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
            SHFT
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap">
            <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 sm:mr-6">
            <Email/>
              {email}
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <span className="sm:block shadow-sm rounded-md">
            <button
              onClick={() => {
                fetch('/api/clock-in', {
                  method: 'POST'
                })
                .then(() => {
                  router.replace('/');
                })
                .catch(e => {
                });
              }}
              type="button"
              disabled={today.clockIn}
              className={`${today.clockIn ? 'cursor-not-allowed opacity-50' : ''} inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none active:text-gray-800 active:bg-gray-50 transition duration-150 ease-in-out`}>
              <Login/>

              Clock-In
            </button>
          </span>

          <span className="ml-3 shadow-sm rounded-md">
            <button
              onClick={() => {
                fetch('/api/clock-out', {
                  method: 'POST'
                })
                .then(() => {
                  router.replace('/');
                })
                .catch(e => {
                });
              }}
              type="button"
              disabled={!today.clockIn || today.clockOut}
              className={`${!today.clockIn || today.clockOut ? 'cursor-not-allowed opacity-50' : ''} inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700 transition duration-150 ease-in-out`}>
              <Logout/>
              Clock-Out

            </button>
          </span>
        </div>
      </div>

      <div className="py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              출퇴근 기록
              &nbsp;
              {(!today.clockIn && !today.clockOut) && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">출근 전</span>}
              {(today.clockIn && !today.clockOut) && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">근무 중</span>}
              {(today.clockIn && today.clockOut) && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">근무 완료</span>}
            </h3>
          </div>
          <div>
            <dl>
              <Attendances attendances={attendances}/>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
