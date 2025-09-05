import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css, withTheme } from 'styled-components';

import { Logo } from '../../../components/common/logo';
import { Theme, themeBreakPoints } from '../../../themes/commons';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { lightThemeColors } from '../../../themes/default_theme';
import { MarketsDropdownContainer } from './markets_dropdown';

export const separatorTopbar = css`
    &:after {
        background-color: ${lightThemeColors.borderColor};
        content: '';
        height: 26px;
        margin-left: 17px;
        margin-right: 17px;
        width: 1px;
    }
    &:last-child:after {
        display: none;
    }
`;

interface OwnProps {
    theme: Theme;
}

type Props = OwnProps;

const MyWalletLink = styled.a`
    align-items: center;
    color: ${lightThemeColors.textLight};
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }

    ${separatorTopbar}
`;

const LogoHeader = styled(Logo)`
    ${separatorTopbar}
`;

const MarketsDropdownHeader = styled<any>(MarketsDropdownContainer)`
    align-items: center;
    display: flex;

    ${separatorTopbar}
`;

const ToolbarWrapper = styled.div`
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    justify-content: space-between;
    align-items: center;
    position: static;
    top: 0;
    margin: 10px;
`;

const ToolbarStart = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;

    @media (min-width: ${themeBreakPoints.xxl}) {
        min-width: 33.33%;
    }
`;

const ToolbarCenter = styled.div`
    align-items: center;
    display: flex;
    flex-grow: 1;
    justify-content: center;

    @media (min-width: ${themeBreakPoints.xxl}) {
        min-width: 33.33%;
    }
`;

const ToolbarEnd = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-end;

    @media (min-width: ${themeBreakPoints.xxl}) {
        min-width: 33.33%;
    }
`;

const ToolbarContent: React.FC<Props> = props => {
    const navigate = useNavigate();
    const logo = (
        <LogoHeader onClick={() => navigate('/')} text={"Exchange"} image={<img src={"favicons/favicon-32.png"} alt={"Hex"} />} />
    );

    return (
        <ToolbarWrapper>
            <ToolbarStart>{logo}</ToolbarStart>
            <ToolbarCenter>
                <MarketsDropdownHeader shouldCloseDropdownBodyOnClick={false} />
            </ToolbarCenter>
            <ToolbarEnd>
                <MyWalletLink onClick={(e) => { e.preventDefault(); navigate('/mywallet'); }}>My Wallet</MyWalletLink>
                <ConnectButton />
            </ToolbarEnd>
        </ToolbarWrapper>
    );
};

const ToolbarContentContainer = withTheme(ToolbarContent);

export { ToolbarContent, ToolbarContentContainer };
