// Migration file usually take the contracts and put them on the blockchain
// Truffle uses artifacts which are kind of JS version of smart contracts with JSON
const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
