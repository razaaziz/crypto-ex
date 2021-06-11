import React, { Component } from 'react';
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'

import './App.css';
import Main from './Main';

class App extends Component {

  //Call MetaMask
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData() //Import all the data into the app we need that is stored on blockchain
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts() //Fetch the account from MetaMask
    this.setState({ account: accounts[0] }) //We set this state here so we can access data in other places in the app
    // console.log(this.state.account)

    const ethBalance = await web3.eth.getBalance(this.state.account) //Balance of the user account
    this.setState({ ethBalance }) //Store in state
    // console.log(this.state.ethBalance)

    //Load Token
    //Create JS version of contracts where we can fetch and call the functions
    //abi - How contract works, what the functions are, basically what the code looks like
    //address - Where the smart contract is on the blockchain
    // const abi = Token.
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      // const address = Token.networks[networkId].address 
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      // console.log(token)
      //call() method fetch information from the blockchain, create transactions
      let tokenBalance = await token.methods.balanceOf(this.state.account).call() //Load token here
      this.setState({ tokenBalance: tokenBalance.toString() }) //Store token in state
      // console.log("tokenBalance", tokenBalance.toString())
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    //Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
      // console.log(token)
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

    this.setState({ loading: false })
    // console.log(this.state.ethSwap)
  }

  async loadWeb3() {
      // if (window.ethereum) {
      //   window.web3 = new Web3(window.ethereum)
      //   await window.ethereum.enable()
      // }
      if (window.ethereum) {
        //send() method signing transactions and putting new data on the blockchain and yet pay gas
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask')
      }
  }

  //Wraps the smart contract buy token function
  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  //Wraps the smart contract sell token function
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    //Sets up the default state
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    //Loader for when all blockchain is loaded
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main 
        ethBalance={this.state.ethBalance} 
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
