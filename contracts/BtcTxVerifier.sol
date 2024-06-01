// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./interfaces/IBtcTxVerifier.sol";
import "./interfaces/IBtcBlockHeader.sol";
import "./interfaces/IBtcTxZkp.sol";
import { MerkleProof } from "./lib/MerkleProof.sol";

contract BtcTxVerifier is OwnableUpgradeable, IBtcTxVerifier {
    address public btcTxZkpAddr;
    address public btcHeaderAddr;

    mapping(bytes32 => TxVerifyRecord) private txVerifyRecords;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    /// @dev Initialize the contract
    function initialize(address _btcTxZkpAddr, address _btcHeaderAddr) public initializer {
        __Ownable_init(msg.sender);
        btcTxZkpAddr = _btcTxZkpAddr;
        btcHeaderAddr = _btcHeaderAddr;
    }

    /// @dev Submit a Bitcoin transaction for verification and ZKP generation
    /// @param rawTx The raw data of the Bitcoin transaction
    /// @param utxos The UTXOs of the transaction
    /// @param blockHeight The block height of the transaction
    /// @param merkleProof The Merkle proof of the transaction
    /// @param blockMerkleRoot The Merkle root of the block
    /// @param txHash The hash of the Bitcoin transaction
    /// @param proofPositions The positions of the transaction in the Merkle tree
    /// @param script Lock Script for Bitcoin, used to generate bitcoin addresses
    function verifyBtcTx(
        bytes memory rawTx,
        bytes[] memory utxos,
        uint32 blockHeight,
        bytes32[] memory merkleProof,
        bytes32 blockMerkleRoot,
        bytes32 txHash,
        bool[] memory proofPositions,
        bytes memory script
    ) external {
        require(rawTx.length > 0, "InvalidRawTx");
        require(utxos.length > 0, "InvalidUtxos");
        require(merkleProof.length > 0, "InvalidMerkleProof");

        BlockHeader memory header = IBtcBlockHeader(btcHeaderAddr).getBlockByHeight(blockHeight);
        require(header.merkleRoot == blockMerkleRoot, "InvalidBlockMerkleRoot");

        bytes32 calculatedRoot = MerkleProof.getBitcoinMerkleRoot(merkleProof, txHash, proofPositions);
        require(calculatedRoot == blockMerkleRoot, "InvalidMerkleProof");
        
        require(btcTxZkpAddr != address(0), "InvalidBtcTxZkpAddress");
        string memory prover = Strings.toHexString(msg.sender);
        bytes32 zkpID = IBtcTxZkp(btcTxZkpAddr).addTransaction(rawTx, utxos,prover, script);

        txVerifyRecords[txHash] = TxVerifyRecord(btcTxZkpAddr, zkpID);
        emit BtcTxVerified(txHash);
    }

    /// @dev Get the verification record of a Bitcoin transaction
    /// @param txHash The hash of the Bitcoin transaction
    /// @return The verification record
    function getTxVerifyRecord(bytes32 txHash) external view returns(TxVerifyRecord memory) {
        return txVerifyRecords[txHash];
    }

    /// @dev Get the status of a Bitcoin transaction ZKP
    /// @param txHash The hash of the Bitcoin transaction
    /// @return The status of the ZKP
    function getTxZkpStatus(bytes32 txHash) external view returns(ProofStatus) {
        TxVerifyRecord memory record = txVerifyRecords[txHash];
        if (record.btcTxZkpAddr == address(0)) {
            revert("RecordNotFound");
        }
        return IBtcTxZkp(record.btcTxZkpAddr).getOrderStatus(record.zkpID);
    }

    /// @dev Get the details of a verified Bitcoin transaction
    /// @param txHash The hash of the Bitcoin transaction
    /// @param network The network of the transaction
    /// @return txhash The Bitcoin tx of the transaction
    /// @return inputs The inputs of the transaction
    /// @return outputs The outputs of the transaction
    /// @return script Lock Script for Bitcoin, used to generate bitcoin addresses
    /// @return ProofStatus The status of the zkp verified;
    function getVerifiedTxDetails(bytes32 txHash, string memory network) external view returns(
        bytes32,
        Input[] memory,
        Output[] memory,
        bytes memory, //script
        ProofStatus
    ) {
        TxVerifyRecord memory record = txVerifyRecords[txHash];
        if (record.btcTxZkpAddr == address(0)) {
            revert("RecordNotFound");
        }
        return IBtcTxZkp(record.btcTxZkpAddr).getOrderDetails(record.zkpID, network);
    }

    /// @dev Set the address of the Bitcoin block header contract
    /// @param newBtcHeaderAddr The address of the new Bitcoin block header contract
    function setBtcHeaderAddr(address newBtcHeaderAddr) external onlyOwner {
        emit BtcHeaderAddrChanged(btcHeaderAddr, newBtcHeaderAddr);
        btcHeaderAddr = newBtcHeaderAddr;
    }

    /// @dev Set the address of the Bitcoin transaction ZKP contract
    /// @param newBtcTxZkpAddr The address of the new Bitcoin transaction ZKP contract 
    function setBtcTxZkpAddr(address newBtcTxZkpAddr) external onlyOwner {
        emit BtcTxZkpAddrChanged(btcTxZkpAddr, newBtcTxZkpAddr);
        btcTxZkpAddr = newBtcTxZkpAddr;
    }

    /// @dev Get the last synced Bitcoin block height
    /// @return The last synced block height
    function getLastBtcHeight() external view returns(uint256) {
        return IBtcBlockHeader(btcHeaderAddr).lastHeight();
    }
}
