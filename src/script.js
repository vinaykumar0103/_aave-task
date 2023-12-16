// Import the required libraries
const Web3 = require('web3');
const { ethers } = require('ethers');

// Connect to Infura
let web3 = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

// ERC20 ABI
let erc20Abi = [
  {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
    {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

// Aave LendingPool ABI
let lpAbi = [
  {
    "constant": false,
    "inputs": [
      {"name": "_reserve", "type": "address"},
      {"name": "_amount", "type": "uint256"},
      {"name": "onBehalfOf", "type": "address"},
      {"name": "referralCode", "type": "uint16"}
    ],
    "name": "deposit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

// Set up the contracts
let tokenContract = new web3.eth.Contract(erc20Abi, '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357'); // DAI-TestnetMintableERC20-Aave
let lpContract = new web3.eth.Contract(lpAbi, '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'); // Aave Pool-Proxy

// Amount to deposit (in Wei)
let amount = ethers.utils.parseUnits('0.1', 18).toString();


async function deposit() {
  try {
  // approve the LendingPool contract 

  let approve = tokenContract.methods.approve(lpContract.options.address, amount);
  let encodedApprove = approve.encodeABI();

  let txApprove = {
    from: '0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0',
    to: tokenContract.options.address,
    gas: 2000000,
    data: encodedApprove
  };

  let signedApprove = await web3.eth.accounts.signTransaction(txApprove, process.env.PRIVATE_KEY);
  let receiptApprove = await web3.eth.sendSignedTransaction(signedApprove.rawTransaction);

  // Log allowance
    let allowance = await tokenContract.methods.allowance('0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0', lpContract.options.address).call();
    console.log('Allowance after approval:', allowance);


  //  Deposit your tokens into the LendingPool

  let deposit = lpContract.methods.deposit(tokenContract.options.address, amount, '0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0', 0);
  let encodedDeposit = deposit.encodeABI();

  

  let txDeposit = {
    from: '0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0',
    to: lpContract.options.address,
    gas: 2000000,
    data: encodedDeposit
  };

  let signedDeposit = await web3.eth.accounts.signTransaction(txDeposit, process.env.PRIVATE_KEY);
  let receiptDeposit = await web3.eth.sendSignedTransaction(signedDeposit.rawTransaction);

     // Log deposit status
    console.log('Deposit successful');
    console.log('Transaction Hashes:', [receiptApprove.transactionHash, receiptDeposit.transactionHash]);

    // Before deposit
let balanceBefore = await tokenContract.methods.balanceOf('0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0').call();
console.log(`Balance before deposit: ${balanceBefore} Wei`);

// After deposit checkTransactionStatus
let balanceAfter = await tokenContract.methods.balanceOf('0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0').call();
console.log(`Balance after deposit: ${balanceAfter} Wei`);


  // Return the transaction hashes
  return [receiptApprove.transactionHash, receiptDeposit.transactionHash];
   } catch (error) {
    console.error('Error during deposit:', error);
    throw error; 
  }

}

// the transaction status
async function checkTransactionStatus(txHash) {
  let receipt = await web3.eth.getTransactionReceipt(txHash);
  if (receipt !== null) {
    if (receipt.status) {
      console.log('Transaction was successful');
       // Retrieve the balance after successful deposit
      let balance = await tokenContract.methods.balanceOf('0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0').call();
      console.log(`Balance after deposit: ${balance} Wei`);
    } else {
      console.log('Transaction failed');
    }
  } else {
    console.log('Transaction is pending');
  }
}

// Execute the deposit
deposit().then((txHashes) => {
  // Iterate over the array of transaction hashes
  txHashes.forEach(txHash => {
    checkTransactionStatus(txHash).catch((err) => console.error(err));
  });
}).catch((err) => console.error(err));
