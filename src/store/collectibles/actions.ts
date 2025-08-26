import { SignedOrder } from '@0x/types';
import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { FEE_PERCENTAGE, FEE_RECIPIENT } from '../../common/constants';
import { cancelSignedOrder } from '../../services/orders';
import { calculateWorstCaseProtocolFee, isDutchAuction } from '../../util/orders';
import { getTransactionOptions } from '../../util/transactions';
import { Collectible } from '../../util/types';
import { ExtraArgument, RootState } from '../index';
import { getEthAccount, getGasPriceInWei } from '../selectors';
import { ExchangeContract } from '@0x/contract-wrappers';

export const selectCollectible = createAction('collectibles/selectCollectible', (collectible: Collectible | null) => ({
    payload: collectible,
}));

export const getAllCollectibles = createAsyncThunk<
    { collectibles: Collectible[] },
    void,
    { state: RootState; extra: ExtraArgument }
>('collectibles/fetchAll', async (_, { getState, extra }) => {
    const state = getState();
    const ethAccount = getEthAccount(state);
    const { getCollectiblesMetadataGateway } = extra;
    const collectiblesMetadataGateway = getCollectiblesMetadataGateway();
    const collectibles = await collectiblesMetadataGateway.fetchAllCollectibles(ethAccount);
    return { collectibles };
});

interface SubmitBuyCollectibleArgs {
    order: SignedOrder;
    ethAccount: string;
}

export const submitBuyCollectible = createAsyncThunk<
    string,
    SubmitBuyCollectibleArgs,
    { state: RootState; extra: ExtraArgument; dispatch: any }
>('collectibles/submitBuy', async ({ order, ethAccount }, { getState, dispatch, extra }) => {
    const { getContractWrappers } = extra;
    const contractWrappers = await getContractWrappers();
    // Remove web3Wrapper since it's not available

    const state = getState();
    const gasPrice = getGasPriceInWei(state);
    const protocolFee = calculateWorstCaseProtocolFee([order], gasPrice);

    if (isDutchAuction(order)) {
        throw new Error('DutchAuction currently unsupported');
    }

    const affiliateFeeAmount = order.takerAssetAmount
        .plus(protocolFee)
        .multipliedBy(FEE_PERCENTAGE)
        .integerValue(BigNumber.ROUND_CEIL);

    // Use ExchangeContract instead of forwarder
    const exchangeProxyAddress = contractWrappers.contractAddresses.exchangeProxy;
    const exchange = new ExchangeContract(exchangeProxyAddress, contractWrappers.getProvider());

    const tx = await exchange
        .marketBuyOrdersFillOrKill(
            [order],
            order.makerAssetAmount,
            [order.signature]
        )
        .sendTransactionAsync({
            from: ethAccount,
            value: order.takerAssetAmount.plus(affiliateFeeAmount).plus(protocolFee),
            ...getTransactionOptions(gasPrice),
        });

    // Remove web3Wrapper.awaitTransactionSuccessAsync since it's not available
    // await web3Wrapper.awaitTransactionSuccessAsync(tx);

    await dispatch(getAllCollectibles());
    return tx;
});

export const cancelOrderCollectible = createAsyncThunk<any, any, { state: RootState; dispatch: any }>(
    'collectibles/cancelOrder',
    async (order, { getState, dispatch }) => {
        const state = getState();
        const gasPrice = getGasPriceInWei(state);

        const transaction = await cancelSignedOrder(order, gasPrice);
        await dispatch(getAllCollectibles());
        return transaction;
    },
);