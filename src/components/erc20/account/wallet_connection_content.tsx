import React, { HTMLAttributes } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { getEthAccount } from '../../../store/selectors';
import { truncateAddress } from '../../../util/number_utils';
import { StoreState } from '../../../util/types';
import { WalletConnectionStatusContainer } from '../../account/wallet_connection_status';
import { CardBase } from '../../common/card_base';
import { DropdownTextItem } from '../../common/dropdown_text_item';

interface OwnProps extends HTMLAttributes<HTMLSpanElement> { }

interface StateProps {
    ethAccount: string;
}

type Props = StateProps & OwnProps;

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
    box-shadow: ${props => props.theme.componentsTheme.boxShadow};
    min-width: 240px;
`;

class WalletConnectionContent extends React.PureComponent<Props> {
    public render = () => {
        const { ethAccount, ...restProps } = this.props;
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
            <WalletConnectionStatusContainer
                walletConnectionContent={content}
                headerText={ethAccountText}
                ethAccount={ethAccount}
                {...restProps}
            />
        );
    }
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        ethAccount: getEthAccount(state),
    };
};

const WalletConnectionContentContainer = connect(
    mapStateToProps,
    {},
)(WalletConnectionContent);

export { WalletConnectionContent, WalletConnectionContentContainer };
