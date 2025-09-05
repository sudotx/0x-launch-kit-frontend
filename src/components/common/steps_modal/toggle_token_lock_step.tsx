import React from 'react';

import { STEP_MODAL_DONE_STATUS_VISIBILITY_TIME } from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { sleep } from '../../../util/sleep';
import { tokenSymbolToDisplayString } from '../../../util/tokens';
import { StepToggleTokenLock } from '../../../util/types';

import { BaseStepModal } from './base_step_modal';
import { StepItem } from './steps_progress';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}

export const ToggleTokenLockStepContainer: React.FC<OwnProps> = (props) => {
    const { buildStepsProgress } = props;
    const { gasInfo, stepsModal, toggleTokenLock, stepsModalAdvanceStep } = useErc20Store();

    const step = stepsModal.currentStep as StepToggleTokenLock;
    const { context, isUnlocked, token } = step;
    const tokenSymbol = tokenSymbolToDisplayString(token.symbol);

    const title = context === 'order' ? 'Order setup' : isUnlocked ? 'Lock token' : 'Unlock token';
    const confirmCaption = `Confirm on Metamask to ${isUnlocked ? 'lock' : 'unlock'
        } ${tokenSymbol} for trading on 0x.`;
    const loadingCaption = isUnlocked
        ? `Locking ${tokenSymbol}. You won't be able to use it for trading until you unlock it again`
        : `Unlocking ${tokenSymbol}. It will remain unlocked for future trades`;
    const doneCaption = isUnlocked
        ? `Locked ${tokenSymbol}. You won't be able to use it for trading until you unlock it again`
        : `Unlocked ${tokenSymbol}. It will remain unlocked for future trades`;
    const errorCaption = `${isUnlocked ? 'Locking' : 'Unlocking'} ${tokenSymbol} failed.`;
    const loadingFooterCaption = `Waiting for confirmation...`;
    const doneFooterCaption = !isUnlocked ? ` ${tokenSymbol} Unlocked!` : ` ${tokenSymbol} Locked!`;

    const _toggleToken = async ({ onLoading, onDone, onError }: any) => {
        try {
            onLoading();
            await toggleTokenLock(token, isUnlocked);
            onDone(); // This will show the "Done" state
            await sleep(STEP_MODAL_DONE_STATUS_VISIBILITY_TIME);
            stepsModalAdvanceStep();
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
            runAction={_toggleToken}
            showPartialProgress={true}
        />
    );
};
