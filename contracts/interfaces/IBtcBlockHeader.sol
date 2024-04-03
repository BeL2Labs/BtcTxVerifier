// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

struct BlockHeader {
    uint32 version;
    bytes32 prevBlockHash;
    bytes32 merkleRoot;
    uint32 timestamp;
    uint32 bits;
    uint32 nonce;
    bytes32 blockHash;
    uint32 height;
}

interface IBtcBlockHeader {
    //State variables
    function getBlockByHeight(uint32 _height) external view returns (BlockHeader memory);

    function lastHeight() external view returns (uint32);
}
