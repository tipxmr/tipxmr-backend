/** @module monero */

const path = require("path");
const monerojs = require("monero-javascript");

// server wallet seed
const env = require("dotenv");
env.config();
const {
  WALLET_SEED,
  WALLET_PW,
  WALLET_NAME,
  WALLET_RESTORE_HEIGHT,
  WALLET_RPC_HOST,
  WALLET_RPC_USER,
  WALLET_RPC_PW,
  DAEMON,
  DAEMON_USER,
  DAEMON_PW,
  NETWORK_TYPE,
} = process.env;

let walletRpc = monerojs.connectToWalletRpc(
  WALLET_RPC_HOST,
  WALLET_RPC_USER,
  WALLET_RPC_PW
);

// create a wallet on monero-wallet-rpc
async function createWallet() {
  return walletRpc.createWallet({
    // path: path.resolve(process.cwd(), "wallet", WALLET_NAME),
    path: WALLET_NAME,
    password: WALLET_PW,
    // mnemonic: WALLET_SEED,
    // restoreHeight: WALLET_RESTORE_HEIGHT,
    // networkType: NETWORK_TYPE,
  });
}

async function openWallet() {
  try {
    return await walletRpc.openWallet({
      path: WALLET_NAME,
      password: WALLET_PW,
      // mnemonic: WALLET_SEED,
      // restoreHeight: WALLET_RESTORE_HEIGHT,
      // networkType: NETWORK_TYPE,
    });
  } catch (err) {
    console.log(err);
  }
}

async function getSubaddress(wallet) {
  try {
    const accIndex = 0;
    const addrIndex = 1;
    return await wallet.getAddress(accIndex, addrIndex);
  } catch (err) {
    console.log(err);
  }
}

// TODO get subaddress function and import to server.js

module.exports = { walletRpc, createWallet, openWallet, getSubaddress };

// openWallet()
//   .then(() => walletRpc.createSubaddress(0, "test"))
//   .then(console.log);
// .then((wallet) => wallet.getAddress())
// .then((wallet) => getSubaddress(wallet))
// .then((wallet) => console.log(wallet));
