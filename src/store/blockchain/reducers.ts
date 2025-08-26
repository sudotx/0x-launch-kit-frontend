import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_ESTIMATED_TRANSACTION_TIME_MS, DEFAULT_GAS_PRICE, ZERO } from '../../common/constants';
import { BlockchainState, ConvertBalanceState, Web3State } from '../../util/types';

const initialState: BlockchainState = {
    ethAccount: '',
    web3State: Web3State.Loading,
    tokenBalances: [],
    ethBalance: ZERO,
    wethTokenBalance: null,
    gasInfo: {
        gasPriceInWei: DEFAULT_GAS_PRICE,
        estimatedTimeMs: DEFAULT_ESTIMATED_TRANSACTION_TIME_MS,
    },
    convertBalanceState: ConvertBalanceState.Success,
};

export const blockchainSlice = createSlice({
    name: 'blockchain',
    initialState,
    reducers: {
        setEthAccount(state, action: PayloadAction<string>) {
            state.ethAccount = action.payload;
        },
        setWeb3State(state, action: PayloadAction<Web3State>) {
            state.web3State = action.payload;
        },
        setTokenBalances(state, action: PayloadAction<any[]>) { // replace any[] with proper type
            state.tokenBalances = action.payload;
        },
        setWethTokenBalance(state, action: PayloadAction<any | null>) {
            state.wethTokenBalance = action.payload;
        },
        setGasInfo(state, action: PayloadAction<{ gasPriceInWei: any; estimatedTimeMs: number }>) {
            state.gasInfo = action.payload;
        },
        setWethBalance(state, action: PayloadAction<any>) {
            if (state.wethTokenBalance) {
                state.wethTokenBalance.balance = action.payload;
            }
        },
        setEthBalance(state, action: PayloadAction<any>) {
            state.ethBalance = action.payload;
        },
        // Async “states” become simple reducers:
        convertBalanceRequest(state) {
            state.convertBalanceState = ConvertBalanceState.Request;
        },
        convertBalanceFailure(state) {
            state.convertBalanceState = ConvertBalanceState.Failure;
        },
        convertBalanceSuccess(state) {
            state.convertBalanceState = ConvertBalanceState.Success;
        },
        initializeBlockchainData(state, action: PayloadAction<Partial<BlockchainState>>) {
            return { ...state, ...action.payload };
        },
    },
});

export const {
    setEthAccount,
    setWeb3State,
    setTokenBalances,
    setWethTokenBalance,
    setGasInfo,
    setWethBalance,
    setEthBalance,
    convertBalanceRequest,
    convertBalanceFailure,
    convertBalanceSuccess,
    initializeBlockchainData,
} = blockchainSlice.actions;

export default blockchainSlice.reducer;
