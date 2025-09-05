import { BigNumber } from '@0x/utils';

import { DEFAULT_ESTIMATED_TRANSACTION_TIME_MS, DEFAULT_GAS_PRICE, GWEI_IN_WEI } from '../common/constants';
import { getLogger } from '../util/logger';
import { GasInfo } from '../util/types';

const logger = getLogger('GasPriceEstimation');

const ETHERCHAIN_API_URL = 'https://www.etherchain.org/api/gasPriceOracle';

export const getGasEstimationInfoAsync = async (): Promise<GasInfo> => {
    try {
        const response = await fetch(ETHERCHAIN_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gasInfo = await response.json();

        // Assuming the API returns gas price in Gwei for the "fast" level
        const gasPriceInGwei = new BigNumber(gasInfo.fast);
        if (gasPriceInGwei.isNaN() || gasPriceInGwei.isLessThanOrEqualTo(0)) {
            throw new Error('Invalid gas price received from API');
        }

        // Etherchain doesn't provide a time estimate, so we'll use a default.
        const estimatedTimeMs = DEFAULT_ESTIMATED_TRANSACTION_TIME_MS;

        const info: GasInfo = {
            gasPriceInWei: gasPriceInGwei.multipliedBy(GWEI_IN_WEI),
            estimatedTimeMs,
        };
        logger.info('Fetched gas info:', info);
        return info;
    } catch (error) {
        logger.error('Failed to fetch gas estimation info, falling back to default.', error);
        return {
            gasPriceInWei: DEFAULT_GAS_PRICE,
            estimatedTimeMs: DEFAULT_ESTIMATED_TRANSACTION_TIME_MS,
        };
    }
};
