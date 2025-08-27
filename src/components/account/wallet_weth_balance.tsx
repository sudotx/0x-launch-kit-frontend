import { BigNumber } from '@0x/utils';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

import { startWrapEtherSteps } from '../../store/actions';
import {
    getConvertBalanceState,
    getEthBalance,
    getEthInUsd,
    getWeb3State,
    getWethBalance,
} from '../../store/selectors';
import { Theme, themeDimensions } from '../../themes/commons';
import { getKnownTokens } from '../../util/known_tokens';
import { tokenAmountInUnits } from '../../util/tokens';
import { ConvertBalanceState, Web3State } from '../../util/types';
import { Card } from '../common/card';
import { ArrowUpDownIcon } from '../common/icons/arrow_up_down_icon';
import { LoadingWrapper } from '../common/loading';
import { IconType, Tooltip } from '../common/tooltip';
import { AppDispatch } from '../../store';

import { WethModal } from './wallet_weth_modal';

interface OwnProps {
    className?: string;
    inDropdown?: boolean;
    onWethModalOpen?: () => any;
    onWethModalClose?: () => any;
}

const Content = styled.div`
    margin: 0 -${themeDimensions.horizontalPadding};
    position: relative;
`;

const Row = styled.div`
    align-items: center;
    border-bottom: solid 1px ${props => props.theme.componentsTheme.tableBorderColor};
    display: flex;
    justify-content: space-between;
    padding: 15px ${themeDimensions.horizontalPadding};
    position: relative;

    &:first-child {
        padding-top: 5px;
    }

    &:last-child {
        border-bottom: none;
        padding-bottom: 5px;
    }
`;

const LabelWrapper = styled.span`
    align-items: center;
    display: flex;
    flex-shrink: 0;
    margin-right: 15px;
`;

const Label = styled.span`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.2;
    margin-right: 15px;
`;

const Value = styled.div`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    flex-shrink: 0;
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
`;

const Button = styled.button`
    align-items: center;
    background-color: ${props => props.theme.componentsTheme.buttonConvertBackgroundColor};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.componentsTheme.buttonConvertBorderColor};
    color: ${props => props.theme.componentsTheme.buttonConvertTextColor};
    cursor: pointer;
    display: flex;
    height: 40px;
    left: 50%;
    padding: 0 10px;
    position: absolute;
    transform: translate(-50%, -50%);
    transition: border 0.15s ease-out;
    z-index: 2;

    &:hover {
        border-color: #666;
    }

    &:active {
        opacity: 0.8;
    }

    &:focus {
        outline: none;
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }

    path {
        fill: ${props => props.theme.componentsTheme.buttonConvertTextColor};
    }
`;

const ButtonLabel = styled.span`
    color: ${props => props.theme.componentsTheme.buttonConvertTextColor};
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    margin-right: 10px;
    user-select: none;
`;

const Note = styled.p`
    color: #ababab;
    font-size: 16px;
    font-weight: normal;
    line-height: 24px;
    margin: -10px 0 30px;
    padding: 20px 40px 0;
    text-align: center;
`;

const WalletWethBalance: React.FC<OwnProps> = props => {
    const {
        className,
        inDropdown,
        onWethModalClose,
        onWethModalOpen,
    } = props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme() as Theme;

    const ethBalance = useSelector(getEthBalance);
    const wethBalance = useSelector(getWethBalance);
    const web3State = useSelector(getWeb3State);
    const ethInUsd = useSelector(getEthInUsd);
    const convertBalanceState = useSelector(getConvertBalanceState);

    const onStartWrapEtherSteps = useCallback(
        async (newBalance: BigNumber) => {
            return dispatch(startWrapEtherSteps(newBalance)).unwrap();
        },
        [dispatch],
    );

    const openModal = useCallback(
        (e: any) => {
            e.stopPropagation(); // avoids dropdown closing when used inside one
            setModalIsOpen(true);
            if (onWethModalOpen) {
                onWethModalOpen();
            }
        },
        [onWethModalOpen],
    );

    const closeModal = useCallback(() => {
        setModalIsOpen(false);
        if (onWethModalClose) {
            onWethModalClose();
        }
    }, [onWethModalClose]);

    const handleSubmit = useCallback(
        async (newWeth: BigNumber) => {
            setIsSubmitting(true);

            try {
                await onStartWrapEtherSteps(newWeth);
            } finally {
                setIsSubmitting(false);
                closeModal();
            }
        },
        [onStartWrapEtherSteps, closeModal],
    );

    const totalEth = ethBalance.plus(wethBalance);
    const wethToken = getKnownTokens().getWethToken();
    const formattedEth = tokenAmountInUnits(ethBalance, wethToken.decimals, wethToken.displayDecimals);
    const formattedWeth = tokenAmountInUnits(wethBalance, wethToken.decimals, wethToken.displayDecimals);
    const formattedTotalEth = tokenAmountInUnits(totalEth, wethToken.decimals, wethToken.displayDecimals);

    let content: React.ReactNode;

    const isButtonConvertDisable = convertBalanceState !== ConvertBalanceState.Success;

    if (web3State === Web3State.Loading) {
        content = <LoadingWrapper />;
    } else if (ethBalance && wethBalance) {
        content = (
            <>
                <Row>
                    <Label>ETH</Label>
                    <Value>{formattedEth}</Value>
                </Row>
                <Button disabled={isButtonConvertDisable} onClick={openModal}>
                    <ButtonLabel>Convert</ButtonLabel>
                    <ArrowUpDownIcon />
                </Button>
                <Row>
                    <LabelWrapper>
                        <Label>wETH</Label> <Tooltip
                            description="ETH cannot be traded with other tokens directly.<br />You need to convert it to WETH first.<br />WETH can be converted back to ETH at any time."
                            iconType={IconType.Fill}
                        />
                    </LabelWrapper>
                    <Value>{formattedWeth}</Value>
                </Row>
                <Row>
                    <Label>Total Value</Label>
                    <Value>{formattedTotalEth} ETH</Value>
                </Row>
                <WethModal
                    ethInUsd={ethInUsd}
                    isOpen={modalIsOpen}
                    isSubmitting={isSubmitting}
                    onRequestClose={closeModal}
                    onSubmit={handleSubmit}
                    style={theme.modalTheme as any}
                    totalEth={totalEth}
                    wethBalance={wethBalance}
                />
            </>
        );
    }

    return (
        <>
            <Card title={inDropdown ? '' : 'ETH / wETH Balances'} className={className}>
                <Content>{content}</Content>
            </Card>
            {inDropdown ? null : (
                <Note>
                    wETH is used for trades on 0x
                    <br />1 wETH = 1 ETH
                </Note>
            )}
        </>
    );
};

const WalletWethBalanceContainer = React.memo(WalletWethBalance);

export { WalletWethBalance, WalletWethBalanceContainer };
