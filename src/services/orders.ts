import { SignedOrder } from '@0x/connect';
import { assetDataUtils } from '@0x/order-utils';
import { BigNumber } from '@0x/utils';

import { getLogger } from '../util/logger';
import { getTransactionOptions } from '../util/transactions';
import { Token } from '../util/types';
import { ordersToUIOrders } from '../util/ui_orders';

import { getContractWrappers } from './contract_wrappers';
import { getRelayer } from './relayer';
import { getProvider } from './web3_wrapper';
import { ExchangeContract } from '@0x/contract-wrappers';

const logger = getLogger('Services::Orders');

const getAllOrders = async (baseToken: Token, quoteToken: Token, makerAddresses: string[] | null) => {
    const relayer = getRelayer();
    const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseToken.address);
    const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteToken.address);
    const orders = await relayer.getAllOrdersAsync(baseTokenAssetData, quoteTokenAssetData);

    // if makerAddresses is null or empty do not filter
    if (!makerAddresses || makerAddresses.length === 0) {
        return orders;
    }

    // filter orders by existence in the makerAddresses array
    const filteredOrders = orders.filter(order => {
        const orderMakerAddress = order.makerAddress;
        return makerAddresses.includes(orderMakerAddress);
    });
    return filteredOrders;
};

export const getAllOrdersAsUIOrders = async (baseToken: Token, quoteToken: Token, makerAddresses: string[] | null) => {
    const orders: SignedOrder[] = await getAllOrders(baseToken, quoteToken, makerAddresses);
    try {
        // Remove devUtils usage since it doesn't exist
        // const contractWrappers = await getContractWrappers();
        // const [ordersInfo] = await contractWrappers.devUtils
        //     .getOrderRelevantStates(orders, orders.map(o => o.signature))
        //     .callAsync();
        // return ordersToUIOrders(orders, baseToken, ordersInfo);

        // Return orders without order info for now
        return ordersToUIOrders(orders, baseToken);
    } catch (err) {
        logger.error(`There was an error getting the orders' info from exchange.`, err);
        throw err;
    }
};

export const getAllOrdersAsUIOrdersWithoutOrdersInfo = async (
    baseToken: Token,
    quoteToken: Token,
    makerAddresses: string[] | null,
) => {
    const orders: SignedOrder[] = await getAllOrders(baseToken, quoteToken, makerAddresses);
    return ordersToUIOrders(orders, baseToken);
};

export const getUserOrders = (baseToken: Token, quoteToken: Token, ethAccount: string) => {
    const relayer = getRelayer();
    const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseToken.address);
    const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteToken.address);
    return relayer.getUserOrdersAsync(ethAccount, baseTokenAssetData, quoteTokenAssetData);
};

export const getUserOrdersAsUIOrders = async (baseToken: Token, quoteToken: Token, ethAccount: string) => {
    const myOrders = await getUserOrders(baseToken, quoteToken, ethAccount);
    try {
        // Remove devUtils usage since it doesn't exist
        // const contractWrappers = await getContractWrappers();
        // const [ordersInfo] = await contractWrappers.devUtils
        //     .getOrderRelevantStates(myOrders, myOrders.map(o => o.signature))
        //     .callAsync();
        // return ordersToUIOrders(myOrders, baseToken, ordersInfo);

        // Return orders without order info for now
        return ordersToUIOrders(myOrders, baseToken);
    } catch (err) {
        logger.error(`There was an error getting the orders' info from exchange.`, err);
        throw err;
    }
};

export const cancelSignedOrder = async (order: SignedOrder, gasPrice: BigNumber) => {
    const contractWrappers = await getContractWrappers();
    const provider = await getProvider();

    // Use ExchangeContract instead of contractWrappers.exchange
    const exchangeProxyAddress = contractWrappers.contractAddresses.exchangeProxy;
    const exchange = new ExchangeContract(exchangeProxyAddress, contractWrappers.getProvider());

    const tx = await exchange.cancelOrder(order).sendTransactionAsync({
        from: order.makerAddress,
        ...getTransactionOptions(gasPrice),
    });

    // Remove web3Wrapper usage since it's not available
    // return web3Wrapper.awaitTransactionSuccessAsync(tx);

    // Return the transaction hash instead
    return tx;
};
