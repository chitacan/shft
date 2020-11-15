const Clock = ({format}) => format ? format : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">기록없음</span>;

const Duration = ({format}) => format ? <span className="px-2 inline-flex leading-5 text-xs text-gray-500">{format}</span> : '';

const Attendance = ({date, clockIn, clockOut, duration, bg, note}) => {
  return (
    <div className={`${bg} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
      <dt className="text-sm leading-5 font-medium text-gray-500">
        {date}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
        <Clock format={clockIn}/> - <Clock format={clockOut}/> <Duration format={duration}/>
        <p className="pt-1 text-xs text-gray-500">{note}</p>
      </dd>
    </div>
  );
};

const Attendances = ({attendances}) => {
  return attendances.map(({attendance_id, format, note}, i) => {
    return (
      <Attendance
        key={attendance_id}
        bg={i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
        note={note}
        {...format} />
    );
  });
}

export default Attendances;
