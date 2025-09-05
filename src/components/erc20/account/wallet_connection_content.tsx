import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { useAccount, useDisconnect } from 'wagmi';

import { lightThemeColors } from '../../../themes/default_theme';
import { truncateAddress } from '../../../util/number_utils';
import { CardBase } from '../../common/card_base';
import { Dropdown, DropdownPositions } from '../../common/dropdown';
import { DropdownTextItem } from '../../common/dropdown_text_item';

interface OwnProps extends HTMLAttributes<HTMLSpanElement> { }

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
};

const DropdownItems = styled(CardBase)`
    box-shadow: ${lightThemeColors.boxShadow};
    min-width: 240px;
`;

const HeaderText = styled.span`
    cursor: pointer;
`;

const WalletConnectionContent: React.FC<OwnProps> = props => {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();

    if (!isConnected || !address) {
        return null;
    }

    const ethAccountText = truncateAddress(address);

    const content = (
        <DropdownItems>
            <DropdownTextItem
                onClick={() => copyToClipboard(address)}
                text="Copy Address"
            />
            {openConnectModal && <DropdownTextItem onClick={openConnectModal} text="Connect a different Wallet" />}
            {openChainModal && <DropdownTextItem onClick={openChainModal} text="Switch Network" />}
            <DropdownTextItem onClick={() => disconnect()} text="Disconnect" />
        </DropdownItems>
    );

    return (
        <Dropdown
            body={content}
            header={<HeaderText>{ethAccountText}</HeaderText>}
            horizontalPosition={DropdownPositions.Right}
            {...props}
        />
    );
};

const WalletConnectionContentContainer = React.memo(WalletConnectionContent);

export { WalletConnectionContent, WalletConnectionContentContainer };
