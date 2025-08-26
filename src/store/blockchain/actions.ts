import { ERC20TokenContract, ERC721TokenContract, ExchangeContract } from '@0x/contract-wrappers';
import { SignedOrder } from '@0x/types';
import { signatureUtils } from '@0x/order-utils';
import { MetamaskSubprovider } from '@0x/subproviders';
import { BigNumber } from '@0x/utils';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import {
    COLLECTIBLE_ADDRESS,
    NETWORK_ID,
    START_BLOCK_LIMIT,
    UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
    ZERO,
} from '../../common/constants';
import { ConvertBalanceMustNotBeEqualException } from '../../exceptions/convert_balance_must_not_be_equal_exception';
import { SignedOrderException } from '../../exceptions/signed_order_exception';
import { subscribeToFillEvents } from '../../services/exchange';
import { getGasEstimationInfoAsync } from '../../services/gas_price_estimation';
import { LocalStorage } from '../../services/local_storage';
import { tokensToTokenBalances, tokenToTokenBalance } from '../../services/tokens';
import { isMetamaskInstalled } from '../../services/web3_wrapper';
import { getKnownTokens, isWeth } from '../../util/known_tokens';
import { buildOrderFilledNotification } from '../../util/notifications';
import { buildSellCollectibleOrder } from '../../util/orders';
import { getTransactionOptions } from '../../util/transactions';
import {
    BlockchainState,
    Collectible,
    GasInfo,
    MARKETPLACES,
    OrderSide,
    ThunkCreator,
    Token,
    TokenBalance,
    Web3State,
} from '../../util/types';
import { getAllCollectibles } from '../collectibles/actions';
import { ExtraArgument, RootState } from '../index';
import { fetchMarkets, updateMarketPriceEther } from '../market/actions';
import { getOrderBook, getOrderbookAndUserOrders, initializeRelayerData } from '../relayer/actions';
import {
    getCurrencyPair,
    getEthAccount,
    getGasPriceInWei,
    getMarkets,
    getWethBalance,
} from '../selectors';
import { addNotifications, setHasUnreadNotifications, setNotifications } from '../ui/reducers';

// Simple actions to be replaced by slice reducers
export const initializeBlockchainData = createAction('blockchain/init', (payload: Partial<BlockchainState>) => ({ payload }));
export const setEthAccount = createAction('blockchain/ethAccount/set', (payload: string) => ({ payload }));
export const setWeb3State = createAction('blockchain/web3State/set', (payload: Web3State) => ({ payload }));
export const setTokenBalances = createAction('blockchain/tokenBalances/set', (payload: TokenBalance[]) => ({ payload }));
export const setEthBalance = createAction('blockchain/ethBalance/set', (payload: BigNumber) => ({ payload }));
export const setWethTokenBalance = createAction('blockchain/wethTokenBalance/set', (payload: TokenBalance | null) => ({
    payload,
}));

// Async Thunks
interface ToggleTokenLockArgs {
    token: Token;
    isUnlocked: boolean;
}

interface ToggleTokenLockResult {
    txHash: string;
    token: Token;
    isUnlocked: boolean;
}

export const toggleTokenLock = createAsyncThunk<
    ToggleTokenLockResult,
    ToggleTokenLockArgs,
    { state: RootState; extra: ExtraArgument }
>('blockchain/toggleTokenLock', async ({ token, isUnlocked }, { getState, extra }) => {
    const { getContractWrappers } = extra;
    const state = getState();
    const ethAccount = getEthAccount(state);
    const gasPrice = getGasPriceInWei(state);

    const contractWrappers = await getContractWrappers();

    const erc20Token = new ERC20TokenContract(token.address, contractWrappers.getProvider());
    const amount = isUnlocked ? ZERO : UNLIMITED_ALLOWANCE_IN_BASE_UNITS;
    const txHash = await erc20Token
        .approve(contractWrappers.contractAddresses.exchangeProxy, amount)
        .sendTransactionAsync({
            from: ethAccount,
            ...getTransactionOptions(gasPrice),
        });

    return { txHash, token, isUnlocked: !isUnlocked };
});

export const updateWethBalance = createAsyncThunk<
    string, // Returns txHash
    BigNumber, // Argument is newWethBalance
    { state: RootState; extra: ExtraArgument }
>('blockchain/updateWethBalance', async (newWethBalance, { getState, extra }) => {
    const { getContractWrappers } = extra;
    const contractWrappers = await getContractWrappers();
    const state = getState();
    const ethAccount = getEthAccount(state);
    const gasPrice = getGasPriceInWei(state);
    const wethBalance = getWethBalance(state);

    const wethToken = contractWrappers.weth9;
    if (wethBalance.isLessThan(newWethBalance)) {
        return wethToken.deposit().sendTransactionAsync({
            value: newWethBalance.minus(wethBalance),
            from: ethAccount,
            ...getTransactionOptions(gasPrice),
        });
    } else if (wethBalance.isGreaterThan(newWethBalance)) {
        return wethToken.withdraw(wethBalance.minus(newWethBalance)).sendTransactionAsync({
            from: ethAccount,
            ...getTransactionOptions(gasPrice),
        });
    } else {
        throw new ConvertBalanceMustNotBeEqualException(wethBalance, newWethBalance);
    }
});

interface UpdatedBalances {
    tokenBalances: TokenBalance[];
    ethBalance: BigNumber;
    wethTokenBalance: TokenBalance | null;
}

export const updateTokenBalances = createAsyncThunk<UpdatedBalances, void, { state: RootState; extra: ExtraArgument }>(
    'blockchain/updateTokenBalances',
    async (_, { getState, extra }) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        if (!ethAccount) {
            throw new Error('No ETH account available');
        }

        const knownTokens = getKnownTokens();
        const wethToken = knownTokens.getWethToken();
        const allTokens = [...knownTokens.getTokens(), wethToken];

        const allTokenBalances = await tokensToTokenBalances(allTokens, ethAccount);
        const wethBalance = allTokenBalances.find(b => isWeth(b.token.symbol)) || null;
        const tokenBalances = allTokenBalances.filter(b => !isWeth(b.token.symbol));

        const ethBalance = ZERO;

        return { tokenBalances, ethBalance, wethTokenBalance: wethBalance };
    },
);

export const updateGasInfo = createAsyncThunk<GasInfo>('blockchain/updateGasInfo', async () => {
    return getGasEstimationInfoAsync();
});

export const unlockCollectible = createAsyncThunk<
    string, // Returns txHash
    Collectible,
    { state: RootState; extra: ExtraArgument }
>('blockchain/unlockCollectible', async (collectible, { getState, extra }) => {
    const { getContractWrappers } = extra;
    const state = getState();
    const contractWrappers = await getContractWrappers();
    const gasPrice = getGasPriceInWei(state);
    const ethAccount = getEthAccount(state);
    const erc721Token = new ERC721TokenContract(COLLECTIBLE_ADDRESS, contractWrappers.getProvider());

    return erc721Token
        .setApprovalForAll(contractWrappers.contractAddresses.exchangeProxy, true)
        .sendTransactionAsync({ from: ethAccount, ...getTransactionOptions(gasPrice) });
});

export const unlockToken = createAsyncThunk<any, Token, { dispatch: any }>('blockchain/unlockToken', async (token, { dispatch }) => {
    return dispatch(toggleTokenLock({ token, isUnlocked: false }));
});

export const lockToken = createAsyncThunk<any, Token, { dispatch: any }>('blockchain/lockToken', async (token, { dispatch }) => {
    return dispatch(toggleTokenLock({ token, isUnlocked: true }));
});

interface CreateSignedCollectibleOrderArgs {
    collectible: Collectible;
    side: OrderSide;
    startPrice: BigNumber;
    expirationDate: BigNumber;
    endPrice: BigNumber | null;
}

export const createSignedCollectibleOrder = createAsyncThunk<
    SignedOrder,
    CreateSignedCollectibleOrderArgs,
    { state: RootState; extra: ExtraArgument }
>('blockchain/createSignedCollectibleOrder', async (args, { getState, extra }) => {
    const { collectible, side, startPrice, expirationDate, endPrice } = args;
    const { getContractWrappers } = extra;
    const state = getState();
    const ethAccount = getEthAccount(state);
    const collectibleId = new BigNumber(collectible.tokenId);

    try {
        const contractWrappers = await getContractWrappers();
        const wethAddress = getKnownTokens().getWethToken().address;
        const exchangeAddress = contractWrappers.contractAddresses.exchangeProxy;

        if (endPrice) {
            throw new Error('DutchAuction currently unsupported');
        }

        const order = await buildSellCollectibleOrder(
            {
                account: ethAccount,
                amount: new BigNumber('1'),
                price: startPrice,
                exchangeAddress,
                expirationDate,
                collectibleId,
                collectibleAddress: COLLECTIBLE_ADDRESS,
                wethAddress,
            },
            side,
        );

        throw new Error('Web3Wrapper not available - signature not implemented');
    } catch (error: any) {
        throw new SignedOrderException(error.message);
    }
});

// --- Complex Thunks (Orchestrators) --- //
// These are left as standard thunks for now, but they dispatch the new asyncThunks.

let fillEventsSubscription: string | null = null;
export const setConnectedUserNotifications: ThunkCreator<Promise<void>> = ethAccount => {
    return async (dispatch, getState, { getContractWrappers }) => {
        const knownTokens = getKnownTokens();
        const localStorage = new LocalStorage(window.localStorage);

        dispatch(setEthAccount(ethAccount));
        dispatch(setNotifications(localStorage.getNotifications(ethAccount)));
        dispatch(setHasUnreadNotifications(localStorage.getHasUnreadNotifications(ethAccount)));

        const state = getState();
        const contractWrappers = await getContractWrappers();
        const blockNumber = 0;
        const lastBlockChecked = localStorage.getLastBlockChecked(ethAccount);
        const fromBlock = lastBlockChecked !== null ? lastBlockChecked + 1 : Math.max(blockNumber - START_BLOCK_LIMIT, 1);
        const toBlock = blockNumber;
        const markets = getMarkets(state);

        const subscription = subscribeToFillEvents({
            exchange: new ExchangeContract(contractWrappers.contractAddresses.exchangeProxy, contractWrappers.getProvider()),
            fromBlock,
            toBlock,
            ethAccount,
            fillEventCallback: async fillEvent => {
                if (!knownTokens.isValidFillEvent(fillEvent)) {
                    return;
                }
                const timestamp = Math.floor(Date.now() / 1000);
                const notification = buildOrderFilledNotification(fillEvent, knownTokens, markets);
                dispatch(addNotifications([{ ...notification, timestamp: new Date(timestamp * 1000) }]));
            },
            pastFillEventsCallback: async fillEvents => {
                const validFillEvents = fillEvents.filter(knownTokens.isValidFillEvent);
                const notifications = await Promise.all(
                    validFillEvents.map(async fillEvent => {
                        const timestamp = Math.floor(Date.now() / 1000);
                        const notification = buildOrderFilledNotification(fillEvent, knownTokens, markets);
                        return { ...notification, timestamp: new Date(timestamp * 1000) };
                    }),
                );
                dispatch(addNotifications(notifications));
            },
        });

        if (fillEventsSubscription) {
            contractWrappers.exchangeProxy.unsubscribe(fillEventsSubscription);
        }
        fillEventsSubscription = subscription;

        localStorage.saveLastBlockChecked(blockNumber, ethAccount);
    };
};

export const initWallet: ThunkCreator<Promise<any>> = () => {
    return async (dispatch, getState) => {
        dispatch(setWeb3State(Web3State.Loading));
        try {
            await dispatch(initWalletBeginCommon());
            // Remove the marketplace check since it's not available
            // Just call both functions or determine marketplace differently
            await dispatch(initWalletERC20());
            await dispatch(initWalletERC721());
        } catch (error) {
            dispatch(setWeb3State(Web3State.Error));
        }
    };
};

const initWalletBeginCommon: ThunkCreator<Promise<any>> = () => {
    return async (dispatch, getState) => {
        dispatch(setWeb3State(Web3State.Error));
    };
};

const initWalletERC20: ThunkCreator<Promise<any>> = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        if (!ethAccount) {
            await dispatch(initializeAppNoMetamaskOrLocked());
            await dispatch(getOrderBook());
        } else {
            const knownTokens = getKnownTokens();
            const tokenBalances = await tokensToTokenBalances(knownTokens.getTokens(), ethAccount);
            const currencyPair = getCurrencyPair(state);
            const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
            const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);

            dispatch(setTokenBalances(tokenBalances));
            await dispatch(getOrderbookAndUserOrders());

            try {
                await dispatch(fetchMarkets());
                await dispatch(setConnectedUserNotifications(ethAccount));
            } catch (error) {
                // Relayer error
            }
        }
    };
};

const initWalletERC721: ThunkCreator<Promise<any>> = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        if (ethAccount) {
            await dispatch(getAllCollectibles());
        } else {
            await dispatch(initializeAppNoMetamaskOrLocked());
            await dispatch(getAllCollectibles());
        }
    };
};

export const initializeAppNoMetamaskOrLocked: ThunkCreator = () => {
    return async (dispatch, getState) => {
        if (isMetamaskInstalled()) {
            dispatch(setWeb3State(Web3State.Locked));
        } else {
            dispatch(setWeb3State(Web3State.NotInstalled));
        }
        const state = getState();
        const currencyPair = getCurrencyPair(state);
        const knownTokens = getKnownTokens();
        const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
        const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);

        dispatch(initializeRelayerData({ orders: [], userOrders: [] }));
        // Remove setMarketTokens call since it doesn't exist

        // Remove the marketplace check since it's not available
        // Just call both functions
        await dispatch(getOrderBook());
        await dispatch(fetchMarkets());
        await dispatch(getAllCollectibles());

        await dispatch(updateMarketPriceEther());
    };
};