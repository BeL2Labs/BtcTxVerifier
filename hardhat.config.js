require('hardhat-deploy')
require('@openzeppelin/hardhat-upgrades');

const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
const { private_key } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    mainnet: {
      url: `https://api.elastos.io/esc`,
      accounts: [
        ...(private_key ? [`${private_key}`] : [])
      ],
    },

    "testnet": {
      url: `https://api-testnet.elastos.io/esc`,
      accounts: [
        ...(private_key ? [`${private_key}`] : []),
      ],
    },

    local: {
      url: `http://127.0.0.1:6111`,
      accounts: [
        ...(private_key ? [`${private_key}`] : [])
      ]
    },

    hardhat: {
      chainId: 100,
      accounts: [
        {privateKey:(private_key ? `${private_key}` : ""),balance:"10000000000000000000000"},
      ],
      blockGasLimit: 8000000
    }

  },

  solidity:{
    version: "0.8.20",
    setting:{
      optimier:{
        enabled:true,
        runs:200,
      },
    },
  },
};
