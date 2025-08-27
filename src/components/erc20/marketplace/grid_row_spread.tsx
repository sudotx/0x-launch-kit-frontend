import React, { HTMLAttributes, useState, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';

import { CustomTD, CustomTDLast, CustomTDTitle } from '../../common/table';

export type StickySpreadState = 'top' | 'bottom' | 'hidden';

interface Props extends HTMLAttributes<HTMLDivElement> {
    spreadAbsValue?: string;
    spreadPercentValue?: string;
}

interface GridRowSpreadProps {
    stickySpreadState?: StickySpreadState;
    stickySpreadWidth?: string;
}

const GridRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
`;

export const GridRowSpreadContainer = styled(GridRow)<GridRowSpreadProps>`
    ${props => (props.stickySpreadState === 'top' ? 'top: 29px;' : '')}
    ${props => (props.stickySpreadState === 'bottom' ? 'bottom: 0;' : '')}

    background-color: ${props => props.theme.componentsTheme.cardBackgroundColor};
    flex-grow: 0;
    flex-shrink: 0;
    position: ${props => (props.stickySpreadState === 'hidden' ? 'relative' : 'absolute')};
    width: ${props => props.stickySpreadWidth};
    z-index: 12;
`;

GridRowSpreadContainer.defaultProps = {
    stickySpreadWidth: 'auto',
    stickySpreadState: 'hidden',
};

export const customTDTitleStyles = { textAlign: 'right', borderBottom: true, borderTop: true };
export const customTDStyles = { textAlign: 'right', borderBottom: true, borderTop: true };
export const customTDLastStyles = {
    borderBottom: true,
    borderTop: true,
    tabular: true,
    textAlign: 'right',
};

export interface GridRowSpreadRef {
    updateStickSpreadState: (stickySpreadState: StickySpreadState, stickySpreadWidth: string) => void;
}

export const GridRowSpread = forwardRef<GridRowSpreadRef, Props>((props, ref) => {
    const { spreadAbsValue, spreadPercentValue } = props;
    const [stickySpreadState, setStickySpreadState] = useState<StickySpreadState>('hidden');
    const [stickySpreadWidth, setStickySpreadWidth] = useState('auto');

    useImperativeHandle(ref, () => ({
        updateStickSpreadState: (newState, newWidth) => {
            setStickySpreadState(newState);
            setStickySpreadWidth(newWidth);
        },
    }));

    if (stickySpreadState === 'hidden') {
        return null;
    }

    return (
        <GridRowSpreadContainer stickySpreadState={stickySpreadState} stickySpreadWidth={stickySpreadWidth}>
            <CustomTDTitle as="div" styles={customTDTitleStyles}>
                Spread
            </CustomTDTitle>
            <CustomTD as="div" styles={customTDStyles}>
                {spreadAbsValue}
            </CustomTD>
            <CustomTDLast as="div" styles={customTDLastStyles}>
                {spreadPercentValue}%
            </CustomTDLast>
        </GridRowSpreadContainer>
    );
});
