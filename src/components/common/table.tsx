import styled from 'styled-components';

import { themeBreakPoints, themeDimensions } from '../../themes/commons';

interface TableStyleProps {
    borderBottom?: boolean;
    borderTop?: boolean;
    color?: string;
    tabular?: boolean;
    textAlign?: string;
    fontWeight?: string;
    lineWeight?: string;
}

interface TableProps {
    fitInCard?: boolean;
    isResponsive?: boolean;
    styles?: TableStyleProps;
}

interface TableTDProps {
    styles?: TableStyleProps;
}

export const Table = styled.table<TableProps>`
    border-collapse: collapse;
    border-spacing: 0;
    margin-left: ${props => (props.fitInCard ? `-${themeDimensions.horizontalPadding}` : '0')};
    margin-right: ${props => (props.fitInCard ? `-${themeDimensions.horizontalPadding}` : '0')};
    min-width: ${props => (props.isResponsive ? 'fit-content' : '0')};
    width: ${props =>
        props.fitInCard
            ? `calc(100% + ${themeDimensions.horizontalPadding} + ${themeDimensions.horizontalPadding})`
            : '100%'};

    @media (min-width: ${themeBreakPoints.xl}) {
        min-width: 100%;
    }
`;

export const THead = styled.thead`
    font-size: 12px;
    text-transform: uppercase;
`;

export const TBody = styled.tbody``;

export const TR = styled.tr`
    &:last-child > td {
        border-bottom: none;
    }
`;

export const TH = styled.th<TableTDProps>`
    border-bottom: 1px solid black;
    color: black;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    line-height: 1.2;
    padding: 0 ${themeDimensions.horizontalPadding} 5px 0;
    text-align: 'left';
    text-transform: uppercase;
    white-space: nowrap;

    &:last-child {
        padding-right: 0;
    }
`;

export const CustomTD = styled.td<TableTDProps>`
    border-bottom: 1px solid black;
    color: black;
    font-feature-settings: ${props => (props.styles && props.styles.tabular ? `'tnum' 1` : `'tnum' 0`)};
    font-size: 14px;
    font-weight: ${props => (props.styles && props.styles.fontWeight) || 'normal'};
    line-height: ${props => (props.styles && props.styles.lineWeight) || '1.2'};
    padding: 5px ${themeDimensions.horizontalPadding} 5px 0;
    text-align: 'left';
    &:last-child {
        padding-right: 0;
    }
`;

export const CustomTDFirst = styled(CustomTD)`
    &,
    &:last-child {
        padding-left: ${themeDimensions.horizontalPadding};
    }
`;

export const CustomTDLast = styled(CustomTD)`
    &,
    &:last-child {
        padding-right: ${themeDimensions.horizontalPadding};
    }
`;

export const CustomTDTitle = styled(CustomTD)`
    color: black;
    font-size: 12px;
    text-transform: uppercase;
`;

export const THFirst = styled(TH)`
    &,
    &:last-child {
        padding-left: ${themeDimensions.horizontalPadding};
    }
`;

export const THLast = styled(TH)`
    &,
    &:last-child {
        padding-right: ${themeDimensions.horizontalPadding};
    }
`;