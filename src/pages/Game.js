import React, { useState, useEffect } from "react";
import "../styles/Hero.css";
import "../styles/utils.css"
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import {ethers} from "ethers";
import Arena from "../artifacts/contracts/Arena.sol/Arena.json";
import ArenaGame from "../artifacts/contracts/ArenaGame.sol/ArenaGame.json";
import Moralis from "moralis";
import {arenaAddress, arenaGameAddress} from "../App";
import Typewriter from 'typewriter-effect/dist/core';

const Game = () => {
  let navigate = useNavigate();
  const {state} = useLocation();
  // const [data, setData] = useState(state);
  const [data, setData] = useState([
    "Tom attacks Jerry, damage=5", "Jerry attacks Tom, damage=5",
    "Tom dodges!", "Jerry attacks Tom, damage=5",
    "Tom attacks Jerry, damage=5", "Jerry dodges!",]);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    console.log(state)
    console.log(data)
    let wait = 0;
    const delay = 50;
    for (const i in data) {
      const typewriter = new Typewriter(document.getElementById(i.toString()), {delay: delay, cursor: ""})
      typewriter.pauseFor(delay * wait).typeString(data[i]).start()
      wait += data[i].length + 15;
    }
    setTimeout(showResult, wait * delay)
  }, [])

  const showResult = () => {
    setIsOver(true);
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Game ends!")) {
      navigate("/arena");
    }
    else {

    }
  }


  const getGameResult = async () => {
    let adversaryTeamID = ""
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
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

  const goCreate = () => {
    console.log(state)
    navigate("/arena");
  };

  return (
    <div id="game">

      {/*<Header />*/}

      <h1 id="header-text-first"> GameNFT Battle Field</h1>
      <h5 id="header-subtext">The battle has began...!</h5>
      <div id="line-wrapper">
        {data.map((item, index) => (<span className="battle-line" id={index.toString()} key={index}>{}</span>))}
      </div>

      {isOver ? <div id="hero-buttons"><button id="create" onClick={goCreate}>Return</button></div>
          : null}

    </div>
  );
};

export default Game;
