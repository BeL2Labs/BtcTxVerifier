const axios = require('axios');

const mainnetExplorerApi = 'https://nownodes-btcbook.bel2.org';

async function apiGet(url) {
    const response = await axios.get(url);
    return response.data;
}

/**
 * Gets all transaction details for a given transaction ID.
 * EXPLORER api
 */
async function getTransactionDetails(txId) {
    try {
        let requestUrl = `${mainnetExplorerApi}/api/v2/tx/${txId}`;
        return await apiGet(requestUrl);
    }
    catch (err) {
        console.error('NowNodes: failed to get transaction details:', err);
        return null;
    }
}

/**
 * Returns information about a block, from its height or hash.
 *
 * @param withTxIds if true, API is called in a loop until all transactions of the block are retrieved. Transaction IDs are returned in a separate object
 */
async function getBlock(heightOrHash, withTxIds) {
    try {
        let requestUrl = `${mainnetExplorerApi}/api/v2/block/${heightOrHash}`;
        let blockInfo = await apiGet(requestUrl);

        // Caller wants all transactions. So we continue to iterate all pages and build the txIds list.
        let txIds = undefined;
        if (withTxIds) {
            // Append transactions of the already fetched first page
            txIds = blockInfo["txs"].map(t => t["txid"]);

            for (let i = 2; i <= blockInfo["totalPages"]; i++) {
                console.log(`Fetching block's transaction page ${i}`);
                let nextPageInfo = await apiGet(`${requestUrl}?page=${i}`);
                txIds.push(...nextPageInfo["txs"].map(t => t["txid"]));
            }
        }

        return { blockInfo, txIds };
    }
    catch (err) {
        console.error('NowNodes: failed to get address info:', err);
        return null;
    }
}

module.exports = {
    apiGet,
    getTransactionDetails,
    getBlock,
}