import React, { useState } from 'react';

import {
    ETH_DECIMALS,
    STEP_MODAL_DONE_STATUS_VISIBILITY_TIME,
    UI_DECIMALS_DISPLAYED_ON_STEP_MODALS,
} from '../../../common/constants';
import {
    INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT,
    UNEXPECTED_ERROR,
    USER_DENIED_TRANSACTION_SIGNATURE_ERR,
} from '../../../exceptions/common';
import { ConvertBalanceMustNotBeEqualException } from '../../../exceptions/convert_balance_must_not_be_equal_exception';
import { InsufficientEthDepositBalanceException } from '../../../exceptions/insufficient_eth_deposit_balance_exception';
import { UserDeniedTransactionSignatureException } from '../../../exceptions/user_denied_transaction_exception';
import { useErc20Store } from '../../../store';
import { getKnownTokens } from '../../../util/known_tokens';
import { sleep } from '../../../util/sleep';
import { tokenAmountInUnits, tokenAmountInUnitsToBigNumber } from '../../../util/tokens';
import { StepWrapEth } from '../../../util/types';

import { BaseStepModal } from './base_step_modal';
import { StepItem } from './steps_progress';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}

export const WrapEthStepContainer: React.FC<OwnProps> = (props) => {
    const { buildStepsProgress } = props;
    const {
        gasInfo,
        stepsModal,
        ethBalance,
        updateWethBalance,
        updateTokenBalances,
        stepsModalAdvanceStep,
    } = useErc20Store();
    const [errorCaption, setErrorCaption] = useState('');

    const step = stepsModal.currentStep as StepWrapEth;
    const { context, currentWethBalance, newWethBalance } = step;
    const amount = newWethBalance.minus(currentWethBalance);
    const wethToken = getKnownTokens().getWethToken();
    const ethAmount = tokenAmountInUnitsToBigNumber(amount.abs(), wethToken.decimals).toFixed(
        UI_DECIMALS_DISPLAYED_ON_STEP_MODALS,
    );

    const ethToWeth = amount.isGreaterThan(0);
    const convertingFrom = ethToWeth ? 'ETH' : 'wETH';
    const convertingTo = ethToWeth ? 'wETH' : 'ETH';

    const isOrder = context === 'order';

    const buildMessage = (prefix: string) => {
        return [
            prefix,
            ethAmount,
            convertingFrom,
            isOrder ? 'for trading' : null,
            `(${convertingFrom} to ${convertingTo}).`,
        ]
            .filter(x => x !== null)
            .join(' ');
    };

    const title = `Convert ${convertingFrom}`;

    const confirmCaption = `Confirm on Metamask to convert ${ethAmount} ${convertingFrom} into ${convertingTo}.`;
    const loadingCaption = buildMessage('Converting');
    const doneCaption = buildMessage('Converted');
    const loadingFooterCaption = `Waiting for confirmation....`;
    const doneFooterCaption = `${convertingFrom} converted!`;

    const convertWeth = async ({ onLoading, onDone, onError }: any) => {
        try {
            onLoading();
            await updateWethBalance(newWethBalance);
            await updateTokenBalances();
            onDone();
            await sleep(STEP_MODAL_DONE_STATUS_VISIBILITY_TIME);
            stepsModalAdvanceStep();
        } catch (err: any) {
            let exception = err;
            let caption = UNEXPECTED_ERROR;
            if (err.toString().includes(USER_DENIED_TRANSACTION_SIGNATURE_ERR)) {
                exception = new UserDeniedTransactionSignatureException();
                caption = USER_DENIED_TRANSACTION_SIGNATURE_ERR;
            } else if (err.toString().includes(INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT)) {
                const needed = tokenAmountInUnits(amount, ETH_DECIMALS);
                caption = `You have ${tokenAmountInUnits(ethBalance, ETH_DECIMALS)} ETH but you need ${needed} ETH to make this operation`;
                exception = new InsufficientEthDepositBalanceException(tokenAmountInUnits(ethBalance, ETH_DECIMALS), needed);
            } else if (err instanceof ConvertBalanceMustNotBeEqualException) {
                exception = err;
                caption = 'An unexpected error happened: tried to wrap ETH so that the resulting ETH amount stays the same';
            }
            setErrorCaption(caption);
            onError(exception);
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
            runAction={convertWeth}
            showPartialProgress={true}
        />
    );
};
