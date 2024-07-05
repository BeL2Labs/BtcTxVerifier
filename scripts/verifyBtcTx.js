const {ethers, getChainId} = require("hardhat")
const {createHash} = require("node:crypto")
const {readConfig, sleep} = require('./utils/helper')
const { MerkleTree } = require('merkletreejs')
const {getBlock, getTransactionDetails} = require("./utils/btcAPI")

function sha256(data) {
    const hash = createHash('sha256');
    hash.update(data);
    let digest = hash.digest("hex");
    return digest;
}

async function getFillOrderProofParams(txId) {
    console.log("Building fill order proof parameters for transaction ID:", txId);

    const txDetails = await getTransactionDetails(txId);
    if (!txDetails) {
        console.log("no transaction", txId);
        return null;
    }

    const { blockInfo, txIds } = (await getBlock(txDetails["blockHash"], true)) || {};
    if (!blockInfo) {
        console.log("error block", txDetails["blockHash"]);
        return null;
    }

    const blockHeight = blockInfo.height;
    const txRawData = "0x" + txDetails.hex;
    const { merkleRoot, proof, leaf, positions } = generateMerkleProof(txIds, txId);

    // TBD: Apparently, the utxos array is composed of the raw transaction data (not byte reversed) of every parent transaction in "vin"
    const utxos = [];
    for (const vin of txDetails["vin"]) {
        const txData = await getTransactionDetails(vin["txid"]);
        if (!txData)
            return null;

        utxos.push("0x" + txData.hex);
    }

    return {
        blockHeight,
        txRawData,
        utxos,
        proof,
        merkleRoot,
        leaf,
        positions
    };
}

function generateMerkleProof(btcTxIds, paymentBtcTxId) {
    const leaf = "0x" + paymentBtcTxId;
    const leaves = btcTxIds.map(tx => "0x" + tx);
    const tree = new MerkleTree(leaves, sha256, { isBitcoinTree: true, duplicateOdd: false, sort: false });
    const merkleRoot = tree.getHexRoot();

    const proof = tree.getHexProof(leaf);
    const positions = tree.getProof(leaf).map(p => p.position === "right");

    console.log("Computed tree root:", tree.getHexRoot())
    console.log("Verified?:", tree.verify(tree.getProof(leaf), leaf, tree.getRoot()));
    // console.log(tree.toString())

    return {
        merkleRoot,
        leaf,
        proof,
        positions
    };
}


async function main() {
    let chainID = await getChainId();
    console.log("chainID==", chainID)

    let accounts = await ethers.getSigners()
    let account = accounts[0]
    console.log("account", account.address)

    let btcTx = "a3528397d4ea4258efe3f50e2a168f8d5c21ac993f0ec558c8a2fba9ba6036c6";
    let params = await getFillOrderProofParams(btcTx);

    let contractAddress = await readConfig(chainID,"BTC_VERIFIER");
    const contractFactory = await ethers.getContractFactory('BtcTxVerifier',account)
    let contract  = await contractFactory.connect(account).attach(contractAddress);

    let script = "0x6321020e0ae8c8fb9645dbdf6425b173f8ade49b5abbac20d887d98e8515d02a97ddddad210249d5b1a12045ff773b85033d3396faa32fd579cee25c4f7bb6aef6103228bd72ac676321020e0ae8c8fb9645dbdf6425b173f8ade49b5abbac20d887d98e8515d02a97ddddad210366e0c54864cf3468e2d9f047cfd6e971ab4c0b779499b9d8bbc7000178dfe627ac676303d32c40b275210249d5b1a12045ff773b85033d3396faa32fd579cee25c4f7bb6aef6103228bd72ada82014e984b07aac76f34326012cbbe57636387f2d60c4211b26bb5674d681a25a66876703703140b27521020e0ae8c8fb9645dbdf6425b173f8ade49b5abbac20d887d98e8515d02a97ddddac686868"
    let tx = await contract.verifyBtcTx(params["txRawData"], params["utxos"], params["blockHeight"], params["proof"],
        params["merkleRoot"], params["leaf"], params["positions"], script);
    console.log("tx == ", tx.hash);
}

function reverseHexString(hexString) {
    // 验证输入是否为有效的十六进制字符串
    if (!/^0x[0-9A-Fa-f]+$/.test(hexString)) {
        throw new Error('Invalid hex string');
    }

    // 去掉"0x"前缀
    const cleanHexString = hexString.slice(2);

    // 如果字符串长度为奇数，则在其前面添加一个0字符
    // 以确保可以正确按字节反转
    if (cleanHexString.length % 2 !== 0) {
        throw new Error('Invalid hex string length, expecting an even number of characters');
    }

    // 将字符串转换为每两个字符一组的数组
    const byteArray = [];
    for (let i = 0; i < cleanHexString.length; i += 2) {
        byteArray.push(cleanHexString.substr(i, 2));
    }

    // 反转字节数组并重新连接为字符串
    const reversedHexString = "0x" + byteArray.reverse().join('');

    return reversedHexString;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
