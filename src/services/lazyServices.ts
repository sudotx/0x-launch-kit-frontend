// Lazy load heavy services only when needed
export const getLazyContractWrappers = async () => {
    const { getContractWrappers } = await import('./contract_wrappers');
    return getContractWrappers;
};

export const getLazyCollectiblesMetadataGateway = async () => {
    const { getCollectiblesMetadataGateway } = await import('./collectibles_metadata_gateway');
    return getCollectiblesMetadataGateway;
};
