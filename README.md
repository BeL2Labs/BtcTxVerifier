# BtcTxVerifier

`BtcTxVerifier` is a Bitcoin transaction proof service contract provided by Bel2. This contract allows developers to submit Bitcoin transactions and automatically generates zero-knowledge proofs for successfully verified transactions. Developers can build their own business logic on top of this contract, leveraging Bitcoin transaction proofs to enable various application scenarios.

## Contract Addresses

Please select the appropriate contract address based on the network you are using:
- ESC Mainnet:  `0x5293a9471A4A004874cea7301aC8936F8830BdF2`

Please replace the contract addresses with the actual deployed addresses.

## Features

- Submit Bitcoin transactions: Developers can submit Bitcoin transaction data, including raw transaction data, UTXOs, block height, Merkle proof, etc., by calling the contract's interface methods.
- Automatic proof generation: Bel2's proof service providers listen for contract events, automatically accept orders, and generate zero-knowledge proofs for successfully verified transactions.
- Query transaction verification status: Developers can query the verification status of a transaction using its hash to track the progress of proof generation.
- Retrieve transaction details: For successfully verified transactions, developers can retrieve detailed information such as Bitcoin addresses, amounts, and fees through the contract's interface.

## Important Notes

- Alpha version: Currently, the contract is in the alpha version and only supports transaction proofs for Legacy addresses.
- Proofs for successful transactions only: The service only provides zero-knowledge proofs for successfully verified transactions and does not provide proofs for failed verifications.
- Proof generation time: Typically, proofs are generated within 10 minutes. Developers can set a timeout, such as 24 hours, and if no proof is received within this time, it may indicate that the transaction cannot be successfully verified.

## Usage

### Submit a Bitcoin Transaction

Call the `verifyBtcTx` function with the following parameters:

- `rawTx`: Raw Bitcoin transaction data.
- `utxos`: UTXOs of the transaction.
- `blockHeight`: Block height of the transaction.
- `merkleProof`: Merkle proof of the transaction.
- `blockMerkleRoot`: Merkle root of the block.
- `txHash`: Hash of the transaction.
- `proofPositions`: Positions of the transaction in the Merkle tree.

### Query Transaction Verification Status

Call the `getTxZkpStatus` function with the transaction hash `txHash` to retrieve the zero-knowledge proof status of the corresponding transaction.

### Retrieve Verified Transaction Details

Call the `getVerifiedTxDetails` function with the transaction hash `txHash` and network type `network` to retrieve detailed information of a verified transaction, including Bitcoin addresses, amounts, and fees.

## Development

Copy `env.example` to `.env`

Open the .env file and configure the private key of the owner of the deployment contract
Execute the following command

```hardhat
    yarn install
    npx hardhat run scripts/deploy.js --network mainnet
```

Here's an example of submitting a Bitcoin transaction:

```hardhat
 npx hardhat run scripts/verifyBtcTx.js --network mainnet
```
VerifyBtcTx.js includes how to obtain merkleroot and merkleproof through btc transaction ID, as well as how to verify the transaction process. Please read carefully

After submitting the transaction, developers can query the verification status using the `getTxZkpStatus` function and retrieve detailed information of the transaction using the `getVerifiedTxDetails` function once the verification is successful.

## For Advanced Developers

If you are an advanced developer and want to deploy and modify the `BtcTxVerifier` contract yourself, please follow these steps:

1. Clone the Bel2 code repository to obtain the contract source code.

2. In the contract constructor, pass the addresses of the Bitcoin transaction zero-knowledge proof contract and the Bitcoin block header data contract provided by Bel2. If you want to use your own proof service, replace these addresses with your own contract addresses.

3. Modify the contract code as needed, adding or adjusting functionality.

4. Compile the modified contract using the Solidity compiler.

5. Deploy the compiled contract on the Ethereum network of your choice.

6. Provide the deployed contract address to other developers so they can use your service.

Please note that when modifying and deploying the contract, you are responsible for ensuring its security and correctness. Ensure that your modifications do not introduce any vulnerabilities or errors, and thoroughly test the contract before deployment.

If you encounter any issues during deployment or usage, please contact Bel2's support team for assistance.
