require('dotenv').config()
const Web3 = require('web3');
const ABI = require('./abis/${name_of_token}.json');

//contract address for arbitrum token
const contractAddress = '0x912CE59144191C1204E64559FE8253a0e49E6548';

// Connect to the arbitrum network. change rpc
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

// Create an instance of the ERC20 contract
const contract = new web3.eth.Contract(ABI, contractAddress);


// Set the sender account
const senderAddress = process.env.COMPROMISED_WALLET_ADDRESS;
const privateKey = process.env.COMPROMISED_PRIVATE_KEY;

// const sender = web3.eth.accounts.privateKeyToAccount(privateKey);
// web3.eth.accounts.wallet.add(sender);

// Set the recipient address and the amount of tokens to send
const recipientAddress = process.env.RECEIPIENT_WALLET_ADDRESS;
const amount = web3.utils.toBN("5250000000000000000000"); //dont forget to change amount amount that needs to be sent

//set gas and all
const gasPrice = web3.utils.toWei('0.1', 'Gwei');
const gasLimit = '500000';
//const priorityFee = web3.utils.toWei('1', 'Gwei');



async function sendToken() {
  try {
    const balance = await contract.methods.balanceOf(senderAddress).call();
    console.log(`The balance of ${senderAddress} is ${balance / (10 ** 18)} tokens.`);
    const ethBalInWei = await web3.eth.getBalance(senderAddress);
    const ethBalInETH = web3.utils.fromWei(ethBalInWei, 'ether');
    
    if (ethBalInETH > 0.0002) {
      if (balance > 0) {
        contract.methods.transfer(recipientAddress, amount)
          .send({
            from: senderAddress,
            gas: gasLimit,
            gasPrice: gasPrice,
            //maxPriorityFeePerGas: priorityFee,
            //maxFeePerGas: web3.utils.toBN(gasPrice).add(web3.utils.toBN(priorityFee)).toString()
          })
          .then((tx) => {
            console.log(`Transaction Successful: ${tx.transactionHash}`);
          })
          .catch((err) => {
            console.error(err);
          });

      } else {
        console.log(`Transaction Failed Due To Low Token Balance`)
      }
    } else {
      console.log('Insufficient Gas For this Transaction')
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

setInterval(sendToken, 1500); //change interval to 1sec


