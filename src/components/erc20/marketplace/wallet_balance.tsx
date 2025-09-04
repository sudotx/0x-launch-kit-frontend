import { BigNumber } from '@0x/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import styled from 'styled-components';
import { useAccount, useBalance } from 'wagmi';

import { isWeth } from '../../../util/known_tokens';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../../util/tokens';
import { ButtonVariant } from '../../../util/types';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { ErrorCard } from '../../common/error_card';
import { IconType, Tooltip } from '../../common/tooltip';
import { useSelector } from 'react-redux';
import { getCurrencyPair, getQuoteToken, getBaseTokenBalance, getQuoteTokenBalance, getTotalEthBalance } from '../../../store/selectors';
import { mockQuoteToken, mockBaseToken } from '../../../util/mockData';
import { lightThemeColors } from '../../../themes/default_theme';

const LabelWrapper = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 8px 0;
`;

const Label = styled.span`
    align-items: center;
    color: ${lightThemeColors.textColorCommon};
    display: flex;
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.2;
`;

const Value = styled.span`
    color: ${lightThemeColors.textColorCommon};
    font-feature-settings: 'tnum' 1;
    flex-shrink: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    text-align: right;
    white-space: nowrap;
`;

const WalletStatusBadge = styled.div<{ isConnected?: boolean }>`
    border-radius: 50%;
    height: 8px;
    margin-right: 6px;
    width: 8px;
`;

const WalletStatusTitle = styled.h3`
    color: ${lightThemeColors.textLight};
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    text-align: right;
`;

const WalletStatusContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const TooltipStyled = styled(Tooltip)`
    margin-left: 10px;
`;

interface ErrorCardStyledProps {
    cursor?: string;
}

const ErrorCardStyled = styled(ErrorCard) <ErrorCardStyledProps>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    z-index: 5;
`;

ErrorCardStyled.defaultProps = {
    cursor: 'pointer',
};

const WalletErrorContainer = styled.div`
    height: 140px;
    position: relative;
`;

const WalletErrorText = styled.p`
    font-size: 16px;
    font-weight: normal;
    line-height: 23px;
    margin: 0;
    padding: 20px 0;
`;

const SimplifiedTextBox = styled.div<{ top?: string; bottom?: string; left?: string; right?: string }>`
    position: absolute;
    z-index: 1;

`;

const ButtonStyled = styled(Button)`
    width: 100%;
`;

const ConnectButtonWrapper = styled.div`
    width: 100%;
`;

const simplifiedTextBoxBig = () => (
    <svg width="67" height="14" viewBox="0 0 67 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="67" height="14" rx="4" />
    </svg>
);

const simplifiedTextBoxSmall = () => (
    <svg width="56" height="14" viewBox="0 0 56 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="14" rx="4" />
    </svg>
);

const getWalletName = () => 'Wallet';

const getWallet = (isConnected: boolean) => (
    <WalletStatusContainer>
        <WalletStatusBadge isConnected={isConnected} />
        <WalletStatusTitle>{getWalletName()}</WalletStatusTitle>
    </WalletStatusContainer>
);

const getWalletTitle = (isConnected: boolean) => {
    return isConnected ? 'Wallet Balance' : 'Connect Wallet';
};

const WalletBalance: React.FC = () => {
    const { isConnected, address, isConnecting } = useAccount();
    const { data: ethBalance } = useBalance({
        address: address,
    });

    // Use mock data as fallbacks
    const currencyPair = useSelector(getCurrencyPair) || { base: 'ZRX', quote: 'WETH' };
    const quoteToken = useSelector(getQuoteToken) || mockQuoteToken;
    const baseTokenBalance = useSelector(getBaseTokenBalance) || {
        balance: new BigNumber('1000000000000000000000'), // 1000 tokens
        token: mockBaseToken
    };
    const quoteTokenBalance = useSelector(getQuoteTokenBalance) || {
        balance: new BigNumber('500000000000000000000') // 500 tokens
    };
    const totalEthBalance = useSelector(getTotalEthBalance) || new BigNumber('1000000000000000000'); // 1 ETH

    const getWalletContent = () => {
        if (isConnecting) {
            return <ButtonStyled variant={ButtonVariant.Tertiary}>Connecting...</ButtonStyled>;
        }

        if (quoteToken && baseTokenBalance && quoteTokenBalance) {
            const quoteTokenBalanceAmount = isWeth(quoteToken.symbol) ? totalEthBalance : quoteTokenBalance.balance;
            const quoteBalanceString = tokenAmountInUnits(
                quoteTokenBalanceAmount,
                quoteToken.decimals,
                quoteToken.displayDecimals,
            );
            const baseBalanceString = tokenAmountInUnits(
                baseTokenBalance.balance,
                baseTokenBalance.token.decimals,
                baseTokenBalance.token.displayDecimals,
            );
            const toolTip = isWeth(quoteToken.symbol) ? (
                <TooltipStyled description="Showing ETH + wETH balance" iconType={IconType.Fill} />
            ) : null;
            const quoteTokenLabel = isWeth(quoteToken.symbol) ? 'ETH' : tokenSymbolToDisplayString(currencyPair.quote);
            return (
                <>
                    <LabelWrapper>
                        <Label>{tokenSymbolToDisplayString(currencyPair.base)}</Label>
                        <Value>{baseBalanceString}</Value>
                    </LabelWrapper>
                    <LabelWrapper>
                        <Label>
                            {quoteTokenLabel}
                            {toolTip}
                        </Label>
                        <Value>{quoteBalanceString}</Value>
                    </LabelWrapper>
                </>
            );
        }

        return null;
    };

    return (
        <Card title={getWalletTitle(isConnected)} action={getWallet(isConnected)} minHeightBody={'0px'}>
            {getWalletContent()}
        </Card>
    );
};

const WalletBalanceContainer = React.memo(WalletBalance);

export { WalletBalance, WalletBalanceContainer };
