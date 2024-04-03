const {ethers, upgrades, web3} = require("hardhat");
const {readConfig, sleep} = require('../scripts/utils/helper');

describe("BtcZkVerifer", function () {
    // Contracts are deployed using the first signer/account by default
    let contract;
    let deployer;
    it("deployed address and owner ", async function () {
        const signers = await ethers.getSigners();
       deployer = signers[0];
      const factory = await ethers.getContractFactory("BtcZkVerifier", deployer);
        contract = await upgrades.deployProxy(factory,
          [],
          {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true,
          });

       await contract.deployed();
      console.log("contract ", contract.address, " admin ", deployer.address, " contract.onwer=", await contract.owner())
    });

})
