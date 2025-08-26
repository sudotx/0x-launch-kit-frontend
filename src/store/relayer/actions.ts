import { SignedOrder } from '@0x/types';
import { BigNumber } from '@0x/utils';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ExchangeContract } from '@0x/contract-wrappers';
import { FEE_PERCENTAGE, ZERO } from '../../common/constants';
import { INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR } from '../../exceptions/common';
import { InsufficientOrdersAmountException } from '../../exceptions/insufficient_orders_amount_exception';
import { RelayerException } from '../../exceptions/relayer_exception';
import {
    cancelSignedOrder,
    getAllOrdersAsUIOrders,
    getAllOrdersAsUIOrdersWithoutOrdersInfo,
    getUserOrdersAsUIOrders,
} from '../../services/orders';
import { getRelayer } from '../../services/relayer';
import { isWeth } from '../../util/known_tokens';
import {
    buildLimitOrder,
    buildMarketOrders,
    calculateWorstCaseProtocolFee,
    sumTakerAssetFillableOrders,
} from '../../util/orders';
import { getTransactionOptions } from '../../util/transactions';
import { NotificationKind, OrderFeeData, OrderSide, RelayerState, Token, UIOrder, Web3State } from '../../util/types';
import { updateTokenBalances } from '../blockchain/actions';
import { getAllCollectibles } from '../collectibles/actions';
import { ExtraArgument, RootState } from '../index';
import {
    getBaseToken,
    getEthAccount,
    getEthBalance,
    getGasPriceInWei,
    getMakerAddresses,
    getOpenBuyOrders,
    getOpenSellOrders,
    getQuoteToken,
    getWeb3State,
} from '../selectors';
import { addNotifications } from '../ui/reducers';

// This action can be removed when converting to a slice. The initial state would be set in createSlice.
export const initializeRelayerData = createAction('relayer/init', (relayerData: RelayerState) => ({
    payload: relayerData,
}));

export const getAllOrders = createAsyncThunk<UIOrder[], void, { state: RootState }>(
    'relayer/getAllOrders/fetch',
    async (_, { getState }) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const quoteToken = getQuoteToken(state) as Token;
        const web3State = getWeb3State(state) as Web3State;
        const makerAddresses = getMakerAddresses(state);

        const isWeb3NotDoneState = [Web3State.Locked, Web3State.NotInstalled, Web3State.Error].includes(web3State);
        if (isWeb3NotDoneState) {
            return getAllOrdersAsUIOrdersWithoutOrdersInfo(baseToken, quoteToken, makerAddresses);
        }
        return getAllOrdersAsUIOrders(baseToken, quoteToken, makerAddresses);
    },
);

export const getUserOrders = createAsyncThunk<UIOrder[], void, { state: RootState }>(
    'relayer/getUserOrders/fetch',
    async (_, { getState }) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        if (getWeb3State(state) === Web3State.Done && ethAccount) {
            const baseToken = getBaseToken(state) as Token;
            const quoteToken = getQuoteToken(state) as Token;
            return getUserOrdersAsUIOrders(baseToken, quoteToken, ethAccount);
        }
        return [];
    },
);

export const getOrderbookAndUserOrders = createAsyncThunk<void, void, { dispatch: any }>(
    'relayer/getOrderbookAndUserOrders/fetch',
    async (_, { dispatch }) => {
        await dispatch(getAllOrders());
        await dispatch(getUserOrders());
    },
);

export const getOrderBook = createAsyncThunk<void, void, { dispatch: any }>(
    'relayer/getOrderBook/fetch',
    async (_, { dispatch }) => {
        await dispatch(getAllOrders());
    },
);

export const cancelOrder = createAsyncThunk<string, UIOrder, { state: RootState; dispatch: any }>(
    'relayer/cancelOrder/post',
    async (order, { getState, dispatch }) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        const gasPrice = getGasPriceInWei(state);

        const txPromise = cancelSignedOrder(order.rawOrder, gasPrice);
        const tx = await txPromise;

        dispatch(
            addNotifications([
                {
                    id: tx,
                    kind: NotificationKind.CancelOrder,
                    amount: order.size,
                    token: baseToken,
                    timestamp: new Date(),
                    tx: txPromise,
                },
            ]),
        );

        await dispatch(getOrderbookAndUserOrders());
        return tx;
    },
);

export const submitCollectibleOrder = createAsyncThunk<void, SignedOrder, { dispatch: any }>(
    'relayer/submitCollectibleOrder/post',
    async (signedOrder, { dispatch }) => {
        try {
            await getRelayer().submitOrderAsync(signedOrder);
            await dispatch(getAllCollectibles());
            // TODO: Dispatch notification
        } catch (error: any) {
            throw new RelayerException(error.message);
        }
    },
);

interface SubmitLimitOrderArgs {
    signedOrder: SignedOrder;
    amount: BigNumber;
    side: OrderSide;
}

export const submitLimitOrder = createAsyncThunk<void, SubmitLimitOrderArgs, { state: RootState; dispatch: any }>(
    'relayer/submitLimitOrder/post',
    async ({ signedOrder, amount, side }, { getState, dispatch }) => {
        const state = getState();
        const baseToken = getBaseToken(state) as Token;
        try {
            await getRelayer().submitOrderAsync(signedOrder);

            await dispatch(getOrderbookAndUserOrders());
            dispatch(
                addNotifications([
                    {
                        id: signedOrder.signature,
                        kind: NotificationKind.Limit,
                        amount,
                        token: baseToken,
                        side,
                        timestamp: new Date(),
                    },
                ]),
            );
        } catch (error: any) {
            throw new RelayerException(error.message);
        }
    },
);

interface SubmitMarketOrderArgs {
    amount: BigNumber;
    side: OrderSide;
}

export const submitMarketOrder = createAsyncThunk<
    { txHash: string; amountInReturn: BigNumber },
    SubmitMarketOrderArgs,
    { state: RootState; extra: ExtraArgument; dispatch: any }
>('relayer/submitMarketOrder/post', async ({ amount, side }, { getState, dispatch, extra }) => {
    const state = getState();
    const {
        isBuy,
        orders,
        amountToFill,
        ordersToFill,
        canBeFilled,
        ethAmountRequired,
        protocolFee,
        affiliateFeeAmount,
        totalEthAmount,
    } = {
        isBuy: side === OrderSide.Buy,
        orders: side === OrderSide.Buy ? getOpenSellOrders(state) : getOpenBuyOrders(state),
        get amountToFill() {
            return amount;
        },
        get ordersToFill() {
            return buildMarketOrders({ amount: this.amountToFill, orders: this.orders }, side)[0];
        },
        get canBeFilled() {
            return buildMarketOrders({ amount: this.amountToFill, orders: this.orders }, side)[2];
        },
        get ethAmountRequired() {
            return buildMarketOrders({ amount: this.amountToFill, orders: this.orders }, side)[1].reduce(
                (total: BigNumber, currentValue: BigNumber) => total.plus(currentValue),
                ZERO,
            );
        },
        get protocolFee() {
            return calculateWorstCaseProtocolFee(this.ordersToFill, getGasPriceInWei(state));
        },
        get affiliateFeeAmount() {
            return this.ethAmountRequired.plus(this.protocolFee).multipliedBy(FEE_PERCENTAGE).integerValue(BigNumber.ROUND_CEIL);
        },
        get totalEthAmount() {
            return this.ethAmountRequired.plus(this.protocolFee).plus(this.affiliateFeeAmount);
        },
    };

    if (!canBeFilled) {
        window.alert(INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR);
        throw new InsufficientOrdersAmountException();
    }

    const { getContractWrappers } = extra;
    const contractWrappers = await getContractWrappers();
    const ethAccount = getEthAccount(state);
    const baseToken = getBaseToken(state) as Token;
    const quoteToken = getQuoteToken(state) as Token;
    const isMarketBuyForwarder =
        side === OrderSide.Buy &&
        isWeth(quoteToken.symbol) &&
        (getEthBalance(state) as BigNumber).isGreaterThan(totalEthAmount) &&
        contractWrappers.contractAddresses.exchangeProxy !== '0x0000000000000000000000000000000000000000';

    const orderSignatures = ordersToFill.map(o => o.signature);
    const gasPrice = getGasPriceInWei(state);
    let txHash;

    if (isMarketBuyForwarder) {
        // Use the exchange proxy contract instead of forwarder
        const exchangeProxyAddress = contractWrappers.contractAddresses.exchangeProxy;
        // Create the exchange contract instance
        const exchange = new ExchangeContract(exchangeProxyAddress, contractWrappers.getProvider());
        const txFunction = side === OrderSide.Buy ? exchange.marketBuyOrdersFillOrKill : exchange.marketSellOrdersFillOrKill;
        txHash = await txFunction(ordersToFill, amountToFill, orderSignatures).sendTransactionAsync({
            from: ethAccount,
            value: totalEthAmount,
            ...getTransactionOptions(gasPrice),
        });
    } else {
        const exchangeProxyAddress = contractWrappers.contractAddresses.exchangeProxy;
        const exchange = new ExchangeContract(exchangeProxyAddress, contractWrappers.getProvider());
        const txFunction = side === OrderSide.Buy ? exchange.marketBuyOrdersFillOrKill : exchange.marketSellOrdersFillOrKill;
        txHash = await txFunction(ordersToFill, amountToFill, orderSignatures).sendTransactionAsync({
            from: ethAccount,
            value: protocolFee,
            ...getTransactionOptions(gasPrice),
        });
    }

    dispatch(
        addNotifications([
            {
                id: txHash,
                kind: NotificationKind.Market,
                amount: amountToFill,
                token: baseToken,
                side,
                timestamp: new Date(),
            },
        ]),
    );

    await dispatch(updateTokenBalances());
    await dispatch(getOrderbookAndUserOrders());

    const amountInReturn = sumTakerAssetFillableOrders(
        side,
        ordersToFill,
        buildMarketOrders({ amount: amountToFill, orders: getOpenSellOrders(state) }, side)[1],
    );

    return { txHash, amountInReturn };
});

interface FetchTakerAndMakerFeeArgs {
    amount: BigNumber;
    price: BigNumber;
    side: OrderSide;
}

export const fetchTakerAndMakerFee = createAsyncThunk<
    OrderFeeData,
    FetchTakerAndMakerFeeArgs,
    { state: RootState; extra: ExtraArgument }
>('relayer/fetchTakerAndMakerFee/fetch', async ({ amount, price, side }, { getState, extra }) => {
    const state = getState();
    const ethAccount = getEthAccount(state);
    const baseToken = getBaseToken(state) as Token;
    const quoteToken = getQuoteToken(state) as Token;
    const { getContractWrappers } = extra;
    const contractWrappers = await getContractWrappers();

    const order = await buildLimitOrder(
        {
            account: ethAccount,
            amount,
            price,
            baseTokenAddress: baseToken.address,
            quoteTokenAddress: quoteToken.address,
            exchangeAddress: contractWrappers.contractAddresses.exchangeProxy,
        },
        side,
    );

    const { makerFee, takerFee, makerFeeAssetData, takerFeeAssetData } = order;
    return { makerFee, takerFee, makerFeeAssetData, takerFeeAssetData };
});