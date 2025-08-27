import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { cancelOrder } from '../../../store/actions';
import { AppDispatch } from '../../../store';
import { UIOrder } from '../../../util/types';
import { CloseIcon } from '../../common/icons/close_icon';

interface OwnProps {
    order: UIOrder;
}

const Button = styled.button`
    align-items: center;
    background: none;
    border: none;
    display: flex;
    height: 17px;
    justify-content: flex-end;
    margin-left: auto;
    outline: 0;
    padding: 0;
    width: 25px;

    &:hover {
        cursor: pointer;
    }

    &[disabled] {
        cursor: default;
    }
`;

const CancelOrderButton: React.FC<OwnProps> = ({ order }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleCancelOrder = async () => {
        setIsLoading(true);
        try {
            await dispatch(cancelOrder(order)).unwrap();
        } catch (err) {
            alert(`Could not cancel the specified order`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button title="Cancel order" type="button" disabled={isLoading} onClick={handleCancelOrder}>
            <CloseIcon />
        </Button>
    );
};

const CancelOrderButtonContainer = React.memo(CancelOrderButton);

export { CancelOrderButton, CancelOrderButtonContainer };
