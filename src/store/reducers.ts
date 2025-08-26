import { combineReducers } from '@reduxjs/toolkit';
import blockchainReducer from './blockchain/reducers';
import collectiblesReducer from './collectibles/reducers';
import marketReducer from './market/reducers';
import relayerReducer from './relayer/reducers';
import uiReducer from './ui/reducers';

export const rootReducer = combineReducers({
    blockchain: blockchainReducer,
    market: marketReducer,
    relayer: relayerReducer,
    ui: uiReducer,
    collectibles: collectiblesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
