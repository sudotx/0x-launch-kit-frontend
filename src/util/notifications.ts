import { ExchangeFillEventArgs, LogWithDecodedArgs } from '@0x/contract-wrappers';
import { assetDataUtils } from '@0x/order-utils';

import { KnownTokens } from './known_tokens';
import { getTransactionLink } from './transaction_link';
import { Market, Notification, NotificationKind, OrderFilledNotification, OrderSide, Token } from './types';

export const buildOrderFilledNotification = (
    log: LogWithDecodedArgs<ExchangeFillEventArgs>,
    knownTokens: KnownTokens,
    markets: Market[] | null,
): OrderFilledNotification => {
    const { args } = log;
    const side: OrderSide = getOrderSideFromFillEvent(knownTokens, log, markets);
    let exchangedTokenAddress: string;
    let exchangedToken: Token;
    
    if (side === OrderSide.Sell) {
        const decodedAssetData = assetDataUtils.decodeAssetDataOrThrow(args.makerAssetData);
        if (!assetDataUtils.isERC20TokenAssetData(decodedAssetData)) {
            throw new Error('Asset data is not ERC20 data');
        }
        exchangedTokenAddress = decodedAssetData.tokenAddress;
    } else {
        const decodedAssetData = assetDataUtils.decodeAssetDataOrThrow(args.takerAssetData);
        if (!assetDataUtils.isERC20TokenAssetData(decodedAssetData)) {
            throw new Error('Asset data is not ERC20 data');
        }
        exchangedTokenAddress = decodedAssetData.tokenAddress;
    }

    exchangedToken = knownTokens.getTokenByAddress(exchangedTokenAddress);
    return {
        id: `${log.transactionHash}-${log.logIndex}`,
        kind: NotificationKind.OrderFilled,
        amount: side === OrderSide.Buy ? args.takerAssetFilledAmount : args.makerAssetFilledAmount,
        side,
        timestamp: new Date(),
        token: exchangedToken,
    };
};

export const getOrderSideFromFillEvent = (
    knownTokens: KnownTokens,
    fillEvent: LogWithDecodedArgs<ExchangeFillEventArgs>,
    markets: Market[] | null,
): OrderSide => {
    if (!knownTokens.isValidFillEvent(fillEvent)) {
        throw new Error('The event is not valid');
    }
    const { makerAssetData, takerAssetData } = fillEvent.args;
    const wethToken = knownTokens.getWethToken();
    
    const makerAssetDecoded = assetDataUtils.decodeAssetDataOrThrow(makerAssetData);
    if (!assetDataUtils.isERC20TokenAssetData(makerAssetDecoded)) {
        throw new Error('Maker asset data is not ERC20 data');
    }
    const makerTokenAddress = makerAssetDecoded.tokenAddress;
    
    const takerAssetDecoded = assetDataUtils.decodeAssetDataOrThrow(takerAssetData);
    if (!assetDataUtils.isERC20TokenAssetData(takerAssetDecoded)) {
        throw new Error('Taker asset data is not ERC20 data');
    }
    const takerTokenAddress = takerAssetDecoded.tokenAddress;
    
    const wethAssetData = assetDataUtils.encodeERC20AssetData(wethToken.address);

    let orderSide: OrderSide = OrderSide.Sell;

    // Fallback in case there are not markets
    if (!markets) {
        orderSide = makerAssetData === wethAssetData ? OrderSide.Buy : OrderSide.Sell;
    } else {
        for (const market of markets) {
            const baseSymbol = market.currencyPair.base;
            const quoteSymbol = market.currencyPair.quote;
            const baseToken = knownTokens.getTokenBySymbol(baseSymbol);
            const quoteToken = knownTokens.getTokenBySymbol(quoteSymbol);

            if (makerTokenAddress === baseToken.address && takerTokenAddress === quoteToken.address) {
                // This is a sell order --> fill event is a buy
                orderSide = OrderSide.Buy;
                break;
            } else if (makerTokenAddress === quoteToken.address && takerTokenAddress === baseToken.address) {
                // This is a buy order --> fill event is a sell
                orderSide = OrderSide.Sell;
                break;
            }
        }
    }

    return orderSide;
};

export const getTransactionHashFromNotification = (notification: Notification): string => {
    return notification.id.slice(0, 66);
};

export const getEtherscanUrlForNotificationTx = (notification: Notification): string => {
    const hash = getTransactionHashFromNotification(notification);
    return getTransactionLink(hash);
};
