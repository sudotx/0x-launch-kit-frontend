import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Step, StepsModalState, UIState } from '../../util/types';
import { BigNumber } from 'bignumber.js';

const initialStepsModalState: StepsModalState = {
    doneSteps: [],
    currentStep: null,
    pendingSteps: [],
};

const initialState: UIState = {
    notifications: [],
    hasUnreadNotifications: false,
    stepsModal: initialStepsModalState,
    orderPriceSelected: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // --- Notifications ---
        setHasUnreadNotifications(state, action: PayloadAction<boolean>) {
            state.hasUnreadNotifications = action.payload;
        },
        setOrderPriceSelected(state, action: PayloadAction<number | null>) {
            state.orderPriceSelected = action.payload !== null ? new BigNumber(action.payload) : null;
        },
        setNotifications(state, action: PayloadAction<any[]>) {
            state.notifications = action.payload;
        },
        addNotifications(state, action: PayloadAction<any[]>) {
            const newNotifications = action.payload.filter(notification => {
                const exists = state.notifications
                    .filter(n => n.kind === notification.kind)
                    .some(n => n.id === notification.id);
                return !exists;
            });

            if (newNotifications.length) {
                state.notifications = [...newNotifications, ...state.notifications];
                state.hasUnreadNotifications = true;
            }
        },

        // --- Steps Modal ---
        setStepsModalDoneSteps(state, action: PayloadAction<Step[]>) {
            state.stepsModal.doneSteps = action.payload;
        },
        setStepsModalPendingSteps(state, action: PayloadAction<Step[]>) {
            state.stepsModal.pendingSteps = action.payload;
        },
        setStepsModalCurrentStep(state, action: PayloadAction<Step | null>) {
            state.stepsModal.currentStep = action.payload;
        },
        stepsModalAdvanceStep(state) {
            const { doneSteps, currentStep, pendingSteps } = state.stepsModal;

            if (currentStep === null && pendingSteps.length === 0) {
                return; // nothing to advance
            } else if (pendingSteps.length === 0 && currentStep !== null) {
                state.stepsModal.doneSteps = [...doneSteps, currentStep];
                state.stepsModal.currentStep = null;
            } else {
                state.stepsModal.doneSteps = [...doneSteps, currentStep as Step];
                state.stepsModal.currentStep = pendingSteps[0] || null;
                state.stepsModal.pendingSteps = pendingSteps.slice(1);
            }
        },
        stepsModalReset(state) {
            state.stepsModal = initialStepsModalState;
        },
    },
});

export const {
    // notifications
    setHasUnreadNotifications,
    setOrderPriceSelected,
    setNotifications,
    addNotifications,
    // steps modal
    setStepsModalDoneSteps,
    setStepsModalPendingSteps,
    setStepsModalCurrentStep,
    stepsModalAdvanceStep,
    stepsModalReset,
} = uiSlice.actions;

export default uiSlice.reducer;
