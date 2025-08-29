import React from 'react';

import { COLLECTIBLE_DESCRIPTION, COLLECTIBLE_NAME } from '../../common/constants';
import { AllCollectiblesContainer } from '../../components/erc721/collectibles/collectibles_all';
import { Content } from '../../components/erc721/common/content_wrapper';

export const AllCollectibles = () => (
    <Content>
        <AllCollectiblesContainer title={COLLECTIBLE_NAME} description={COLLECTIBLE_DESCRIPTION} />
    </Content>
);
