import { BigNumber } from '@0x/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import styled from 'styled-components';
import { useAccount, useBalance } from 'wagmi';

import { ZERO } from '../../common/constants';
import { useErc20Store } from '../../store';
import { getKnownTokens } from '../../util/known_tokens';
import { tokenAmountInUnits } from '../../util/tokens';
import { StepKind, StepWrapEth } from '../../util/types';
import { BigNumberInput } from '../common/big_number_input';
import { Button } from '../common/button';
import { Card } from '../common/card';
import { ArrowUpDownIcon } from '../common/icons/arrow_up_down_icon';
import { lightThemeColors } from '../../themes/default_theme';



const Content = styled.div`
    padding: 20px;
`;

const BalanceRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const BalanceLabel = styled.label`
    font-weight: 500;
    font-size: 14px;
    line-height: normal;
    margin: 0 0 10px;
`;

const BalanceValue = styled.span`
    font-feature-settings: 'tnum' 1;
`;

const ConversionForm = styled.div`
    display: flex;
    align-items: flex-end;
    margin-top: 20px;
    gap: 10px;
`;

const InputWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const BigNumberInputStyled = styled(BigNumberInput)`
    width: 100%;
    padding: 10px;
    border: 1px solid ${lightThemeColors.borderColor};
    border-radius: 5px;
    height: 40px;
`;

const AmountDisplay = styled.div`
    width: 100%;
    padding: 10px;
    border: 1px solid ${lightThemeColors.borderColor};
    border-radius: 5px;
    height: 40px;
    display: flex;
    align-items: center;
    background-color: ${lightThemeColors.textInputBackgroundColor};
    color: ${lightThemeColors.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
`;

const SwapIconWrapper = styled.div`
    cursor: pointer;
    padding-bottom: 8px; /* align with input */
`;

const ButtonStyled = styled(Button)`
    width: 100%;
    margin-top: 20px;
`;

const WalletWethBalance: React.FC = () => {
    const { wethTokenBalance, setStepsModalCurrentStep, setStepsModalPendingSteps } = useErc20Store();
    const { address, isConnected } = useAccount();
    const { data: ethBalanceData } = useBalance({ address });

    const [isEthToWeth, setIsEthToWeth] = React.useState(true);
    const [amount, setAmount] = React.useState<BigNumber | null>(null);

    const ethBalance = ethBalanceData ? new BigNumber(ethBalanceData.value.toString()) : ZERO;
    const wethBalance = wethTokenBalance ? wethTokenBalance.balance : ZERO;
    const wethToken = getKnownTokens().getWethToken();

    const handleSwap = () => setIsEthToWeth(!isEthToWeth);

    const handleSubmit = () => {
        if (!amount || amount.isZero()) {
            return;
        }

        const currentWethBalance = wethBalance;
        const newWethBalance = isEthToWeth ? currentWethBalance.plus(amount) : currentWethBalance.minus(amount);

        const wrapEthStep: StepWrapEth = {
            kind: StepKind.WrapEth,
            currentWethBalance,
            newWethBalance,
            context: 'order',
        };

        setStepsModalCurrentStep(wrapEthStep);
        setStepsModalPendingSteps([]);
    };

    if (!isConnected) {
        return (
            <Card title="Wrap/Unwrap ETH">
                <Content>
                    <ConnectButton />
                </Content>
            </Card>
        );
    }

    const fromToken = isEthToWeth ? 'ETH' : 'WETH';
    const toToken = isEthToWeth ? 'WETH' : 'ETH';
    const maxAmount = isEthToWeth ? ethBalance : wethBalance;

    return (
        <Card title="Wrap/Unwrap ETH">
            <Content>
                <BalanceRow>
                    <BalanceLabel>ETH Balance</BalanceLabel>
                    <BalanceValue>{tokenAmountInUnits(ethBalance, 18, 4)}</BalanceValue>
                </BalanceRow>
                <BalanceRow>
                    <BalanceLabel>WETH Balance</BalanceLabel>
                    <BalanceValue>{tokenAmountInUnits(wethBalance, wethToken.decimals, 4)}</BalanceValue>
                </BalanceRow>
                <ConversionForm>
                    <InputWrapper>
                        <BalanceLabel>From {fromToken}</BalanceLabel>
                        <BigNumberInputStyled decimals={18} value={amount} onChange={setAmount} placeholder="0.00" max={maxAmount} />
                    </InputWrapper>
                    <SwapIconWrapper onClick={handleSwap}>
                        <ArrowUpDownIcon />
                    </SwapIconWrapper>
                    <InputWrapper>
                        <BalanceLabel>To {toToken}</BalanceLabel>
                        <AmountDisplay>{amount ? tokenAmountInUnits(amount, 18, 4) : '0.00'}</AmountDisplay>
                    </InputWrapper>
                </ConversionForm>
                <ButtonStyled onClick={handleSubmit} disabled={!amount || amount.isZero() || amount.isGreaterThan(maxAmount)}>
                    {isEthToWeth ? 'Wrap' : 'Unwrap'}
                </ButtonStyled>
            </Content>
        </Card>
    );
};

export const WalletWethBalanceContainer = React.memo(WalletWethBalance);