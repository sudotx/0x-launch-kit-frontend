
import { AllCollectiblesFetchStatus, Collectible, CollectiblesState } from '../../util/types';

const initialCollectibles: CollectiblesState = {
    collectibleSelected: null,
    allCollectibles: {},
    allCollectiblesFetchStatus: AllCollectiblesFetchStatus.Request,
};

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const collectiblesSlice = createSlice({
    name: 'collectibles',
    initialState: initialCollectibles,
    reducers: {
        fetchAllCollectiblesSuccess(
            state,
            action: PayloadAction<{ collectibles: Collectible[] }>
        ) {
            state.allCollectibles = action.payload.collectibles.reduce((acc, c) => {
                acc[c.tokenId] = c;
                return acc;
            }, {} as { [key: string]: Collectible });

            state.allCollectiblesFetchStatus = AllCollectiblesFetchStatus.Success;
        },
        selectCollectible(state, action: PayloadAction<Collectible | null>) {
            state.collectibleSelected = action.payload;
        },
    },
});

export const {
    fetchAllCollectiblesSuccess,
    selectCollectible,
} = collectiblesSlice.actions;

export default collectiblesSlice.reducer;
