// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

enum ProofStatus {
    toBeVerified,
    verified,
    verifyFailed
}

struct RawTransaction {
    bytes rawData;
    bytes[] utxos;
    ProofStatus status;
}

interface IZkpOrder {
    function addTransaction(bytes memory rawData, bytes[] memory utxos) external returns (bytes32);

    function getOrderStatus(bytes32 hash) external view returns(ProofStatus);

    function getOrderData(bytes32 hash) external view returns(bytes memory);

    function getOrderUtxos(bytes32 hash) external view returns(bytes[] memory);

    function getOrderDetails(bytes32 hash, string memory network) external view returns(string[] memory btcAddrs,
        uint256[] memory amounts,
        uint256 txfee);
}
