
import { ERC20TokenContract, ExchangeContract } from '@0x/contract-wrappers';
import { SignedOrder, signatureUtils } from '@0x/order-utils';
import { BigNumber } from 'bignumber.js';
import queryString from 'query-string';
import { create } from 'zustand';
import {
    DEFAULT_ESTIMATED_TRANSACTION_TIME_MS,
    DEFAULT_GAS_PRICE,
    FEE_PERCENTAGE,
    UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
    ZERO,
} from '../common/constants';
import { availableMarkets } from '../common/markets';
import { INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR } from '../exceptions/common';
import { ConvertBalanceMustNotBeEqualException } from '../exceptions/convert_balance_must_not_be_equal_exception';
import { InsufficientOrdersAmountException } from '../exceptions/insufficient_orders_amount_exception';
import { RelayerException } from '../exceptions/relayer_exception';
import { SignedOrderException } from '../exceptions/signed_order_exception';
import { getContractWrappers } from '../services/contract_wrappers';
import { getGasEstimationInfoAsync } from '../services/gas_price_estimation';
import { getMarketPriceEther } from '../services/markets';
import {
    cancelSignedOrder as cancelSignedOrderService,
    getAllOrdersAsUIOrders,
    getAllOrdersAsUIOrdersWithoutOrdersInfo,
    getUserOrdersAsUIOrders,
} from '../services/orders';
import { getRelayer } from '../services/relayer';
import { tokensToTokenBalances } from '../services/tokens';
import { getKnownTokens, isWeth } from '../util/known_tokens';
import { buildLimitOrder, buildMarketOrders, calculateWorstCaseProtocolFee, sumTakerAssetFillableOrders } from '../util/orders';
import { getTransactionOptions } from '../util/transactions';
import {
    BlockchainState,
    ConvertBalanceState,
    CurrencyPair,
    Market,
    MarketState,
    Notification,
    NotificationKind,
    OrderSide,
    RelayerState,
    Step,
    StepsModalState,
    Token,
    UIOrder,
    UIState,
    Web3State
} from '../util/types';

// Define the initial state by combining the initial states of the old slices
const initialBlockchainState: BlockchainState = {
    ethAccount: '',
    web3State: Web3State.Loading,
    tokenBalances: [],
    ethBalance: ZERO,
    wethTokenBalance: null,
    gasInfo: {
        gasPriceInWei: DEFAULT_GAS_PRICE,
        estimatedTimeMs: DEFAULT_ESTIMATED_TRANSACTION_TIME_MS,
    },
    convertBalanceState: ConvertBalanceState.Success, // Simplified from enum
};

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

const initialRelayerState: RelayerState = {
    orders: [],
    userOrders: [],
};

const initialStepsModalState: StepsModalState = {
    doneSteps: [],
    currentStep: null,
    pendingSteps: [],
};

const initialUiState: UIState = {
    notifications: [],
    hasUnreadNotifications: false,
    stepsModal: initialStepsModalState,
    orderPriceSelected: null,
};

interface Erc20State extends BlockchainState, MarketState, RelayerState, UIState { }

const initialState: Erc20State = {
    ...initialBlockchainState,
    ...initialMarketState,
    ...initialRelayerState,
    ...initialUiState,
};

// Define actions that modify the state
interface Erc20Actions {
    setEthAccount: (ethAccount: string) => void;
    setWeb3State: (web3State: Web3State) => void;
    setMarketTokens: (baseToken: Token, quoteToken: Token) => void;
    setCurrencyPair: (currencyPair: CurrencyPair) => void;
    setMarkets: (markets: Market[]) => void;
    setEthInUsd: (ethInUsd: BigNumber | null) => void;
    setOrders: (orders: UIOrder[]) => void;
    setUserOrders: (userOrders: UIOrder[]) => void;
    initializeRelayerData: (relayerData: RelayerState) => void;
    setHasUnreadNotifications: (hasUnread: boolean) => void;
    setOrderPriceSelected: (price: BigNumber | null) => void;
    setNotifications: (notifications: Notification[]) => void;
    addNotifications: (newNotifications: Notification[]) => void;
    setStepsModalDoneSteps: (steps: Step[]) => void;
    setStepsModalPendingSteps: (steps: Step[]) => void;
    setStepsModalCurrentStep: (step: Step | null) => void;
    stepsModalAdvanceStep: () => void;
    stepsModalReset: () => void;
    updateGasInfo: () => Promise<void>;
    updateTokenBalances: () => Promise<void>;
    updateMarketPriceEther: () => Promise<void>;
    fetchMarkets: () => Promise<void>;
    getAllOrders: () => Promise<void>;
    getUserOrders: () => Promise<void>;
    getOrderbookAndUserOrders: () => Promise<void>;
    toggleTokenLock: (token: Token, isUnlocked: boolean) => Promise<string | undefined>;
    updateWethBalance: (newWethBalance: BigNumber) => Promise<string | undefined>;
    createSignedOrder: (amount: BigNumber, price: BigNumber, side: OrderSide) => Promise<SignedOrder | undefined>;
    submitLimitOrder: (signedOrder: SignedOrder, amount: BigNumber, side: OrderSide) => Promise<void>;
    submitMarketOrder: (amount: BigNumber, side: OrderSide) => Promise<{ txHash: string; amountInReturn: BigNumber } | undefined>;
    cancelOrder: (order: UIOrder) => Promise<string | undefined>;
}

// Create the Zustand store
export const useErc20Store = create<Erc20State & Erc20Actions>((set, get) => ({
    ...initialState,

    // --- Synchronous Actions ---
    setEthAccount: (ethAccount) => set({ ethAccount }),
    setWeb3State: (web3State) => set({ web3State }),
    setMarketTokens: (baseToken, quoteToken) => set({ baseToken, quoteToken }),
    setCurrencyPair: (currencyPair) => {
        const knownTokens = getKnownTokens();
        const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
        const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);
        set({ currencyPair, baseToken, quoteToken });
    },
    setMarkets: (markets) => set({ markets }),
    setEthInUsd: (ethInUsd) => set({ ethInUsd }),
    setOrders: (orders) => set({ orders }),
    setUserOrders: (userOrders) => set({ userOrders }),
    initializeRelayerData: (relayerData) => set({ orders: relayerData.orders, userOrders: relayerData.userOrders }),
    setHasUnreadNotifications: (hasUnread) => set({ hasUnreadNotifications: hasUnread }),
    setOrderPriceSelected: (price) => set({ orderPriceSelected: price }),
    setNotifications: (notifications) => set({ notifications }),
    addNotifications: (newNotifications) => {
        const existing = get().notifications;
        const filtered = newNotifications.filter(n => !existing.some(e => e.id === n.id && e.kind === n.kind));
        if (filtered.length > 0) {
            set({ notifications: [...filtered, ...existing], hasUnreadNotifications: true });
        }
    },
    setStepsModalDoneSteps: (steps) => set(state => ({ stepsModal: { ...state.stepsModal, doneSteps: steps } })),
    setStepsModalPendingSteps: (steps) => set(state => ({ stepsModal: { ...state.stepsModal, pendingSteps: steps } })),
    setStepsModalCurrentStep: (step) => set(state => ({ stepsModal: { ...state.stepsModal, currentStep: step } })),
    stepsModalAdvanceStep: () => {
        const { currentStep, pendingSteps, doneSteps } = get().stepsModal;
        if (currentStep === null && pendingSteps.length === 0) return;

        if (pendingSteps.length === 0 && currentStep !== null) {
            set(state => ({
                stepsModal: { ...state.stepsModal, doneSteps: [...doneSteps, currentStep], currentStep: null }
            }));
        } else {
            set(state => ({
                stepsModal: { ...state.stepsModal, doneSteps: [...doneSteps, currentStep as Step], currentStep: pendingSteps[0] || null, pendingSteps: pendingSteps.slice(1) }
            }));
        }
    },
    stepsModalReset: () => set({ stepsModal: initialStepsModalState }),

    // --- Asynchronous Actions ---
    updateGasInfo: async () => {
        try {
            const gasInfo = await getGasEstimationInfoAsync();
            set({ gasInfo });
        } catch (error) {
            console.error('Failed to fetch gas info', error);
        }
    },
    updateTokenBalances: async () => {
        const { ethAccount } = get();
        if (!ethAccount) {
            return;
        }

        try {
            const knownTokens = getKnownTokens();
            const wethToken = knownTokens.getWethToken();
            const allTokens = [...knownTokens.getTokens(), wethToken];

            const allTokenBalances = await tokensToTokenBalances(allTokens, ethAccount);
            const wethBalance = allTokenBalances.find(b => isWeth(b.token.symbol)) || null;
            const tokenBalances = allTokenBalances.filter(b => !isWeth(b.token.symbol));

            // TODO: Figure out where to get the real ETH balance from
            const ethBalance = ZERO;

            set({
                tokenBalances,
                ethBalance,
                wethTokenBalance: wethBalance
            });
        } catch (error) {
            console.error('Failed to update token balances', error);
        }
    },
    updateMarketPriceEther: async () => {
        try {
            const ethInUsd = await getMarketPriceEther();
            set({ ethInUsd });
        } catch (error) {
            console.error('Failed to fetch market price ether', error);
        }
    },
    fetchMarkets: async () => {
        const knownTokens = getKnownTokens();
        const relayer = getRelayer();

        try {
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
            set({ markets: markets.filter((m): m is Market => m !== null) });
        } catch (error) {
            console.error('Failed to fetch markets', error);
        }
    },
    getAllOrders: async () => {
        const { baseToken, quoteToken, web3State, makerAddresses } = get();
        if (!baseToken || !quoteToken) {
            return;
        }

        try {
            const isWeb3NotDoneState = [Web3State.Locked, Web3State.NotInstalled, Web3State.Error].includes(web3State);
            let orders;
            if (isWeb3NotDoneState) {
                orders = await getAllOrdersAsUIOrdersWithoutOrdersInfo(baseToken, quoteToken, makerAddresses);
            } else {
                orders = await getAllOrdersAsUIOrders(baseToken, quoteToken, makerAddresses);
            }
            set({ orders });
        } catch (error) {
            console.error('Failed to get all orders', error);
        }
    },
    getUserOrders: async () => {
        const { web3State, ethAccount, baseToken, quoteToken } = get();
        if (web3State === Web3State.Done && ethAccount && baseToken && quoteToken) {
            try {
                const userOrders = await getUserOrdersAsUIOrders(baseToken, quoteToken, ethAccount);
                set({ userOrders });
            } catch (error) {
                console.error('Failed to get user orders', error);
            }
        } else {
            set({ userOrders: [] });
        }
    },
    getOrderbookAndUserOrders: async () => {
        const { getAllOrders, getUserOrders } = get();
        await getAllOrders();
        await getUserOrders();
    },
    toggleTokenLock: async (token, isUnlocked) => {
        const { ethAccount, gasInfo } = get();
        const contractWrappers = await getContractWrappers();
        const erc20Token = new ERC20TokenContract(token.address, contractWrappers.getProvider());
        const amount = isUnlocked ? ZERO : UNLIMITED_ALLOWANCE_IN_BASE_UNITS;
        try {
            const txHash = await erc20Token
                .approve(contractWrappers.contractAddresses.exchangeProxy, amount)
                .sendTransactionAsync({
                    from: ethAccount,
                    ...getTransactionOptions(gasInfo.gasPriceInWei),
                });
            return txHash;
        } catch (error) {
            console.error('Failed to toggle token lock', error);
        }
    },
    updateWethBalance: async (newWethBalance) => {
        const { ethAccount, gasInfo, wethTokenBalance } = get();
        const contractWrappers = await getContractWrappers();
        const wethBalance = wethTokenBalance ? wethTokenBalance.balance : ZERO;

        const wethToken = contractWrappers.weth9;
        if (wethBalance.isLessThan(newWethBalance)) {
            try {
                return wethToken.deposit().sendTransactionAsync({
                    value: newWethBalance.minus(wethBalance),
                    from: ethAccount,
                    ...getTransactionOptions(gasInfo.gasPriceInWei),
                });
            } catch (error) {
                console.error('Failed to deposit WETH', error);
            }
        } else if (wethBalance.isGreaterThan(newWethBalance)) {
            try {
                return wethToken.withdraw(wethBalance.minus(newWethBalance)).sendTransactionAsync({
                    from: ethAccount,
                    ...getTransactionOptions(gasInfo.gasPriceInWei),
                });
            } catch (error) {
                console.error('Failed to withdraw WETH', error);
            }
        } else {
            throw new ConvertBalanceMustNotBeEqualException(wethBalance, newWethBalance);
        }
    },
    createSignedOrder: async (amount, price, side) => {
        const { ethAccount, baseToken, quoteToken } = get();
        if (!baseToken || !quoteToken) {
            throw new Error('Base or quote token not set');
        }
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
    },
    submitLimitOrder: async (signedOrder, amount, side) => {
        const { baseToken, getOrderbookAndUserOrders, addNotifications } = get();
        if (!baseToken) return;

        try {
            await getRelayer().submitOrderAsync(signedOrder);
            await getOrderbookAndUserOrders();
            addNotifications([
                {
                    id: signedOrder.signature,
                    kind: NotificationKind.Limit,
                    amount,
                    token: baseToken,
                    side,
                    timestamp: new Date(),
                },
            ]);
        } catch (error: any) {
            throw new RelayerException(error.message);
        }
    },
    submitMarketOrder: async (amount, side) => {
        const { orders, gasInfo, ethAccount, baseToken, quoteToken, ethBalance, getOrderbookAndUserOrders, updateTokenBalances, addNotifications } = get();
        const openSellOrders = orders.filter(o => o.side === OrderSide.Sell).sort((o1, o2) => o2.price.comparedTo(o1.price));
        const openBuyOrders = orders.filter(o => o.side === OrderSide.Buy).sort((o1, o2) => o2.price.comparedTo(o1.price));

        const [ordersToFill, filledAmounts, canBeFilled] = buildMarketOrders({ amount, orders: side === OrderSide.Buy ? openSellOrders : openBuyOrders }, side);

        if (!canBeFilled) {
            window.alert(INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR);
            throw new InsufficientOrdersAmountException();
        }

        const protocolFee = calculateWorstCaseProtocolFee(ordersToFill, gasInfo.gasPriceInWei);
        const ethAmountRequired = filledAmounts.reduce((total: BigNumber, currentValue: BigNumber) => total.plus(currentValue), ZERO);
        const affiliateFeeAmount = ethAmountRequired.plus(protocolFee).multipliedBy(FEE_PERCENTAGE).integerValue(BigNumber.ROUND_CEIL);
        const totalEthAmount = ethAmountRequired.plus(protocolFee).plus(affiliateFeeAmount);

        const contractWrappers = await getContractWrappers();
        const isMarketBuyForwarder =
            side === OrderSide.Buy &&
            quoteToken && isWeth(quoteToken.symbol) &&
            ethBalance.isGreaterThan(totalEthAmount) &&
            contractWrappers.contractAddresses.exchangeProxy !== '0x0000000000000000000000000000000000000000';

        const orderSignatures = ordersToFill.map(o => o.signature);
        let txPromise: Promise<string>;

        const exchange = new ExchangeContract(contractWrappers.contractAddresses.exchangeProxy, contractWrappers.getProvider());
        const txFunction = side === OrderSide.Buy ? exchange.marketBuyOrdersFillOrKill : exchange.marketSellOrdersFillOrKill;

        if (isMarketBuyForwarder) {
            txPromise = txFunction(ordersToFill, amount, orderSignatures).sendTransactionAsync({
                from: ethAccount,
                value: totalEthAmount,
                ...getTransactionOptions(gasInfo.gasPriceInWei),
            });
        } else {
            txPromise = txFunction(ordersToFill, amount, orderSignatures).sendTransactionAsync({
                from: ethAccount,
                value: protocolFee,
                ...getTransactionOptions(gasInfo.gasPriceInWei),
            });
        }

        const txHash = await txPromise;

        if (baseToken) {
            addNotifications([
                {
                    id: txHash,
                    kind: NotificationKind.Market,
                    amount,
                    token: baseToken,
                    side,
                    timestamp: new Date(),
                    tx: txPromise,
                },
            ]);
        }

        await updateTokenBalances();
        await getOrderbookAndUserOrders();

        const amountInReturn = sumTakerAssetFillableOrders(side, ordersToFill, filledAmounts);

        return { txHash, amountInReturn };
    },
    cancelOrder: async (order) => {
        const { gasInfo, baseToken, addNotifications, getOrderbookAndUserOrders } = get();
        if (!baseToken) return;

        const txPromise = cancelSignedOrderService(order.rawOrder, gasInfo.gasPriceInWei);
        const tx = await txPromise;

        addNotifications([
            {
                id: tx,
                kind: NotificationKind.CancelOrder,
                amount: order.size,
                token: baseToken,
                timestamp: new Date(),
                tx: txPromise,
            },
        ]);

        await getOrderbookAndUserOrders();
        return tx;
    },
}));
