// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IBtcZkVerifier.sol";
import "./interfaces/IBtcBlockHeader.sol";
import "./interfaces/IZkpOrder.sol";
import { MerkleProof} from "./lib/MerkleProof.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BtcZkVerifier is OwnableUpgradeable, IBtcZkVerifier {

    address public zkpOrder;
    address public btcHeaderData;

    mapping(bytes32 => VerifierData) private verifyRecords;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() public { _disableInitializers(); }

    function initialize() initializer public  {
        __Ownable_init(msg.sender);
        zkpOrder = 0x2cD6A5A6e716b1dEF6587afbb085303721fe8201;
        btcHeaderData = 0x7a581772B0b21f5B8880E881C495cb7AfDfA228c;
    }

    function addBtcTx(bytes memory btcTxRawData,
        bytes[] memory utxos,
        uint32 inBtcHeight,
        bytes32[] memory proofPath,
        bytes32 merkleRoot,
        bytes32 btcTx,
        bool[] memory positions) external {
        BlockHeader memory header = IBtcBlockHeader(btcHeaderData).getBlockByHeight(inBtcHeight);
        require(header.merkleRoot == merkleRoot, "errorMerkleRoot");

        bytes32 root = MerkleProof.getBitCoinMerkleRoot(proofPath, btcTx, positions);
        require(root == merkleRoot, "verifyMerkleFailed");
        bytes32 txID = IZkpOrder(zkpOrder).addTransaction(btcTxRawData, utxos);

        verifyRecords[btcTx] = VerifierData(zkpOrder, txID);
        txID = MerkleProof.reverseBytes32(txID);
        require(txID == btcTx, "errorTx");
        emit BtcTxAdded(btcTx);
    }

    function getBtcTxRecord(bytes32 btcTx) external view returns(VerifierData memory) {
        return verifyRecords[btcTx];
    }

    function getBtcTxStatus(bytes32 btcTx) external view returns(ProofStatus) {
        VerifierData memory record = verifyRecords[btcTx];
        require(record.zkpOrder != address(0), "NoRecord");
        return IZkpOrder(record.zkpOrder).getOrderStatus(record.zkpTxID);
    }

    function getBtcTxDetails(bytes32 btcTx, string memory network) external view returns(string[] memory btcAddrs,
                                                                                      uint256[] memory amounts,
                                                                                      uint256 txfee) {
        VerifierData memory record = verifyRecords[btcTx];
        require(record.zkpOrder != address(0), "NoRecord");
        return IZkpOrder(record.zkpOrder).getOrderDetails(record.zkpTxID, network);
    }

    function setBTCHeaderDataAddress(address btcHeader) external onlyOwner {
        emit BTCHeaderDataChanged(btcHeaderData, btcHeader);
        btcHeaderData = btcHeader;
    }

    function setZkpOrder(address zkpOrderAddress) external onlyOwner {
        emit ZKPOrderChanged(zkpOrder, zkpOrderAddress);
        zkpOrder = zkpOrderAddress;
    }

    function lastBtcHeight() external view returns(uint256) {
        return IBtcBlockHeader(btcHeaderData).lastHeight();
    }
}
