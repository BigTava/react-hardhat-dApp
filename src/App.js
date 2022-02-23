import { useState } from 'react';
import { ethers } from 'ethers';

import logo from './logo.svg';
import './App.css';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';

const greeterAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const tokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

function App() {
  const [greeting, setGreetingValue] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState(0);

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      // give us an array of accounts
      const [account] = await window.ethereum.request({method: 'eth_requestAccounts'})
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);
      const balance = await contract.balanceOf(account);
      console.log("Balance: ", balance.toString())
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }

  async function fetchGreeting() {
    // this condition checks if wallet/metamask extension is connected
    if (typeof window.ethereum !== 'undefined') {
      // create new provider 
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
      try {
        const data = await contract.greet();
        console.log('data ', data);
      } catch (err) {
        console.log("Error ", err);
      }
    }
  }

  async function setGreeting() {
    // dont update if is an empty string
    if (!greeting) return
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount();
      // since we are creating an actual update to the blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // we need to sign the transaction
      const signer = provider.getSigner();

      // get new instance of the contract passing the signer instead of the provider
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);

      // passing the greeting variable (user input)
      const transaction = await contract.setGreeting(greeting);

      setGreetingValue('');
      await transaction.wait();

      fetchGreeting();
    }
  }
   
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input 
          onChange={e => setGreetingValue(e.target.value)}
          placeholder='Set Greeting'
          value={greeting}
        />
        <br />

        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
        <input onChange={e => setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Amount" />
      </header>
    </div>
  );
}

export default App;
