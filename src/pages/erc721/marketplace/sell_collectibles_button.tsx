import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button } from '../../../components/common/button';
import { CollectibleListModal } from '../../../components/erc721/collectibles/collectible_list_modal';
import { themeBreakPoints } from '../../../themes/commons';
import { ButtonVariant } from '../../../util/types';

const ButtonStyled = styled(Button)`
    min-width: 195px;
    @media (min-width: ${themeBreakPoints.md}) {
        margin-left: auto;
    }
`;

export const SellCollectiblesButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalToggle = useCallback(() => {
        setIsModalOpen((prev) => !prev);
    }, []);

    return (
        <>
            {/* {(CollectibleListModal as any)({
                isOpen: isModalOpen,
                onModalCloseRequest: handleModalToggle,
            })} */}
            <ButtonStyled variant={ButtonVariant.Quaternary} onClick={handleModalToggle}>
                Sell collectibles
            </ButtonStyled>
        </>
    );
};
