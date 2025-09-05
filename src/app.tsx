import React, { useEffect } from 'react';
import { useErc20Store } from './store';

interface OwnProps {
    children: React.ReactNode;
}

const App: React.FC<OwnProps> = ({ children }) => {
    const { initializeMarket } = useErc20Store();

    useEffect(() => {
        initializeMarket();
    }, [initializeMarket]);

    return <>{children}</>;
};

export default App;
