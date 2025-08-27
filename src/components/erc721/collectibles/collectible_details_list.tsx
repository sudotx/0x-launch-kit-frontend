import React, { HTMLAttributes } from 'react';
import { useDispatch } from 'react-redux';

import { selectCollectible } from '../../../store/collectibles/actions';
import { getCollectiblePrice } from '../../../util/collectibles';
import { Collectible } from '../../../util/types';

import { ListItem } from './collectible_details_item_list';
import { TileItem } from './collectible_details_item_tile';

interface OwnProps extends HTMLAttributes<HTMLDivElement> {
    collectible: Collectible;
    isListItem?: boolean;
    onClick: () => any;
}

export const CollectibleOnList: React.FC<OwnProps> = props => {
    const { collectible, onClick, isListItem } = props;
    const dispatch = useDispatch();
    const { color, image, name } = collectible;
    const price = getCollectiblePrice(collectible);

    const handleAssetClick: React.EventHandler<React.MouseEvent> = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        onClick();
        try {
            dispatch(selectCollectible(collectible));
        } catch (err) {
            window.alert(`Could not sell the specified order`);
        }
    };

    return isListItem ? (
        <ListItem onClick={handleAssetClick} color={color} image={image} name={name} />
    ) : (
        <TileItem onClick={handleAssetClick} color={color} image={image} price={price} name={name} />
    );
};

export const CollectibleOnListContainer = React.memo(CollectibleOnList);
