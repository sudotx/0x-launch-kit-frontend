import { BigNumber } from '@0x/utils';
import React from 'react';
import styled from 'styled-components';

import { padRightSplitted } from '../../util/number_utils';

interface ShowNumberWithColorsProps {
    num: BigNumber;
    ishover?: boolean;
}

interface SpanRightProps {
    isHover?: boolean;
}

const SpanLeft = styled.span`
    color: black;
`;

const SpanRight = styled.span<SpanRightProps>`
    color: black;
`;

export const ShowNumberWithColors: React.FC<ShowNumberWithColorsProps> = ({ num, ishover }) => {
    const numSplitted = padRightSplitted(num);

    return (
        <>
            <SpanLeft>{numSplitted.num}</SpanLeft>
            <SpanRight isHover={ishover}>{numSplitted.diff}</SpanRight>
        </>
    );
};