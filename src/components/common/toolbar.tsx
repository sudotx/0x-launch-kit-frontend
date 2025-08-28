import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import styled, { css } from 'styled-components';

import { themeBreakPoints } from '../../themes/commons';

import { NavigationBar } from './navigation_bar';

interface OwnProps {
    logo: React.ReactNode;
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
    align-items: center;
    position: sticky;
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

const ToolbarContainer = (props: OwnProps) => {
    const { logo } = props;

    return (
        <ToolbarWrapper>
            <ToolbarStart>{logo}</ToolbarStart>
            <ToolbarCenter>
                <NavigationBar />
            </ToolbarCenter>
            <ToolbarEnd>
                <ConnectButton />
            </ToolbarEnd>
        </ToolbarWrapper>
    );
};

const Toolbar = ToolbarContainer;

export { Toolbar, ToolbarContainer };
