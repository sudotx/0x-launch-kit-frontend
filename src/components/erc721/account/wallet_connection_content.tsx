import { BigNumber } from '@0x/utils';
import React, { HTMLAttributes, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ETH_DECIMALS } from '../../../common/constants';
import { getEthAccount, getEthBalance } from '../../../store/selectors';
import { themeDimensions } from '../../../themes/commons';
import { tokenAmountInUnits } from '../../../util/tokens';
// import { WalletWethBalanceContainer } from '../../account';
// import { WalletConnectionStatusContainer } from '../../account/wallet_connection_status';
// import { WalletConnectionStatusDot } from '../../account/wallet_connections_status_dot';
import { CardBase } from '../../common/card_base';
import { DropdownTextItem } from '../../common/dropdown_text_item';
import { lightThemeColors } from '../../../themes/default_theme';

const truncateAddress = (address: string) => {
    return `${address.slice(0, 7)}...${address.slice(address.length - 5)}`;
};

const connectToWallet = () => {
    alert('connect to another wallet');
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
};

const WalletConnectionWrapper = styled(CardBase)`
    border-radius: ${themeDimensions.borderRadius};
    box-shadow: ${lightThemeColors.boxShadow};
    overflow: hidden;
    width: 350px;
`;

const DropdownHeader = styled.div`
    align-items: center;
    background-color: ${lightThemeColors.cardBackgroundColor};
    border-top-left-radius: ${themeDimensions.borderRadius};
    border-top-right-radius: ${themeDimensions.borderRadius};
    color: ${lightThemeColors.cardTitleColor};
    display: flex;
    justify-content: space-between;
    padding: 12px ${themeDimensions.horizontalPadding};
`;

const DropdownHeaderTitle = styled.div`
    color: ${lightThemeColors.textColorCommon};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
`;

const WalletAddress = styled.div`
    align-items: center;
    color: ${lightThemeColors.textColorCommon};
    display: flex;
    font-feature-settings: 'calt' 0;
    font-size: 16px;
    line-height: 1.3;
`;

// const WalletConnectionStatusDotStyled = styled(WalletConnectionStatusDot)`
//     margin-right: 8px;
// `;

// const WalletWethBalanceContainerStyled = styled(WalletWethBalanceContainer)`
//     background: #fbfbfb;
//     border-left: none;
//     border-radius: 0;
//     border-right: none;
//     margin: 0;
// `;

const DropdownTextItemStyled = styled(DropdownTextItem)`
    border: none;
`;

interface OwnProps extends HTMLAttributes<HTMLSpanElement> { }

const WalletConnectionContent: React.FC<OwnProps> = props => {
    const [isEthModalOpen, setIsEthModalOpen] = useState(false);
    const ethAccount = useSelector(getEthAccount);
    const ethBalance = useSelector(getEthBalance);

    const ethAccountText = ethAccount ? `${truncateAddress(ethAccount)}` : 'Not connected';
    const status: string = ethAccount ? 'active' : '';
    const ethBalanceText = ethBalance ? `${tokenAmountInUnits(ethBalance, ETH_DECIMALS)} ETH` : 'No connected';

    const content = (
        <WalletConnectionWrapper>
            <DropdownHeader>
                <DropdownHeaderTitle>Balances</DropdownHeaderTitle>
                <WalletAddress>
                    {/* <WalletConnectionStatusDotStyled status={status} /> */}
                    {ethAccountText}
                </WalletAddress>
            </DropdownHeader>
            {/* <WalletWethBalanceContainerStyled
                onWethModalOpen={() => setIsEthModalOpen(true)}
                onWethModalClose={() => setIsEthModalOpen(false)}
            /> */}
            <DropdownTextItemStyled onClick={() => ethAccount && copyToClipboard(ethAccount)} text="Copy Address" />
            <DropdownTextItemStyled onClick={connectToWallet} text="Connect a different address" />
        </WalletConnectionWrapper>
    );

    return (
        // <WalletConnectionStatusContainer
        //     walletConnectionContent={content}
        //     shouldCloseDropdownOnClickOutside={!isEthModalOpen}
        //     headerText={ethBalanceText}
        //     ethAccount={ethAccount}
        //     {...props}
        // />
        <div>
            <h1>Hello</h1>
        </div>
    );
};

const WalletConnectionContentContainer = React.memo(WalletConnectionContent);

export { WalletConnectionContent, WalletConnectionContentContainer };
