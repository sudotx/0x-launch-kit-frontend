import React from 'react';
import Modal from 'react-modal';
import { withTheme } from 'styled-components';

import { useErc20Store } from '../../../store/erc20';
import { Theme } from '../../../themes/commons';
import { getStepTitle, isLongStep } from '../../../util/steps';
import { Step, StepKind } from '../../../util/types';
import { CloseModalButton } from '../icons/close_modal_button';

import { BuySellTokenStepContainer } from './buy_sell_token_step';
import { SignOrderStepContainer } from './sign_order_step';
import { ModalContent } from './steps_common';
import { StepItem } from './steps_progress';
import { ToggleTokenLockStepContainer } from './toggle_token_lock_step';
import { UnlockCollectiblesStepContainer } from './unlock_collectibles_step';
import { WrapEthStepContainer } from './wrap_eth_step';

interface OwnProps {
    theme: Theme;
}

const StepsModal: React.FC<OwnProps> = (props) => {
    const { stepsModal, stepsModalReset } = useErc20Store();
    const { currentStep, doneSteps, pendingSteps } = stepsModal;
    const isOpen = currentStep !== null;

    const buildStepsProgress = (currentStepItem: StepItem): StepItem[] => [
        ...doneSteps.map(doneStep => ({
            title: getStepTitle(doneStep),
            progress: 100,
            active: false,
            isLong: isLongStep(doneStep),
        })),
        currentStepItem,
        ...pendingSteps.map(pendingStep => ({
            title: getStepTitle(pendingStep),
            progress: 0,
            active: false,
            isLong: isLongStep(pendingStep),
        })),
    ];

    const stepIndex = doneSteps.length;

    return (
        <Modal isOpen={isOpen} >
            <CloseModalButton onClick={stepsModalReset} />
            <ModalContent>
                {currentStep && currentStep.kind === StepKind.ToggleTokenLock && (
                    <ToggleTokenLockStepContainer key={stepIndex} buildStepsProgress={buildStepsProgress} />
                )}
                {currentStep && currentStep.kind === StepKind.UnlockCollectibles && (
                    <UnlockCollectiblesStepContainer key={stepIndex} buildStepsProgress={buildStepsProgress} />
                )}
                {currentStep && currentStep.kind === StepKind.BuySellLimit && (
                    <SignOrderStepContainer key={stepIndex} buildStepsProgress={buildStepsProgress} />
                )}
                {currentStep && currentStep.kind === StepKind.BuySellMarket && (
                    <BuySellTokenStepContainer key={stepIndex} buildStepsProgress={buildStepsProgress} />
                )}
                {currentStep && currentStep.kind === StepKind.WrapEth && (
                    <WrapEthStepContainer key={stepIndex} buildStepsProgress={buildStepsProgress} />
                )}
            </ModalContent>
        </Modal>
    );
};

const StepsModalContainer = withTheme(StepsModal);

export { StepsModal, StepsModalContainer };
