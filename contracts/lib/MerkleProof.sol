// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library MerkleProof {
    function getBitCoinMerkleRoot(
        bytes32[] memory proof,
        bytes32 leaf,
        bool[] memory positions
    ) internal pure returns (bytes32) {
        bytes32 computedHash = reverseBytes32(leaf);
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = reverseBytes32(proof[i]);
            if (positions[i]) {//right leaf
                computedHash = sha256D(computedHash, proofElement);
            } else {
                computedHash = sha256D(proofElement, computedHash);
            }
        }
        return reverseBytes32(computedHash);
    }

    function sha256D(bytes32 left, bytes32 right) internal pure returns (bytes32) {
        bytes memory data = abi.encodePacked(left, right);
        bytes32 hash = sha256(data);
        hash = sha256(abi.encodePacked(hash));
        return hash;
    }

    function reverseBytes32(bytes32 data) internal pure returns (bytes32) {
        uint256 value = uint256(data);
        uint256 reversedValue = 0;

        for (uint256 i = 0; i < 32; i++) {
            reversedValue |= (value & 0xff) << (8 * (31 - i));
            value >>= 8;
        }
        return bytes32(reversedValue);
    }
}
