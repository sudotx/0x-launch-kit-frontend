import { ERC721TokenContract } from '@0x/contract-wrappers';
import { signatureUtils } from '@0x/order-utils';
import { MetamaskSubprovider } from '@0x/subproviders';
import { BigNumber } from '@0x/utils';
import { createAction } from 'typesafe-actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { SignedOrder } from '@0x/types';

import { COLLECTIBLE_ADDRESS, ZERO } from '../../common/constants';
import { InsufficientOrdersAmountException } from '../../exceptions/insufficient_orders_amount_exception';
import { InsufficientTokenBalanceException } from '../../exceptions/insufficient_token_balance_exception';
import { SignedOrderException } from '../../exceptions/signed_order_exception';
import { isWeth } from '../../util/known_tokens';
import { buildLimitOrder, buildMarketOrders, isDutchAuction } from '../../util/orders';
import {
    createBasicBuyCollectibleSteps,
    createBuySellLimitSteps,
    createBuySellMarketSteps,
    createSellCollectibleSteps,
} from '../../util/steps_modals_generation';
import {
    Collectible,
    NotificationKind,
    OrderFeeData,
    OrderSide,
    Step,
    StepKind,
    StepToggleTokenLock,
    StepWrapEth,
    Token,
    TokenBalance,
} from '../../util/types';
import * as selectors from '../selectors';
import { ExtraArgument, RootState } from '../index';
import {
    addNotifications,
    setStepsModalCurrentStep,
    setStepsModalDoneSteps,
    setStepsModalPendingSteps,
} from './reducers';

export const stepsModalAdvanceStep = createAction('ui/steps_modal/advance_step');

export const stepsModalReset = createAction('ui/steps_modal/reset');

interface StartToggleTokenLockStepsArgs {
    token: Token;
    isUnlocked: boolean;
}

export const startToggleTokenLockSteps = createAsyncThunk<void, StartToggleTokenLockStepsArgs, { state: RootState }>(
    'stepsModal/startToggleTokenLockSteps',
    async ({ token, isUnlocked }, { dispatch }) => {
        const toggleTokenLockStep = isUnlocked ? getLockTokenStep(token) : getUnlockTokenStep(token);

        dispatch(setStepsModalCurrentStep(toggleTokenLockStep));
        dispatch(setStepsModalPendingSteps([]));
        dispatch(setStepsModalDoneSteps([]));
    },
);

export const startWrapEtherSteps = createAsyncThunk<void, BigNumber, { state: RootState }>(
    'stepsModal/startWrapEtherSteps',
    async (newWethBalance, { dispatch, getState }) => {
        const state = getState();
        const currentWethBalance = selectors.getWethBalance(state);

        const wrapEthStep: StepWrapEth = {
            kind: StepKind.WrapEth,
            currentWethBalance,
            newWethBalance,
            context: 'standalone',
        };

        dispatch(setStepsModalCurrentStep(wrapEthStep));
        dispatch(setStepsModalPendingSteps([]));
        dispatch(setStepsModalDoneSteps([]));
    },
);

interface StartSellCollectibleStepsArgs {
    collectible: Collectible;
    startingPrice: BigNumber;
    side: OrderSide;
    expirationDate: BigNumber;
    endingPrice: BigNumber | null;
}

export const startSellCollectibleSteps = createAsyncThunk<
    void,
    StartSellCollectibleStepsArgs,
    { state: RootState; extra: ExtraArgument }
>('stepsModal/startSellCollectibleSteps', async (args, { dispatch, getState, extra: { getContractWrappers } }) => {
    const { collectible, startingPrice, side, expirationDate, endingPrice } = args;
    const state = getState();

    const contractWrappers = await getContractWrappers();
    const ethAccount = selectors.getEthAccount(state);

    const erc721Token = new ERC721TokenContract(COLLECTIBLE_ADDRESS, contractWrappers.getProvider());
    const isUnlocked = await erc721Token
        .isApprovedForAll(ethAccount, contractWrappers.contractAddresses.exchangeProxy)
        .callAsync();
    const sellCollectibleSteps: Step[] = createSellCollectibleSteps(
        collectible,
        startingPrice,
        side,
        isUnlocked,
        expirationDate,
        endingPrice,
    );
    dispatch(setStepsModalCurrentStep(sellCollectibleSteps[0]));
    dispatch(setStepsModalPendingSteps(sellCollectibleSteps.slice(1)));
    dispatch(setStepsModalDoneSteps([]));
});

interface StartBuyCollectibleStepsArgs {
    collectible: Collectible;
}

export const startBuyCollectibleSteps = createAsyncThunk<void, StartBuyCollectibleStepsArgs, { state: RootState }>(
    'stepsModal/startBuyCollectibleSteps',
    async ({ collectible }, { dispatch }) => {
        if (!collectible.order) {
            throw new Error('Collectible is not for sale');
        }

        let buyCollectibleSteps;
        if (isDutchAuction(collectible.order)) {
            throw new Error('DutchAuction currently unsupported');
        } else {
            buyCollectibleSteps = createBasicBuyCollectibleSteps(collectible.order, collectible);
        }

        dispatch(setStepsModalCurrentStep(buyCollectibleSteps[0]));
        dispatch(setStepsModalPendingSteps(buyCollectibleSteps.slice(1)));
        dispatch(setStepsModalDoneSteps([]));
    },
);

interface StartBuySellLimitStepsArgs {
    amount: BigNumber;
    price: BigNumber;
    side: OrderSide;
    orderFeeData: OrderFeeData;
}

export const startBuySellLimitSteps = createAsyncThunk<void, StartBuySellLimitStepsArgs, { state: RootState }>(
    'stepsModal/startBuySellLimitSteps',
    async (args, { dispatch, getState }) => {
        const { amount, price, side, orderFeeData } = args;
        const state = getState();
        const baseToken = selectors.getBaseToken(state) as Token;
        const quoteToken = selectors.getQuoteToken(state) as Token;
        const tokenBalances = selectors.getTokenBalances(state) as TokenBalance[];
        const wethTokenBalance = selectors.getWethTokenBalance(state) as TokenBalance;

        const buySellLimitFlow: Step[] = createBuySellLimitSteps(
            baseToken,
            quoteToken,
            tokenBalances,
            wethTokenBalance,
            amount,
            price,
            side,
            orderFeeData,
        );

        dispatch(setStepsModalCurrentStep(buySellLimitFlow[0]));
        dispatch(setStepsModalPendingSteps(buySellLimitFlow.slice(1)));
        dispatch(setStepsModalDoneSteps([]));
    },
);

interface StartBuySellMarketStepsArgs {
    amount: BigNumber;
    side: OrderSide;
    orderFeeData: OrderFeeData;
}

export const startBuySellMarketSteps = createAsyncThunk<void, StartBuySellMarketStepsArgs, { state: RootState }>(
    'stepsModal/startBuySellMarketSteps',
    async ({ amount, side, orderFeeData }, { dispatch, getState }) => {
        const state = getState();
        const baseToken = selectors.getBaseToken(state) as Token;
        const quoteToken = selectors.getQuoteToken(state) as Token;
        const tokenBalances = selectors.getTokenBalances(state) as TokenBalance[];
        const wethTokenBalance = selectors.getWethTokenBalance(state) as TokenBalance;
        const ethBalance = selectors.getEthBalance(state);
        const totalEthBalance = selectors.getTotalEthBalance(state);
        const quoteTokenBalance = selectors.getQuoteTokenBalance(state);
        const baseTokenBalance = selectors.getBaseTokenBalance(state);

        const orders = side === OrderSide.Buy ? selectors.getOpenSellOrders(state) : selectors.getOpenBuyOrders(state);
        const [_ordersToFill, filledAmounts, canBeFilled] = buildMarketOrders({ amount, orders }, side);
        if (!canBeFilled) {
            throw new InsufficientOrdersAmountException();
        }

        const totalFilledAmount = filledAmounts.reduce((total: BigNumber, currentValue: BigNumber) => {
            return total.plus(currentValue);
        }, ZERO);

        const price = totalFilledAmount.div(amount);

        if (side === OrderSide.Sell) {
            if (baseTokenBalance && baseTokenBalance.balance.isLessThan(totalFilledAmount)) {
                throw new InsufficientTokenBalanceException(baseToken.symbol);
            }
        } else {
            const ifEthAndWethNotEnoughBalance =
                isWeth(quoteToken.symbol) && totalEthBalance.isLessThan(totalFilledAmount);
            const ifOtherQuoteTokenAndNotEnoughBalance =
                !isWeth(quoteToken.symbol) &&
                quoteTokenBalance &&
                quoteTokenBalance.balance.isLessThan(totalFilledAmount);
            if (ifEthAndWethNotEnoughBalance || ifOtherQuoteTokenAndNotEnoughBalance) {
                throw new InsufficientTokenBalanceException(quoteToken.symbol);
            }
        }

        const buySellMarketFlow: Step[] = createBuySellMarketSteps(
            baseToken,
            quoteToken,
            tokenBalances,
            wethTokenBalance,
            ethBalance,
            amount,
            side,
            price,
            orderFeeData,
        );

        dispatch(setStepsModalCurrentStep(buySellMarketFlow[0]));
        dispatch(setStepsModalPendingSteps(buySellMarketFlow.slice(1)));
        dispatch(setStepsModalDoneSteps([]));
    },
);

const getUnlockTokenStep = (token: Token): StepToggleTokenLock => {
    return {
        kind: StepKind.ToggleTokenLock,
        token,
        isUnlocked: false,
        context: 'standalone',
    };
};

const getLockTokenStep = (token: Token): StepToggleTokenLock => {
    return {
        kind: StepKind.ToggleTokenLock,
        token,
        isUnlocked: true,
        context: 'standalone',
    };
};

interface CreateSignedOrderArgs {
    amount: BigNumber;
    price: BigNumber;
    side: OrderSide;
}

export const createSignedOrder = createAsyncThunk<
    SignedOrder,
    CreateSignedOrderArgs,
    { state: RootState; extra: ExtraArgument }
>('orders/createSignedOrder', async (args, { getState, extra: { getContractWrappers } }) => {
    const { amount, price, side } = args;
    const state = getState();
    const ethAccount = selectors.getEthAccount(state);
    const baseToken = selectors.getBaseToken(state) as Token;
    const quoteToken = selectors.getQuoteToken(state) as Token;
    try {
        const contractWrappers = await getContractWrappers();
        const provider = contractWrappers.getProvider();

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

        return signatureUtils.ecSignOrderAsync(provider, order, ethAccount);
    } catch (error) {
        throw new SignedOrderException((error as Error).message);
    }
});

interface AddMarketBuySellNotificationArgs {
    id: string;
    amount: BigNumber;
    token: Token;
    side: OrderSide;
    tx: Promise<any>;
}

export const addMarketBuySellNotification = createAsyncThunk<void, AddMarketBuySellNotificationArgs>(
    'notifications/addMarketBuySellNotification',
    async (args, { dispatch }) => {
        const { id, amount, token, side, tx } = args;
        dispatch(
            addNotifications([
                {
                    id,
                    kind: NotificationKind.Market,
                    amount,
                    token,
                    side,
                    tx,
                    timestamp: new Date(),
                },
            ]),
        );
    },
);