const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk');
const { ethers } = require('ethers');

// Set up provider and signer
const provider = new ethers.providers.WebSocketProvider('wss://mainnet.infura.io/ws/v3/<YOUR_INFURA_PROJECT_ID>');
const signer = new ethers.Wallet('<YOUR_PRIVATE_KEY>', provider);

// Set up tokens
const tokenIn = new Token(ChainId.MAINNET, '0x1D987200dF3B744CFa9C14f713F5334CB4Bc4D5D', 6);
const tokenOut = WETH[ChainId.MAINNET];

// Set up router and swap parameters
const routerAddress = '<ROUTER_ADDRESS>';
const routerABI = require('./uniswap-v2-router-abi.json');
const router = new ethers.Contract(routerAddress, routerABI, signer);
const amountIn = '<AMOUNT_IN>'; // Token amount in smallest units (e.g. wei)
const amountOutMin = '<AMOUNT_OUT_MIN>'; // Minimum token amount out in smallest units (e.g. wei)
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

async function checkAndSwap() {
  try {
    // Fetch the current token pair price and route
    const pair = await Fetcher.fetchPairData(tokenIn, tokenOut, provider);
    const route = new Route([pair], tokenIn);
    const amountInScaled = ethers.utils.parseUnits(amountIn, 6);

    // Check if liquidity pool exists for token pair
    const liquidity = await router.getAmountsOut(amountInScaled, [tokenIn.address, tokenOut.address]);
    if (liquidity[1].toString() == "0") {
      console.log("Liquidity pool does not exist, retrying in 5 seconds...");
      setTimeout(checkAndSwap, 5000);
      return;
    }

    // Create the trade and sign the transaction
    const trade = new Trade(route, new TokenAmount(tokenIn, amountInScaled), TradeType.EXACT_INPUT);
    const tx = await router.swapExactTokensForETH(
      amountInScaled,
      amountOutMin,
      [tokenIn.address, tokenOut.address],
      signer.address,
      deadline,
      { gasLimit: 500000, value: trade.minimumAmountOut(0).raw, gasPrice: ethers.utils.parseUnits('30', 'gwei') }
    );
    console.log('Swap transaction sent:', tx.hash);
    await tx.wait();
    console.log('Swap transaction confirmed:', tx.hash);
  } catch (error) {
    console.log(error);
  }
}

checkAndSwap();