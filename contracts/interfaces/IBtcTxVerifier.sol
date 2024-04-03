// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./IBtcTxZkp.sol";

struct TxVerifyRecord {
    address btcTxZkpAddr;
    bytes32 zkpID;
}

interface IBtcTxVerifier {
    event BtcHeaderAddrChanged(address indexed oldAddress, address indexed newAddress);
    event BtcTxZkpAddrChanged(address indexed oldAddress, address indexed newAddress);
    event BtcTxVerified(bytes32 indexed txid);

    function verifyBtcTx(bytes memory rawTx,
                         bytes[] memory utxos,
                         uint32 blockHeight,
                         bytes32[] memory merkleProof,
                         bytes32 blockMerkleRoot,
                         bytes32 txHash,
                         bool[] memory proofPositions) external;

    function getTxVerifyRecord(bytes32 tx) external view returns(TxVerifyRecord memory);

    function getTxZkpStatus(bytes32 tx) external view returns(ProofStatus);

    function getVerifiedTxDetails(bytes32 txHash, string memory network) external view returns(
        string[] memory btcAddresses,
        uint256[] memory amounts,
        uint256 fee);

    function getLastBtcHeight() external view returns(uint256);

    function setBtcTxZkpAddr(address newBtcTxZkpAddr) external;
    function setBtcHeaderAddr(address newBtcHeaderAddr) external;


}
