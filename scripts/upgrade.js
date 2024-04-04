const { ethers, upgrades, getChainId } = require('hardhat')

const {readConfig} = require('./utils/helper')

async function main() {
    let chainId = await getChainId();
    console.log("chainId is :" + chainId);

    const [ deployer ] = await ethers.getSigners();
    console.log("Deployer address", deployer.address);

    const address = await readConfig(chainId, "BTC_VERIFIER");

    console.log("BtcTxVerifier address", address);

    const verifierContract = await ethers.getContractFactory("BtcTxVerifier");
    const newContract = await upgrades.upgradeProxy(address, verifierContract);

    const contract = await newContract.deployed();
    console.log("upgrade address ", contract.address);

    console.log('completed.');

}

main();
