require('dotenv').config()
const Web3 = require('web3');

// Account Parameters
const web3 = new Web3(process.env.RPC_URL);
const account = process.env.COMPROMISED_WALLET_ADDRESS;
const privateKey = process.env.COMPROMISED_PRIVATE_KEY;
const recipient = process.env.RECEIPIENT_WALLET_ADDRESS;

async function sendEth() {
  try {
    let nonce = await web3.eth.getTransactionCount(account);
    const balance = await web3.eth.getBalance(account);
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    const balanceRounded = parseFloat(balanceInEth).toFixed(8);
    console.log(`Account balance rounded is ${balanceRounded} ETH`);

    if (balanceRounded > 0.0001) {
      const amountToSendRounded = parseFloat((balanceRounded * 0.85)).toFixed(7);
      console.log(`Account balance to send rounded is ${amountToSendRounded} ETH`);
      const amountToSend = web3.utils.toWei((amountToSendRounded).toString(), 'ether');
      const gasPrice = web3.utils.toWei('0.2', 'Gwei');
      const gasLimit = '600000';
      //const priorityFee = web3.utils.toWei('0.005', 'Gwei');

      web3.eth.accounts.wallet.add(privateKey);

      const tx = {
        from: account,
        to: recipient,
        value: amountToSend,
        gasPrice: gasPrice,
        gas: gasLimit,
        nonce: nonce,
        // maxPriorityFeePerGas: priorityFee,
        // maxFeePerGas: web3.utils.toBN(gasPrice).add(web3.utils.toBN(priorityFee)).toString()
      };
      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`Transaction sent with hash: ${txReceipt.transactionHash}`);
      nonce++;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setInterval(sendEth, 3000);
