import React from 'react';
import { useAccount } from 'wagmi';
import styled, { css } from 'styled-components';

import { themeBreakPoints, themeDimensions } from '../../themes/commons';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { ErrorCard, ErrorIcons, FontSize } from './error_card';

interface OwnProps {
    centerContent?: React.ReactNode;
    endContent: React.ReactNode;
    startContent: React.ReactNode;
}

export const separatorTopbar = css`
    &:after {
        background-color: ${props => props.theme.componentsTheme.topbarSeparatorColor};
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

const ToolbarWrapper = styled.div`
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    justify-content: space-between;
    position: sticky;
    top: 0;
    margin: 10px
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

const ToolbarContainer = (props: OwnProps) => {
    const { startContent, endContent, centerContent } = props;
    const { isConnected } = useAccount();

    return (
        <ToolbarWrapper>
            <ToolbarStart>{startContent}</ToolbarStart>
            {isConnected ? (
                <>
                    <ToolbarCenter>{centerContent}</ToolbarCenter>
                    <ToolbarEnd>{endContent}</ToolbarEnd>
                </>
            ) : (
                <ToolbarEnd>
                    <ConnectButton />
                </ToolbarEnd>
            )}
        </ToolbarWrapper>
    );
};

const Toolbar = ToolbarContainer;

export { Toolbar, ToolbarContainer };
