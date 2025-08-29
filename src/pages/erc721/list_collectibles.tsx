import React from 'react';

import { COLLECTIBLE_NAME } from '../../common/constants';
import { AllCollectiblesListContainer } from '../../components/erc721/collectibles/collectibles_list';
import { Content } from '../../components/erc721/common/content_wrapper';

export const ListCollectibles = () => (
    <Content>
        <AllCollectiblesListContainer title={COLLECTIBLE_NAME} />
    </Content>
);
