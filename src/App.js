import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import GameNFT from './artifacts/contracts/GameNFT.sol/GameNFT.json'
import Arena from './artifacts/contracts/Arena.sol/Arena.json'
import ArenaGame from './artifacts/contracts/ArenaGame.sol/ArenaGame.json'
import Marketplace from './artifacts/contracts/Marketplace.sol/Marketplace.json'
import Moralis from "moralis";

// Update with the contract address logged out to the CLI when it was deployed
const gameNFTAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const arenaAddress = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f"
const arenaGameAddress = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07"
const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {
  // store greeting in local state
  const [yourTokenID, setYourTokenID] = useState()
  const [marketTokenID, setMarketTokenID] = useState()
  const [marketItemID, setMarketItemID] = useState()
  const [playerTokenID, setPlayerTokenID] = useState()
  const [adversaryTeamID, setAdversaryTeamID] = useState()


  async function moralisHelloWorld() {
    console.log(Moralis.Cloud)
    const hello = await Moralis.Cloud.run("HelloWorld");

    console.log("Moralis Cloud Function");
    console.log(hello);
  }

  async function moralisFight() {
    const res = await Moralis.Cloud.run("battle");
    console.log(res);
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function mintNFT() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(gameNFTAddress, GameNFT.abi, signer)
      console.log("start")
      const transaction = await contract.mintItem("https://www.google.com", 0)
      console.log("end")
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

  async function createArenaPlayer() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaAddress, Arena.abi, signer)

      try {
        const data = await contract.createPlayer(gameNFTAddress, playerTokenID,
            { value: ethers.utils.parseEther("1") })
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function fetchPlayerTeam() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaAddress, Arena.abi, signer)
      try {
        const data = await contract.fetchPlayerTeamAddress(signer.getAddress())
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function fetchAllPlayers() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(arenaAddress, Arena.abi, provider)
      try {
        const data = await contract.fetchAllPlayers()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function quitArena() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaAddress, Arena.abi, signer)
      try {
        const data = await contract.quitArena()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function fetchAllGameRecord() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
      try {
        const data = await contract.fetchGameRecords()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }


    async function createGame() {
    if(!adversaryTeamID) return;
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contractArena = new ethers.Contract(arenaAddress, Arena.abi, signer)
      let atkPlayerInfo, defPlayerInfo;


      try {
        atkPlayerInfo = await contractArena.fetchPlayerTeamAddress(signer.getAddress())
        console.log('data: ', atkPlayerInfo)
      } catch (err) {
        console.log("Error: ", err)
      }

      try {
        defPlayerInfo = await contractArena.fetchPlayerTeamIndex(adversaryTeamID)
        console.log('data: ', defPlayerInfo)
      } catch (err) {
        console.log("Error: ", err)
      }

      // Get Token Attributes
      let heroInfo1 = {
        tokenID : "0", name: "Tom", attack : "10", armor : "15",
        speed : "25", luck : "40", hp : "150"
      }
      let heroInfo2 = {
        tokenID : "1", name: "Jerry", attack : "15", armor : "10",
        speed : "40", luck : "30", hp : "120"
      }


      const contractArenaGame = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
      let event;
      try {
        let atkPlayerAddress = atkPlayerInfo.playerAddress
        let defPlayerAddress = defPlayerInfo.playerAddress
        const transaction = await contractArenaGame.createGame(atkPlayerAddress, defPlayerAddress,
            heroInfo1, heroInfo2)
        const rc = await transaction.wait()
        event = rc.events.find(event => event.event === "GameCreated")
        console.log('data: ', event.args)
      } catch (err) {
        console.log("Error: ", err)
      }


      let params = {
          seed: event.args.seed.toNumber(),
          heroInfo1: heroInfo1,
          heroInfo2: heroInfo2
      }


      const res = await Moralis.Cloud.run("battle", params);
      console.log(res)
      let gameIndex = event.args.gameIndex;
      let gameResult = res[1]

      try {
        const transaction = await contractArenaGame.updateGameResult(gameIndex, gameResult)
        console.log('data: ', transaction)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function structPassTest() {
    await requestAccount()
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
      try {
        let params = {
          tokenID : "0",
          attack : "1",
          armor : "2",
          speed : "3",
          luck : "4",
          hp : "5"
        }
        const data = await contract.test(params)
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  return (
      <div className="App">
        <header className="App-header">

          {/*<button onClick={fetchGreeting}>Fetch Greeting</button>*/}
          {/*<input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting"/>*/}
          {/*<button onClick={setGreeting}>Set Greeting</button>*/}

          <button onClick={mintNFT}>Mint NFT</button>
          <button onClick={showUserNFT}>Fetch Your NFT</button>
          <button onClick={showAllNFT}>Fetch All NFT</button>
          {/*<input onChange={e => setYourTokenID(e.target.value)} placeholder="Your Token ID"/>*/}
          <input onChange={e => setAdversaryTeamID(e.target.value)} placeholder="Adversary Team ID"/>
          <button onClick={createGame}>Create Game</button>
          <input onChange={e => setMarketTokenID(e.target.value)} placeholder="Token ID to sell"/>
          <button onClick={createMarketItem}>Create Market Item</button>
          <button onClick={fetchUnsoldItems}>Fetch All Unsold Items in the Market</button>
          <input onChange={e => setMarketItemID(e.target.value)} placeholder="Item ID to buy"/>
          <button onClick={buyItem}>But by Item ID</button>

          <input onChange={e => setPlayerTokenID(e.target.value)} placeholder="TokenID for Arena"/>
          <button onClick={createArenaPlayer}>Create Arena Player</button>

          <button onClick={fetchPlayerTeam}>Fetch Your Team</button>
          <button onClick={fetchAllPlayers}>Fetch All Players in the Arena</button>
          <button onClick={quitArena}>Quit Arena</button>

          <button onClick={fetchAllGameRecord}>Fetch All Game Record</button>

          <button onClick={structPassTest}>Test Pass Struct</button>

          <button onClick={moralisHelloWorld}>Moralis Hello World Cloud Function</button>

          <button onClick={moralisFight}>Moralis Fight</button>
        </header>
      </div>
  );
}

export default App;
