// Migration file usually take the contracts and put them on the blockchain
// Truffle uses artifacts which are kind of JS version of smart contracts with JSON
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
    //Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed() //Fetch token content

    //Deploy EthSwap
    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed() //Fetch token content

    //Transfer all tokens to EthSwap(1 million)
    //Note: Assume that account that is performing all these is the deployer of the first account in Ganache
    await token.transfer(ethSwap.address, '1000000000000000000000000')
};
