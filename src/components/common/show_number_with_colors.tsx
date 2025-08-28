import { BigNumber } from '@0x/utils';
import React from 'react';
import styled from 'styled-components';

import { padRightSplitted } from '../../util/number_utils';

interface ShowNumberWithColorsProps {
    num: BigNumber;
    isHover?: boolean;
}

interface SpanRightProps {
    isHover?: boolean;
}

const SpanLeft = styled.span`
    color: ${props => props.theme.componentsTheme.textColorCommon};
`;

const SpanRight = styled.span<SpanRightProps>`
    color: ${props =>
        props.isHover
            ? props.theme.componentsTheme.textColorCommon
            : props.theme.componentsTheme.numberDecimalsColor};
`;

export const ShowNumberWithColors: React.FC<ShowNumberWithColorsProps> = ({ num, isHover }) => {
    const numSplitted = padRightSplitted(num);

    return (
        <>
            <SpanLeft>{numSplitted.num}</SpanLeft>
            <SpanRight isHover={isHover}>{numSplitted.diff}</SpanRight>
        </>
    );
};
