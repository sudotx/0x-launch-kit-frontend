import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RelayerState } from '../../util/types';

const initialState: RelayerState = {
    orders: [],
    userOrders: [],
};

const relayerSlice = createSlice({
    name: 'relayer',
    initialState,
    reducers: {
        setOrders(state, action: PayloadAction<any[]>) {
            state.orders = action.payload;
        },
        setUserOrders(state, action: PayloadAction<any[]>) {
            state.userOrders = action.payload;
        },
        initializeRelayerData(state, action: PayloadAction<RelayerState>) {
            return action.payload;
        },
    },
});

export const { setOrders, setUserOrders, initializeRelayerData } = relayerSlice.actions;
export default relayerSlice.reducer;
