const {ethers, getChainId} = require("hardhat")
const Web3 = require("web3")
const {readConfig, sleep} = require('./utils/helper')
const buffer = require("buffer");
async function main() {
    let chainID = await getChainId();
    console.log("chainID==", chainID)

    let accounts = await ethers.getSigners()
    let account = accounts[0]
    console.log("account", account.address)
    let contractAddress = await readConfig(chainID,"BTC_VERIFIER");
    const contractFactory = await ethers.getContractFactory('BtcTxVerifier',account)
    let contract  = await contractFactory.connect(account).attach(contractAddress);

    let raw = "0x0200000001c989ef0e2eb6eeb3dcd5cdba4e693bb1b1e36e861dfae99b3277deba895d7bab010000006b48304502210082a25cb2265354282d741cdd20d7c9915db244263499bef200dd2a42ddc9bf6902200a6dd43ccf2b5a982a6feb30cf5f5299e897182a45b0a7d8ea575648a8f596c10121036739c7b375844db641e5037bee466e7a79e32e40f2a90fc9e76bad3d91d5c0c5ffffffff02eb050000000000001976a914b61110dc356203e7640d4eb32c1ee66c6d3b896c88acaf010600000000001976a914cb539f4329eeb589e83659c8304bcc6c99553a9688ac00000000";
    let utxos = ["0x020000000141bde6bd9f8d49c9384f543d6877a9f03252882b3d57ce7d3b0047c774a397a4010000006a4730440220102bd887f90ae48ef809a789675e713cbf95e68c0ec80ba032a654926995f18002202d78ba75ad6ea2713184f1327d4b27b6debd9d65fb6d653afd9a4a7ddd4f06870121036739c7b375844db641e5037bee466e7a79e32e40f2a90fc9e76bad3d91d5c0c5ffffffff02e3050000000000001976a914b61110dc356203e7640d4eb32c1ee66c6d3b896c88ac07130600000000001976a914cb539f4329eeb589e83659c8304bcc6c99553a9688ac00000000"];
    let height = 837376;
    let proof = ["0xcae992608f84cbffc427bd564fdd03c1f7cd476488b134cab673e440d7611a1d",
                "0x835a8cc5b6f9e5b2ea783fea4ca63b018948348e6b0b34e6977c5055bec16713", "0xb2a363dc67bd557e7bae09236fd5b9684a5d4b027ad8728b5126076336bce942",
                "0x92014fadd723c132af375dd3de4045fe137fed2876c7d5c4a50ec8d828959bf0", "0xafd73d04ea0f3468321fe5feb6acab5821d145197e319e766fe6a61a21d72a79",
                "0xef14b279a67e4b9c3b41e507614de98acc95ca6dccc6ce09d9ae6d6351f24795", "0xe4202e7751e71b5bf72a14ff8bacb3aed7fd3be83b597b004dba96ead96496e1",
                "0xc00f9b055c863da2b80e88bcf5099c35fc66d86ebcf3e825aa16fbffaf7e7a55", "0x3c7f54e388711e2482f09c1de05ed9e0f405a238b142280f707604020ace5546",
                "0xba223402f7c43365b989dbeb337f8fc0e40b482bbbc184eee8a064db3e433985", "0x716c6dd99189aa8c052bde7b8d2612df9314970385740510f63f7fec653461ae",
                "0x89b3ad87cc4082d176853d7ac705cdc0f879b6c0c06e84c22a6670e47acd919d"];
    let merkleRoot = "0x76d6529f21b4b50246ccdc6b2bbfe945e40230510cd6d28cb91a73364f73ef88";
    let txid = "0xb4bc30332bfdba208b52635d45f7ed550774545c3e34128d4d39c0b06afdde41";
    let positions = [true, true, false, false, true, false, true, true, true, true, true, false];

    let tx = await contract.verifyBtcTx(raw, utxos, height, proof, merkleRoot, txid, positions);
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
