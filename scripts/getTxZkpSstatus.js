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
    let tx = reverseHexString("0xb4bc30332bfdba208b52635d45f7ed550774545c3e34128d4d39c0b06afdde41")
    let status = await contract.getTxZkpStatus(tx);
    console.log("status == ", status);
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
