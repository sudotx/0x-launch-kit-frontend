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
`;

export const THead = styled.thead`
    font-size: 12px;
    text-transform: uppercase;
`;

export const TBody = styled.tbody``;

export const TR = styled.tr``;

export const TH = styled.th<TableTDProps>`
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    line-height: 1.2;
    text-transform: uppercase;
    white-space: nowrap;

    &:last-child {
        padding-right: 0;
    }
`;

export const CustomTD = styled.td<TableTDProps>`

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
