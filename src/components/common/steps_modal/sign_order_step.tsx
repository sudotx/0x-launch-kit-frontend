import { BigNumber } from '@0x/utils';
import React, { useState } from 'react';

import { INSUFFICIENT_FEE_BALANCE, INSUFFICIENT_MAKER_BALANCE_ERR, SIGNATURE_ERR } from '../../../exceptions/common';
import { InsufficientFeeBalanceException } from '../../../exceptions/insufficient_fee_balance_exception';
import { InsufficientTokenBalanceException } from '../../../exceptions/insufficient_token_balance_exception';
import { SignatureFailedException } from '../../../exceptions/signature_failed_exception';
import { useErc20Store } from '../../../store';
import { tokenSymbolToDisplayString } from '../../../util/tokens';
import { OrderSide, StepBuySellLimitOrder } from '../../../util/types';

import { BaseStepModal } from './base_step_modal';
import { StepItem } from './steps_progress';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}

export const SignOrderStepContainer: React.FC<OwnProps> = (props) => {
    const { buildStepsProgress } = props;
    const { gasInfo, stepsModal, createSignedOrder, submitLimitOrder } = useErc20Store();
    const [errorCaption, setErrorCaption] = useState('Error signing/submitting order.');

    const step = stepsModal.currentStep as StepBuySellLimitOrder;
    const isBuy = step.side === OrderSide.Buy;

    const title = 'Order setup';
    const confirmCaption = 'Confirm signature on Metamask to submit order to the book.';
    const loadingCaption = 'Submitting order.';
    const doneCaption = `${isBuy ? 'Buy' : 'Sell'} order for ${tokenSymbolToDisplayString(
        step.token.symbol,
    )} placed! (may not be filled immediately)`;
    const loadingFooterCaption = `Waiting for signature...`;
    const doneFooterCaption = `Order placed!`;

    const getSignedOrder = async ({ onLoading, onDone, onError }: any) => {
        const { amount, price, side } = step;
        try {
            const signedOrder = await createSignedOrder(amount, price, side);
            if (signedOrder) {
                onLoading();
                await submitLimitOrder(signedOrder, amount, side);
                onDone();
            }
        } catch (error: any) {
            let errorException = error;
            if (error.message.toLowerCase() === INSUFFICIENT_MAKER_BALANCE_ERR.toLowerCase()) {
                errorException = new InsufficientTokenBalanceException(step.token.symbol);
            } else if (error.message.toString().includes(INSUFFICIENT_FEE_BALANCE)) {
                errorException = new InsufficientFeeBalanceException();
            } else if (error.message.toString().includes(SIGNATURE_ERR)) {
                errorException = new SignatureFailedException(error);
            }

            setErrorCaption(errorException.message);
            onError(errorException);
        }
    };

    return (
        <BaseStepModal
            buildStepsProgress={buildStepsProgress}
            confirmCaption={confirmCaption}
            doneCaption={doneCaption}
            doneFooterCaption={doneFooterCaption}
            errorCaption={errorCaption}
            estimatedTxTimeMs={gasInfo.estimatedTimeMs}
            loadingCaption={loadingCaption}
            loadingFooterCaption={loadingFooterCaption}
            runAction={getSignedOrder}
            step={step}
            title={title}
        />
    );
};
