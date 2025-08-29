import React from 'react';

import { MyCollectiblesListContainer } from '../../components/erc721/collectibles/collectibles_list';
import { Content } from '../../components/erc721/common/content_wrapper';

export const MyCollectibles = () => (
    <Content>
        <MyCollectiblesListContainer title="My Collectibles" />
    </Content>
);
