// D:\HackTrack\client\src\components\ui\ClientTime.tsx

'use client';

import React, { useMemo } from 'react';

interface ClientTimeProps {
    utcTime: string; // ISO 8601 string (e.g., "2025-12-08T18:00:00.000Z")
}

const ClientTime: React.FC<ClientTimeProps> = ({ utcTime }) => {
    const localTime = useMemo(() => {
        // Create a Date object from the UTC string
        const date = new Date(utcTime);
        
        // Format the time using the user's local settings and timezone
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        });
    }, [utcTime]);

    return <span className="font-medium text-blue-300">{localTime}</span>;
};

export default ClientTime;