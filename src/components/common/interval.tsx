import React, { useState, useEffect } from 'react';

interface Props {
    delay: number;
    children: (now: Date) => React.ReactNode;
}

export const Interval: React.FC<Props> = ({ delay, children }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), delay);
        return () => {
            clearInterval(interval);
        };
    }, [delay]);

    return <>{children(now)}</>;
};
