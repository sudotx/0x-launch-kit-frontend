import { combineReducers, configureStore } from '@reduxjs/toolkit';

import blockchainReducer from './blockchain/reducers';
import marketReducer from './market/reducers';
import relayerReducer from './relayer/reducers';
import { localStorageMiddleware } from './middlewares';
import uiReducer from './ui/reducers';

// Remove heavy services from global extraArgument
const extraArgument = {};
export type ExtraArgument = typeof extraArgument;

// Static reducers that are always loaded (minimal set)
export const staticReducers = {
    blockchain: blockchainReducer,
    ui: uiReducer,
    market: marketReducer, // Add this back
    relayer: relayerReducer, // Add this back
};

// Type for the store with dynamic reducer injection
export interface AsyncStore {
    asyncReducers: Record<string, any>;
    injectReducer: (key: string, reducer: any) => void;
}

export const createStore = () => {
    const store = configureStore({
        reducer: combineReducers(staticReducers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument,
                },
                serializableCheck: false,
            }).concat(localStorageMiddleware),
        devTools: process.env.NODE_ENV !== 'production',
    });

    // Helper for injecting reducers dynamically
    (store as any).asyncReducers = {};
    (store as any).injectReducer = (key: string, reducer: any) => {
        if (!(store as any).asyncReducers[key]) {
            (store as any).asyncReducers[key] = reducer;
            (store as any).replaceReducer(
                combineReducers({
                    ...staticReducers,
                    ...(store as any).asyncReducers
                } as any)
            );
        }
    };

    return store as typeof store & AsyncStore;
};

// Create the store instance
export const store = createStore();

// Types for TS
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
