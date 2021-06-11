const { assert } = require('chai');
const { default: web3 } = require('web3');

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

// Configure chai assertions
require('chai')
    .use(require('chai-as-promised'))
    .should()

//Helper functions    
function tokens(n){
    //convert human readable number to wei
    //"1000000" => "1000000000000000000000000"
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap //Declare variables outside before

    //Refactoring - Duplication
    //Mocha -  Before hook
    before(async () => {
        token = await Token.new() // Fetch the contract
        ethSwap = await EthSwap.new(token.address) // Fetch the contract
        //Transfer all tokens to EthSwap(1 million)
        //Note: Assume that account that is performing all these is the deployer of the first account in Ganache
        await token.transfer(ethSwap.address, tokens('1000000')) //Transfer the balance
    })

    describe('Token deployment', async () => {
        // Basic test to show Token smart contract was deployed on the blockchain
        it('contract has a name', async () =>{
            const name = await token.name()
            assert.equal(name, 'Swot Token')
        })
    })

    describe('EthSwap deployment', async () => {
        // Basic test to show EthSwap smart contract was deployed on the blockchain
        it('contract has a name', async () =>{
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        //Tests to show contract has tokens
        //Test to show transfer of tokens was correct
        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address) //Check the balance
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async() => {
        let result

        before(async () => {
            //'from' & 'value' are corresponding to msg.sender & msg.value respectively in EthSwap.sol file
            //Purchase tokens before each example
            result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
        })

        it('Allows users to instantly purchase tokens from ethSwap for a fixed price', async() => {
            //Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            //Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address) //Check ether balance went up
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

            // console.log(result.logs)
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('sellTokens()', async() => {
        let result

        before(async () => {
            //Investor must approve tokens before the purchase
            await token.approve(ethSwap.address, tokens('100'), {from: investor})
            //Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), {from: investor})
        })

        it('Allows users to instantly sell tokens to ethSwap for a fixed price', async() => {
            //Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            //Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

            //Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //FAILURE: Investor can't sell more tokens than they have
            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        })
    })

})