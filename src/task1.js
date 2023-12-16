const { ethers } = require('ethers');

// Your BSC address
const yourAddress = '0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0';

// Recipient address and amount (in wei)
const recipientAddress = '0xF5eA1EF0eeE988cf2FBaa1518b516348e343B30f'; 
const amount = ethers.utils.parseUnits('0.1'); // 11 wei

// Encoding the transfer function
const transferFunction = new ethers.utils.Interface(['function transfer(address to, uint256 amount)']);
const data = transferFunction.encodeFunctionData('transfer', [recipientAddress, amount]);

// Calling the transferFunds function
const contractAddress = '0xF5eA1EF0eeE988cf2FBaa1518b516348e343B30f'; // Contract address (on BSC Testnet)
const web3Provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'; // BSC Testnet node URL

const provider = new ethers.providers.JsonRpcProvider(web3Provider);
const wallet = new ethers.Wallet('private_key', provider); // Replace with your private key

const contract = new ethers.Contract(contractAddress, ['function transferFunds(address _address, bytes calldata _payload)'], wallet);

async function transfer() {
    const tx = await contract.transferFunds(yourAddress, data, { gasPrice: ethers.utils.parseUnits('100', 'gwei') }); // Set gas price to 100 Gwei
    await tx.wait();
    console.log('Transfer successful');
}

transfer().catch(error => console.error(error));
