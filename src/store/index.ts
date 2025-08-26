import { configureStore } from '@reduxjs/toolkit';

import { getCollectiblesMetadataGateway } from '../services/collectibles_metadata_gateway';
import { getContractWrappers } from '../services/contract_wrappers';

import { localStorageMiddleware } from './middlewares';
import { rootReducer } from './reducers';

const extraArgument = {
    getContractWrappers,
    getCollectiblesMetadataGateway,
};
export type ExtraArgument = typeof extraArgument;

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument,
            },
            serializableCheck: false, // optional: if your app uses non-serializable stuff like web3
        }).concat(localStorageMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// Types for TS
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export { store };
