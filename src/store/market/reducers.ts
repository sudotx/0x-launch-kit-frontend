import queryString from 'query-string';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { availableMarkets } from '../../common/markets';
import { MarketState } from '../../util/types';
import { BigNumber } from 'bignumber.js';

const getMakerAddresses = () => {
    const makerAddressesString = queryString.parse(queryString.extract(window.location.hash)).makerAddresses as string;
    if (!makerAddressesString) {
        return null;
    }
    const makerAddresses = makerAddressesString.split(',');
    return makerAddresses.map(a => a.toLowerCase());
};

const initialMarketState: MarketState = {
    currencyPair: {
        base: (queryString.parse(queryString.extract(window.location.hash)).base as string) || availableMarkets[0].base,
        quote:
            (queryString.parse(queryString.extract(window.location.hash)).quote as string) || availableMarkets[0].quote,
    },
    baseToken: null,
    quoteToken: null,
    markets: null,
    ethInUsd: null,
    makerAddresses: getMakerAddresses(),
};



const marketSlice = createSlice({
    name: 'market',
    initialState: initialMarketState,
    reducers: {
        setMarketTokens(state, action: PayloadAction<{ baseToken: any; quoteToken: any }>) {
            state.baseToken = action.payload.baseToken;
            state.quoteToken = action.payload.quoteToken;
        },
        setCurrencyPair(state, action: PayloadAction<{ base: string; quote: string }>) {
            state.currencyPair = action.payload;
        },
        setMarkets(state, action: PayloadAction<any>) {
            state.markets = action.payload;
        },
        fetchMarketPriceEtherUpdate(state, action: PayloadAction<number | null>) {
            state.ethInUsd = action.payload !== null ? new BigNumber(action.payload) : null;
        },
        // These two are no-ops, so we can still define them if other parts of the app dispatch them
        fetchMarketPriceEtherStart(state) { },
        fetchMarketPriceEtherError(state) { },
    },
});

export const {
    setMarketTokens,
    setCurrencyPair,
    setMarkets,
    fetchMarketPriceEtherUpdate,
    fetchMarketPriceEtherStart,
    fetchMarketPriceEtherError,
} = marketSlice.actions;

export default marketSlice.reducer;
