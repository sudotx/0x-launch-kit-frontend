import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { UI_UPDATE_CHECK_INTERVAL, UPDATE_ETHER_PRICE_INTERVAL } from '../common/constants';
import { LocalStorage } from '../services/local_storage';
import { initializeAppNoMetamaskOrLocked, initWallet, updateMarketPriceEther, updateStore } from '../store/actions';
import { getWeb3State } from '../store/selectors';
import { Web3State } from '../util/types';
import { AppDispatch } from '../store';

interface OwnProps {
    children: React.ReactNode;
}

const localStorage = new LocalStorage(window.localStorage);

const App: React.FC<OwnProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const web3State = useSelector(getWeb3State);

    const updateStoreInterval = useRef<number | undefined>(undefined);
    const updatePriceEtherInterval = useRef<number | undefined>(undefined);

    const onConnectWallet = useCallback(() => dispatch(initWallet()), [dispatch]);
    const onInitMetamaskState = useCallback(() => dispatch(initializeAppNoMetamaskOrLocked()), [dispatch]);
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
            updateStoreInterval.current = window.setInterval(() => {
                onUpdateStore();
            }, UI_UPDATE_CHECK_INTERVAL);
        }

        if (!updatePriceEtherInterval.current && UPDATE_ETHER_PRICE_INTERVAL !== 0) {
            updatePriceEtherInterval.current = window.setInterval(() => {
                onUpdateMarketPriceEther();
            }, UPDATE_ETHER_PRICE_INTERVAL);
        }
    }, [onUpdateStore, onUpdateMarketPriceEther]);

    useEffect(() => {
        const wasWalletConnected = localStorage.getWalletConnected();
        if (wasWalletConnected) {
            onConnectWallet();
        } else {
            onInitMetamaskState();
        }
    }, [onConnectWallet, onInitMetamaskState]);

    useEffect(() => {
        if (web3State === Web3State.Done) {
            activatePollingUpdates();
        } else {
            deactivatePollingUpdates();
        }
    }, [web3State, activatePollingUpdates, deactivatePollingUpdates]);

    useEffect(() => {
        return () => {
            clearInterval(updateStoreInterval.current);
            clearInterval(updatePriceEtherInterval.current);
        };
    }, []);

    return <>{children}</>;
};

export default App
