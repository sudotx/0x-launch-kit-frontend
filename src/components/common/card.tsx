import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { themeDimensions } from '../../themes/commons';

import { CardBase } from './card_base';

interface Props extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    minHeightBody?: string;
}

const CardWrapper = styled(CardBase)`
    display: flex;
    flex-direction: column;
    max-height: 100%;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CardHeader = styled.div`
    align-items: center;
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    justify-content: space-between;
`;

const CardTitle = styled.h1`
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    padding: 0 20px 0 0;
`;

const CardBody = styled.div<{ minHeightBody?: string }>`
    margin: 0;
    overflow-x: auto;
    position: relative;
`;

CardBody.defaultProps = {
    minHeightBody: '140px',
};

export const Card: React.FC<Props> = props => {
    const { title, action, children, minHeightBody, ...restProps } = props;

    return (
        <CardWrapper {...restProps}>
            {title || action ? (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {action ? action : null}
                </CardHeader>
            ) : null}
            <CardBody minHeightBody={minHeightBody}>{children}</CardBody>
        </CardWrapper>
    );
};
