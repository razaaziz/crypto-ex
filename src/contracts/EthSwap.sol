pragma solidity >=0.4.21 <0.6.0;

import "./Token.sol";

contract EthSwap {
    //State variable - Data thats stored in the 'name' & 'token' variables are stored on the blockchain
    string public name = "EthSwap Instant Exchange";
    Token public token; //It creates a variable that represents the token smart contract
    uint public rate = 100;

    event TokensPurchased(
        address account, //Who purchased the tokens
        address token, //Token that was purchased
        uint amount, //Amount if token purchased
        uint rate //Redemption rate at which they purchased
    );

    event TokensSold(
        address account, //Who sold the tokens
        address token, //Token that was sold
        uint amount, //Amount if token sold
        uint rate //Redemption rate at which they sold
    );

    //Funtion runs whenever the smart contract is deployed to the network
    //Local variable -  _token is a local variable & does not store in the blockchain...
    constructor(Token _token) public {
        // ...unless we do this
        token = _token;
    }

    //payable - allow us to send ethereum whenever funtion is called(would not be able to send ether without it)
    function buyTokens() public payable {
        //Redemption rate = # of tokens they receive for 1 ether
        //Amount of Ethereum * Redemption rate
        //'value' tells how much ether waas sending when this function was called
        //Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;

        //Check if exchange has enough tokens
        //Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        //Transfer token from EthSwap contract to the person whos buying them
        //'msg' is a global variable inside of solidity & 'sender' is the user value of the address thats calling this function
        token.transfer(msg.sender, tokenAmount);

        //Emit an event
        //Tokens were purchased
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }


    function sellTokens(uint _amount) public {
        //User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //Calculate the aount of ether to redeem
        //Amount of token they want to sell divided by the rate
        uint etherAmount = _amount / rate;

        //Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        //Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        //Emit an event
        //Tokens were sold
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
