// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");
const {writeConfig, sleep} = require('./utils/helper')
async function main() {
  let chainID = await getChainId();
  const signers = await ethers.getSigners();
  let deployer = signers[0];
    console.log("chainId ", chainID, "deployer =", deployer.address);
  const factory = await ethers.getContractFactory("BtcZkVerifier", deployer);
  let contract = await upgrades.deployProxy(factory,
      [],
      {
        initializer: "initialize",
        unsafeAllowLinkedLibraries: true,
      });
  await writeConfig(chainID,chainID,"BTC_VERIFIER",contract.address);
  await contract.deployed();
  console.log("contract deployed ", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
