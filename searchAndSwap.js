require('dotenv').config()
const Web3 = require('web3');
const UniswapV2Router02ABI = require('./abis/Camelot.json');

// Instantiate Web3 with your preferred provider
const web3 = new Web3(process.env.RPC_URL);

// Set account details
const walletAddress = process.env.WALLET_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

// Set the addresses of the tokens you want to swap
const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // WETH address
const tokenAddress = '0x1D987200dF3B744CFa9C14f713F5334CB4Bc4D5D'; // REKT address

// Instantiate the Uniswap V2 Router 02 contract
const uniswapRouterAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d';
const uniswapRouter = new web3.eth.Contract(UniswapV2Router02ABI, uniswapRouterAddress);

// Check for liquidity before swapping
async function checkLiquidityAndSwap() {
  try {
    console.log('Liquidity pool exists, proceeding with swap...');
    const tokenInDecimals = web3.utils.toBN('1000000000'); // i just need the value of weth in wei
    const amountOutMin = 0;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minute deadline
    const path = [wethAddress, tokenAddress];
    const tx = {
      //the transaction inputs for camelot swapExactTokensForTokensSupportingFeeOnTransferTokens accepts five inputs
      from: walletAddress,
      to: uniswapRouterAddress,
      gas: 400000,
      //gasPrice: web3.utils.toWei('1', 'gwei'),
      data: uniswapRouter.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        tokenInDecimals,
        amountOutMin,
        path,
        walletAddress,
        walletAddress,
        deadline
      ).encodeABI(),
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction hash:', txReceipt.transactionHash);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

checkLiquidityAndSwap();


//the script still needs an update to check if the liquidity pair exists.