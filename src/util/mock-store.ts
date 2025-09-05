
import { BigNumber } from 'bignumber.js';

import * as config from '../config.json';
import { OrderSide, Token, TokenBalance, UIOrder, Web3State } from './types';

export const getMockStoreData = () => {
    const { tokens, pairs } = config;

    // Mock Tokens
    const mockTokens: Token[] = tokens.map((token: any) => ({
        ...token,
        address: token.addresses['50'] || '0x0', // Using Ganache address or a default
    }));

    // Mock Token Balances
    const mockTokenBalances: TokenBalance[] = mockTokens.map(token => ({
        balance: new BigNumber(Math.random() * 1000),
        isUnlocked: true,
        token,
    }));

    // Mock Orders
    const mockOrders: UIOrder[] = new Array(10).fill(null).map(() => ({
        rawOrder: {} as any, // This can be expanded if needed
        side: Math.random() > 0.5 ? OrderSide.Buy : OrderSide.Sell,
        size: new BigNumber(Math.random() * 10),
        filled: new BigNumber(Math.random() * 5),
        price: new BigNumber(Math.random() * 100),
        status: null,
    }));

    const mockUserOrders: UIOrder[] = new Array(3).fill(null).map(() => ({
        rawOrder: {} as any,
        side: Math.random() > 0.5 ? OrderSide.Buy : OrderSide.Sell,
        size: new BigNumber(Math.random() * 10),
        filled: new BigNumber(Math.random() * 5),
        price: new BigNumber(Math.random() * 100),
        status: null,
    }));

    const [baseToken, quoteToken] = mockTokens;
    const currencyPair = pairs[0];

    return {
        blockchain: {
            ethAccount: '0x1234567890123456789012345678901234567890',
            web3State: Web3State.Done,
            tokenBalances: mockTokenBalances,
            ethBalance: new BigNumber(10),
            wethTokenBalance: mockTokenBalances.find(tb => tb.token.symbol === 'weth') || null,
        },
        market: {
            currencyPair: {
                base: currencyPair.base,
                quote: currencyPair.quote,
            },
            baseToken,
            quoteToken,
            markets: pairs.map(p => ({
                currencyPair: p,
                price: new BigNumber(Math.random() * 100),
            })),
        },
        relayer: {
            orders: mockOrders,
            userOrders: mockUserOrders,
        },
    };
};
