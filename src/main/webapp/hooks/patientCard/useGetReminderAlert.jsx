import React, { useMemo } from 'react';

const useGetReminderAlert = () => {
  const reminderConfig = useMemo(() => {
    return [
      null,
      {
        title: 'Upcoming CabLA Appointment!',
        body: `CabLA appointment is due tommorrow`,
      },
      {
        title: 'Missed CabLA Appointment!',
        body: `CabLA appointment is overdue!`,
      },
    ];
  }, []);

  const getReminderAlert = sendCabLaAlert => reminderConfig[sendCabLaAlert];

  return {
    getReminderAlert,
  };
};

export default useGetReminderAlert;
