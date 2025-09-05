import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { useErc20Store } from '../../../store/erc20';
import { truncateAddress } from '../../../util/number_utils';
// import { WalletConnectionStatusContainer } from '../../account/wallet_connection_status';
import { CardBase } from '../../common/card_base';
import { DropdownTextItem } from '../../common/dropdown_text_item';
import { lightThemeColors } from '../../../themes/default_theme';

interface OwnProps extends HTMLAttributes<HTMLSpanElement> { }

const connectToWallet = () => {
    alert('connect to another wallet');
};

const goToURL = () => {
    alert('go to url');
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        // Optional: Show success feedback
        // alert('Address copied to clipboard!');
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

const WalletConnectionContent: React.FC<OwnProps> = props => {
    const ethAccount = useErc20Store(state => state.ethAccount);
    const ethAccountText = ethAccount ? `${truncateAddress(ethAccount)}` : 'Not connected';

    const content = (
        <DropdownItems>
            <DropdownTextItem
                onClick={() => ethAccount && copyToClipboard(ethAccount)}
                text="Copy Address to Clipboard"
            />
            <DropdownTextItem onClick={connectToWallet} text="Connect a different Wallet" />
            <DropdownTextItem onClick={goToURL} text="Manage Account" />
        </DropdownItems>
    );

    return (
        // <WalletConnectionStatusContainer
        //     walletConnectionContent={content}
        //     headerText={ethAccountText}
        //     ethAccount={ethAccount}
        //     {...props}
        // />
        <div>
            hello
        </div>
    );
};

const WalletConnectionContentContainer = React.memo(WalletConnectionContent);

export { WalletConnectionContent, WalletConnectionContentContainer };
