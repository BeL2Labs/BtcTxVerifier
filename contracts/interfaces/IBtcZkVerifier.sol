// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./IZkpOrder.sol";

struct VerifierData {
    address zkpOrder;
    bytes32 zkpTxID;
}

interface IBtcZkVerifier {
    event BTCHeaderDataChanged(address indexed oldAddress, address indexed newAddress);
    event ZKPOrderChanged(address indexed oldAddress, address indexed newAddress);
    event BtcTxAdded(bytes32 indexed txid);

    function addBtcTx(bytes memory btcTxRawData,
                      bytes[] memory utxos,
                      uint32 inBtcHeight,
                      bytes32[] memory proofPath,
                      bytes32 merkleRoot,
                      bytes32 tx,
                      bool[] memory positions) external;

    function getBtcTxRecord(bytes32 tx) external view returns(VerifierData memory);

    function getBtcTxStatus(bytes32 tx) external view returns(ProofStatus);
    function getBtcTxDetails(bytes32 tx, string memory network) external view returns(string[] memory btcAddrs, uint256[] memory amounts, uint256 txfee);

    function lastBtcHeight() external view returns(uint256);

    function setZkpOrder(address zkpOrder) external;
    function setBTCHeaderDataAddress(address btcData) external;


}
