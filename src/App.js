// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;

import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import GameNFT from './artifacts/contracts/GameNFT.sol/GameNFT.json'
import ArenaGame from './artifacts/contracts/ArenaGame.sol/ArenaGame.json'

// Update with the contract address logged out to the CLI when it was deployed
// const greeterAddress = "your-contract-address"
const greeterAddress = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49"
const gameNFTAddress = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc"
const arenaGameAddress = "0x4631BCAbD6dF18D94796344963cB60d44a4136b6"
function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState()
  const [yourTokenID, setYourTokenID] = useState()
  const [adversaryTokenID, setAdversaryTokenID] = useState()

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  //
  async function mintNFT() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(gameNFTAddress, GameNFT.abi, signer)
      const transaction = await contract.mintItem("https://www.google.com", 0)
      await transaction.wait()
      console.log(transaction)
    }
  }

  async function showAllNFT() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(gameNFTAddress, GameNFT.abi, provider)
      try {
        const data = await contract.fetchAllNFT()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function showUserNFT() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(gameNFTAddress, GameNFT.abi, signer)
      try {
        const data = await contract.fetchUserNFT()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function burnNFT() {

  }

  async function createGame() {
    if(!adversaryTokenID) return;
    console.log(yourTokenID, adversaryTokenID)
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
      try {
        const data = await contract.createGame(yourTokenID, adversaryTokenID)
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  return (
      <div className="App">
        <header className="App-header">
          <button onClick={fetchGreeting}>Fetch Greeting</button>
          <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting"/>
          <button onClick={setGreeting}>Set Greeting</button>

          <button onClick={mintNFT}>Mint NFT</button>
          <button onClick={showUserNFT}>Fetch Your NFT</button>
          <button onClick={showAllNFT}>Fetch All NFT</button>
          <input onChange={e => setYourTokenID(e.target.value)} placeholder="Your Token ID"/>
          <input onChange={e => setAdversaryTokenID(e.target.value)} placeholder="Adversary Token ID"/>
          <button onClick={createGame}>Create Game</button>
        </header>
      </div>
  );
}

export default App;
