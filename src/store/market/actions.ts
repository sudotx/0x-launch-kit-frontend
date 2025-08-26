import { BigNumber } from '@0x/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { availableMarkets } from '../../common/markets';
import { getMarketPriceEther } from '../../services/markets';
import { getRelayer } from '../../services/relayer';
import { getKnownTokens } from '../../util/known_tokens';
import { CurrencyPair, Market, Token } from '../../util/types';
import { getOrderbookAndUserOrders } from '../relayer/actions';

export const updateMarketPriceEther = createAsyncThunk<BigNumber>(
    'market/updateMarketPriceEther/fetch',
    async () => {
        return getMarketPriceEther();
    },
);

export const fetchMarkets = createAsyncThunk<Market[]>('market/fetchMarkets/fetch', async () => {
    const knownTokens = getKnownTokens();
    const relayer = getRelayer();

    const markets = await Promise.all(
        availableMarkets.map(async availableMarket => {
            try {
                const baseToken = knownTokens.getTokenBySymbol(availableMarket.base);
                const quoteToken = knownTokens.getTokenBySymbol(availableMarket.quote);
                const price = await relayer.getCurrencyPairPriceAsync(baseToken, quoteToken);
                return {
                    currencyPair: availableMarket,
                    price,
                };
            } catch (err) {
                console.error(
                    `Failed to get price of currency pair ${availableMarket.base}/${availableMarket.quote}`,
                    err,
                );
                return null;
            }
        }),
    );

    return markets.filter((m): m is Market => m !== null);
});

export const changeMarket = createAsyncThunk<
    { baseToken: Token; quoteToken: Token; currencyPair: CurrencyPair },
    CurrencyPair,
    { dispatch: any }
>('market/changeMarket', async (currencyPair, { dispatch }) => {
    const knownTokens = getKnownTokens();
    const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
    const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);

    // Fetch new orderbook for the new market
    await dispatch(getOrderbookAndUserOrders());

    // The reducer for this thunk's fulfilled action will handle setting the state
    return { baseToken, quoteToken, currencyPair };
});
