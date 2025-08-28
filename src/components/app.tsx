import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAccount } from 'wagmi';

import { UI_UPDATE_CHECK_INTERVAL, UPDATE_ETHER_PRICE_INTERVAL } from '../common/constants';
import { AppDispatch } from '../store';
import { updateMarketPriceEther, updateStore } from '../store/actions';

interface OwnProps {
    children: React.ReactNode;
}

const App: React.FC<OwnProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isConnected, address } = useAccount();

    const updateStoreInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const updatePriceEtherInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const onUpdateStore = useCallback(() => dispatch(updateStore()), [dispatch]);
    const onUpdateMarketPriceEther = useCallback(() => dispatch(updateMarketPriceEther()), [dispatch]);

    const deactivatePollingUpdates = useCallback(() => {
        if (updateStoreInterval.current) {
            clearInterval(updateStoreInterval.current);
            updateStoreInterval.current = undefined;
        }

        if (updatePriceEtherInterval.current) {
            clearInterval(updatePriceEtherInterval.current);
            updatePriceEtherInterval.current = undefined;
        }
    }, []);

    const activatePollingUpdates = useCallback(() => {
        if (UI_UPDATE_CHECK_INTERVAL !== 0 && !updateStoreInterval.current) {
            updateStoreInterval.current = setInterval(() => {
                onUpdateStore();
            }, UI_UPDATE_CHECK_INTERVAL);
        }

        if (!updatePriceEtherInterval.current && UPDATE_ETHER_PRICE_INTERVAL !== 0) {
            updatePriceEtherInterval.current = setInterval(() => {
                onUpdateMarketPriceEther();
            }, UPDATE_ETHER_PRICE_INTERVAL);
        }
    }, [onUpdateStore, onUpdateMarketPriceEther]);

    // Use Wagmi's useAccount hook to determine when to start polling
    useEffect(() => {
        if (isConnected && address) {
            activatePollingUpdates();
        } else {
            deactivatePollingUpdates();
        }
    }, [isConnected, address, activatePollingUpdates, deactivatePollingUpdates]);

    useEffect(() => {
        return () => {
            clearInterval(updateStoreInterval.current);
            clearInterval(updatePriceEtherInterval.current);
        };
    }, []);

    return <>{children}</>;
};

export default App
