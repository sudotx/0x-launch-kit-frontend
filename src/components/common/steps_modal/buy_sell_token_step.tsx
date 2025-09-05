import { BigNumber } from '@0x/utils';
import React, { useState } from 'react';

import { ZERO } from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../../util/tokens';
import { OrderSide, StepBuySellMarket, Token, NotificationKind } from '../../../util/types';

import { BaseStepModal } from './base_step_modal';
import { StepItem } from './steps_progress';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}

export const BuySellTokenStepContainer: React.FC<OwnProps> = (props) => {
    const {
        gasInfo,
        stepsModal,
        quoteToken,
        submitMarketOrder,
        getOrderbookAndUserOrders,
        addNotifications,
    } = useErc20Store();

    const { buildStepsProgress } = props;
    const [amountInReturn, setAmountInReturn] = useState<BigNumber | null>(null);

    const step = stepsModal.currentStep as StepBuySellMarket;
    const { token } = step;
    const tokenSymbol = tokenSymbolToDisplayString(token.symbol);

    const isBuy = step.side === OrderSide.Buy;
    const amountOfTokenString = `${tokenAmountInUnits(
        step.amount,
        step.token.decimals,
        step.token.displayDecimals,
    ).toString()} ${tokenSymbol}`;

    const title = 'Order setup';

    const confirmCaption = `Confirm on Metamask to ${isBuy ? 'buy' : 'sell'} ${amountOfTokenString}.`;
    const loadingCaption = `Processing ${isBuy ? 'buy' : 'sale'} of ${amountOfTokenString}.`;
    const doneCaption = `${isBuy ? 'Buy' : 'Sell'} Order Complete!`;
    const errorCaption = `${isBuy ? 'buying' : 'selling'} ${amountOfTokenString}.`;
    const loadingFooterCaption = `Waiting for confirmation....`;

    const getAmountOfQuoteTokenString = (): string => {
        if (!quoteToken) {
            return '';
        }
        const quoteTokenSymbol = tokenSymbolToDisplayString(quoteToken.symbol);
        return `${tokenAmountInUnits(
            amountInReturn || ZERO,
            quoteToken.decimals,
            quoteToken.displayDecimals,
        ).toString()} ${quoteTokenSymbol}`;
    };

    const doneFooterCaption = `${isBuy ? amountOfTokenString : getAmountOfQuoteTokenString()} received`;

    const confirmOnMetamaskBuyOrSell = async ({ onLoading, onDone, onError }: any) => {
        const { amount, side } = step;
        try {
            const orderResult = await submitMarketOrder(amount, side);
            if (orderResult) {
                setAmountInReturn(orderResult.amountInReturn);

                onDone();
                addNotifications([
                    {
                        id: orderResult.txHash,
                        kind: NotificationKind.Market,
                        amount: step.amount,
                        token: step.token,
                        side: step.side,
                        timestamp: new Date(),
                        tx: Promise.resolve(),
                    },
                ]);
                await getOrderbookAndUserOrders();
            }
        } catch (err) {
            onError(err);
        }
    };

    return (
        <BaseStepModal
            step={step}
            title={title}
            confirmCaption={confirmCaption}
            loadingCaption={loadingCaption}
            doneCaption={doneCaption}
            errorCaption={errorCaption}
            loadingFooterCaption={loadingFooterCaption}
            doneFooterCaption={doneFooterCaption}
            buildStepsProgress={buildStepsProgress}
            estimatedTxTimeMs={gasInfo.estimatedTimeMs}
            runAction={confirmOnMetamaskBuyOrSell}
            showPartialProgress={true}
        />
    );
};
