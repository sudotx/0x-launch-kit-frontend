import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { selectCollectible } from '../../../store/collectibles/actions';
import { getUserCollectiblesAvailableToSell } from '../../../store/selectors';
import { Theme } from '../../../themes/commons';
import { filterCollectibleByName } from '../../../util/filterable_collectibles';
import { Collectible } from '../../../util/types';
import { EmptyContent } from '../../common/empty_content';
import { CloseModalButton } from '../../common/icons/close_modal_button';
import { InputSearch } from '../common/input_search';

import { CollectibleOnListContainer } from './collectible_details_list';
import { lightThemeColors, modalThemeStyle } from '../../../themes/default_theme';

interface OwnProps {
    theme: Theme;
    isOpen: boolean;
    onModalCloseRequest: () => any;
}

const modalWidth = '328px';
const modalContentHeight = '400px';

const ModalContent = styled.div`
    height: ${modalContentHeight};
    margin-left: -${modalThemeStyle.content.padding};
    margin-right: -${modalThemeStyle.content.padding};
    margin-top: -${modalThemeStyle.content.padding};
    overflow: auto;
    width: 360px;
`;

const ModalTitleWrapper = styled.div`
    border-bottom: 1px solid ${lightThemeColors.borderColor};
    margin: -3px -${modalThemeStyle.content.padding} 15px;
    padding: 0 ${modalThemeStyle.content.padding} 13px;
`;

const ModalTitleTop = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const ModalTitle = styled.h2`
    color: ${lightThemeColors.cardTitleColor};
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    margin: 0;
    padding: 0 15px 0 0;
`;

const SearchStyled = styled(InputSearch)`
    background-color: ${lightThemeColors.marketsSearchFieldBackgroundColor};
    border-color: ${lightThemeColors.marketsSearchFieldBackgroundColor};
    color: ${lightThemeColors.marketsSearchFieldTextColor};
    max-width: 100%;
    width: ${modalWidth};

    ::placeholder {
        text-align: left;
    }
`;

const CloseModalButtonStyle = styled(CloseModalButton)`
    margin: 0;
`;

const initialState = {
    filterText: '',
};

const CollectibleListModalContainer: React.FC<OwnProps> = props => {
    const {
        theme,
        isOpen,
        onModalCloseRequest
    } = props;
    const [filterText, setFilterText] = useState('');
    const dispatch = useDispatch();
    const userCollectibles = useSelector(getUserCollectiblesAvailableToSell);

    const collectibles = Object.keys(userCollectibles).map(key => userCollectibles[key]);
    const filteredCollectibles = filterCollectibleByName(collectibles, filterText);

    const closeModal = () => {
        onModalCloseRequest();
        setFilterText('');
    };

    const handleSearchInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(event.target.value || '');
    };

    const handleCollectibleClick = (collectible: Collectible) => {
        dispatch(selectCollectible(collectible));
        closeModal();
    };

    return (
        <Modal isOpen={isOpen} style={theme.modalTheme as any} onRequestClose={closeModal}>
            <ModalTitleWrapper>
                <ModalTitleTop>
                    <ModalTitle>Select an item to sell</ModalTitle>
                    <CloseModalButtonStyle onClick={closeModal} />
                </ModalTitleTop>
                <SearchStyled placeholder={'Search Wallet'} onChange={handleSearchInputChanged} />
            </ModalTitleWrapper>
            <ModalContent>
                {filteredCollectibles.length > 0 ? (
                    filteredCollectibles.map((item, index) => (
                        <CollectibleOnListContainer
                            collectible={item}
                            isListItem={true}
                            key={index}
                            onClick={() => handleCollectibleClick(item)}
                        />
                    ))
                ) : (
                    <EmptyContent text={'No results found'} />
                )}
            </ModalContent>
        </Modal>
    );
};

const CollectibleListModal = withTheme(CollectibleListModalContainer);

export { CollectibleListModal };
