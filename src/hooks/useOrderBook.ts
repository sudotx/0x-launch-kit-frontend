// hooks/useOrderBook.ts
import { BigNumber } from '@0x/utils';
import { useEffect, useMemo, useState } from 'react';
import { useErc20Store } from '../store';
import { OrderBookItem, OrderSide, Token, UIOrder, Web3State } from '../util/types';

interface UseOrderBookReturn {
    orderBook: {
        sellOrders: OrderBookItem[];
        buyOrders: OrderBookItem[];
        mySizeOrders: OrderBookItem[];
    };
    baseToken: Token | null;
    quoteToken: Token | null;
    web3State: Web3State;
    absoluteSpread: BigNumber;
    percentageSpread: BigNumber;
    isLoading: boolean;
}

export const useOrderBook = (): UseOrderBookReturn => {
    const {
        orders,
        userOrders,
        baseToken,
        quoteToken,
        web3State,
    } = useErc20Store();

    const [isLoading, setIsLoading] = useState(true);

    // Transform orders into orderbook format
    const orderBook = useMemo(() => {
        const sellOrders = orders
            .filter((order: UIOrder) => order.side === OrderSide.Sell)
            .map((order: UIOrder) => ({
                size: order.size,
                price: order.price,
                side: order.side,
            }))
            .sort((a, b) => a.price.comparedTo(b.price)); // Ascending for sells

        const buyOrders = orders
            .filter((order: UIOrder) => order.side === OrderSide.Buy)
            .map((order: UIOrder) => ({
                size: order.size,
                price: order.price,
                side: order.side,
            }))
            .sort((a, b) => b.price.comparedTo(a.price)); // Descending for buys

        const mySizeOrders = userOrders.map((order: UIOrder) => ({
            size: order.size,
            price: order.price,
            side: order.side,
        }));

        return { sellOrders, buyOrders, mySizeOrders };
    }, [orders, userOrders]);

    // Calculate spread
    const { absoluteSpread, percentageSpread } = useMemo(() => {
        const { sellOrders, buyOrders } = orderBook;

        if (sellOrders.length === 0 || buyOrders.length === 0) {
            return { absoluteSpread: new BigNumber(0), percentageSpread: new BigNumber(0) };
        }

        const lowestAsk = sellOrders[0].price;
        const highestBid = buyOrders[0].price;
        const spread = lowestAsk.minus(highestBid);
        const spreadPercentage = spread.div(lowestAsk).multipliedBy(100);

        return {
            absoluteSpread: spread,
            percentageSpread: spreadPercentage,
        };
    }, [orderBook]);

    useEffect(() => {
        const hasData = baseToken && quoteToken && orders.length >= 0;
        setIsLoading(!hasData);
    }, [baseToken, quoteToken, orders.length]);

    return {
        orderBook,
        baseToken,
        quoteToken,
        web3State,
        absoluteSpread,
        percentageSpread,
        isLoading,
    };
};