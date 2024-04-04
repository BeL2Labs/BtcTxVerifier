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

    let btcTxZkpAddr = await contract.btcTxZkpAddr();
    let btcHeaderAddr = await contract.btcHeaderAddr();
    console.log("btcTxZkpAddr == ", btcTxZkpAddr, " btcHeaderAddr ", btcHeaderAddr);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
