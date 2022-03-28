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
import Marketplace from './artifacts/contracts/Marketplace.sol/Marketplace.json'

// Update with the contract address logged out to the CLI when it was deployed
// const greeterAddress = "your-contract-address"
const greeterAddress = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49"
const gameNFTAddress = "0x742489F22807ebB4C36ca6cD95c3e1C044B7B6c8"
const arenaGameAddress = "0x4631BCAbD6dF18D94796344963cB60d44a4136b6"
const marketplaceAddress = "0x666D0c3da3dBc946D5128D06115bb4eed4595580"

function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState()
  const [yourTokenID, setYourTokenID] = useState()
  const [adversaryTokenID, setAdversaryTokenID] = useState()
  const [marketTokenID, setMarketTokenID] = useState()
  const [marketItemID, setMarketItemID] = useState()

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
      const rc = await transaction.wait()
      const event = rc.events.find(event => event.event === "NFTCreated")
      const [q,w,e,c] = event.args
      console.log("q", q)
      console.log("w", w)
      console.log("e", e)
      console.log("c", c)
      console.log("args", event.args)
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

  async function createMarketItem() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer)

      try {
        const data = await contract.createMarketItem(gameNFTAddress, marketTokenID,
            ethers.utils.parseEther("1"),
            { value: ethers.utils.parseEther("2") })
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function fetchUnsoldItems() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, provider)
      try {
        const data = await contract.fetchUnsoldItems()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function buyItem() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer)
      try {
        const data = await contract.buyItem(gameNFTAddress, marketItemID,
            {value: ethers.utils.parseEther("1")})
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
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
          <input onChange={e => setMarketTokenID(e.target.value)} placeholder="Token ID to sell"/>
          <button onClick={createMarketItem}>Create Market Item</button>
          <button onClick={fetchUnsoldItems}>Fetch All Unsold Items in the Market</button>
          <input onChange={e => setMarketItemID(e.target.value)} placeholder="Item ID to buy"/>
          <button onClick={buyItem}>But by Item ID</button>
        </header>
      </div>
  );
}

export default App;
