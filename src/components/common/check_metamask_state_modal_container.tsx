import React, { useEffect, useState } from 'react';
import { useErc20Store } from '../../store';
import { ModalDisplay, Web3State } from '../../util/types';
import { MetamaskErrorModal } from './metamask_error_modal';
import { LocalStorage } from '../../services/local_storage';

interface OwnProps {
    children?: React.ReactNode;
}

const localStorage = new LocalStorage(window.localStorage);

export const CheckMetamaskStateModalContainer: React.FC<OwnProps> = ({ children }) => {
    const web3State = useErc20Store(state => state.web3State);
    // Assuming initWallet and goToHome are now part of the store actions
    // const { initWallet, goToHome } = useErc20Store(state => state);

    const [shouldOpenModal, setShouldOpenModal] = useState(true);
    const [modalToDisplay, setModalToDisplay] = useState<ModalDisplay | null>(null);

    useEffect(() => {
        if (web3State === Web3State.Locked) {
            setShouldOpenModal(true);
            setModalToDisplay(ModalDisplay.EnablePermissions);
        } else if (web3State === Web3State.NotInstalled) {
            setShouldOpenModal(true);
            setModalToDisplay(ModalDisplay.InstallMetamask);
        } else {
            setShouldOpenModal(false);
        }
    }, [web3State]);

    const closeModal = () => {
        setShouldOpenModal(false);
        // goToHome();
    };

    const connectWallet = () => {
        // initWallet();
        localStorage.saveWalletConnected(true);
    };

    if (shouldOpenModal && modalToDisplay) {
        return (
            <MetamaskErrorModal
            // isOpen={shouldOpenModal}
            // closeModal={closeModal}
            // noMetamaskType={modalToDisplay}
            // connectWallet={connectWallet}
            />
        );
    }

    return <>{children || null}</>;
};
