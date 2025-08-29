import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled, { useTheme } from 'styled-components';

import { LocalStorage } from '../../services/local_storage';
import { Theme } from '../../themes/commons';

import { CloseModalButton } from './icons/close_modal_button';

import { TriangleAlert } from 'lucide-react';

const ModalContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow: auto;
    width: 310px;
`;

const ModalTitle = styled.h1`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 25px;
    text-align: center;
`;

const ModalText = styled.p`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 16px;
    font-weight: normal;
    line-height: 1.5;
    margin: 0 0 15px;
    padding: 0 20px;
    text-align: center;
`;

const IconContainer = styled.div`
    align-items: center;
    display: flex;
    height: 155px;
    justify-content: center;
    margin: 0 0 15px;

    svg {
        height: 48px;
        width: 48px;
    }
`;

const localStorage = new LocalStorage(window.localStorage);

const AdBlockDetector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = useTheme() as Theme;

    useEffect(() => {
        const detectAdBlock = () => {
            return new Promise<boolean>(resolve => {
                const elem = document.createElement('div');
                elem.className = 'adclass';
                document.body.appendChild(elem);

                window.setTimeout(() => {
                    const isAdBlockDetected = !(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
                    if (elem.parentNode) {
                        elem.parentNode.removeChild(elem);
                    }
                    resolve(isAdBlockDetected);
                }, 100);
            });
        };

        const checkAdBlock = async () => {
            const wasAdBlockMessageShown = localStorage.getAdBlockMessageShown();
            if (!wasAdBlockMessageShown) {
                const adBlockDetected = await detectAdBlock();
                setIsOpen(adBlockDetected);
                localStorage.saveAdBlockMessageShown(true);
            }
        };

        checkAdBlock();
    }, []);

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            style={{
                content: {
                    ...theme.modalTheme?.content,
                    flexDirection: theme.modalTheme?.content?.flexDirection as any,
                    position: theme.modalTheme?.content?.position as any,
                    display: theme.modalTheme?.content?.display as any,
                    overflow: theme.modalTheme?.content?.overflow as any,
                },
                overlay: theme.modalTheme?.overlay,
            }}
        >
            <CloseModalButton onClick={closeModal} />
            <ModalContent>
                <ModalTitle>Ad Blocker Detected</ModalTitle>
                <IconContainer>
                    <TriangleAlert />
                </IconContainer>
                <ModalText>This dApp may not work correctly with your ad blocker enabled</ModalText>
            </ModalContent>
        </Modal>
    );
};

export { AdBlockDetector };
