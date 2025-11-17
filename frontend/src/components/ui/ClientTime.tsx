'use client';

import { useState, useEffect } from 'react';

type ClientTimeProps = {
  utcTime: string;
};

const ClientTime = ({ utcTime }: ClientTimeProps) => {
  const [localTime, setLocalTime] = useState('...');

  useEffect(() => {
    const date = new Date(utcTime);
    const formattedTime = date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    setLocalTime(formattedTime);
  }, [utcTime]);

  return <>{localTime}</>;
};

export default ClientTime;