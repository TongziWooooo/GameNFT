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
  const [data, setData] = useState([]);
  const [gameIndex, setGameIndex] = useState(-1);
  const [gameResult, setGameResult] = useState(-1);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (data.length){
      printLines();
    }
  }, [data]);

  const printLines = () => {
    let wait = 0;
    const delay = 50;
    for (const i in data) {
      const typewriter = new Typewriter(document.getElementById(i.toString()), {delay: delay, cursor: ""})
      typewriter.pauseFor(delay * wait).typeString(data[i]).start()
      wait += data[i].length + 15;
    }
    setTimeout(showResult, (wait + 10) * delay)
  }

  const showResult = async () => {
    setIsOver(true);
    const result = gameResult ? "WON :)" : "LOST :(("
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Game ends! You ${result}`)) {
      if (gameResult) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner()
          const contractArenaGame = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
          const transaction = await contractArenaGame.updateGameResult(gameIndex, gameResult)
          console.log('data: ', transaction)
        } catch (err) {
          console.log("Error: ", err)
        }
      }
      navigate("/arena");
    } else {

    }
  }


  useEffect(() => {
    async function getGameResult() {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({method: 'eth_requestAccounts'});
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const atkPlayerAddress = state.attacker.address
      const defPlayerAddress = state.attacker.address
      const getInfo = (token, attr) => {
        return {
          tokenID: token.tokenID.toString(),
          name: token.name,
          attack: (attr.attack_base + attr.attack_growth * attr.level).toString(),
          armor: (attr.armor_base + attr.armor_growth * attr.level).toString(),
          speed: (attr.speed_base + attr.speed_growth * attr.level).toString(),
          hp: (attr.hp_base + attr.hp_growth * attr.level).toString(),
          luck: attr.luck.toString()
        }
      }
      const atkToken = getInfo(state.attacker.token, state.attacker.token.attributes)
      const defToken = getInfo(state.defender.token, state.defender.token.attributes)

      const contractArenaGame = new ethers.Contract(arenaGameAddress, ArenaGame.abi, signer)
      let event;
      try {
        const transaction = await contractArenaGame.createGame(atkPlayerAddress, defPlayerAddress,
            atkToken, defToken)
        const rc = await transaction.wait()
        event = rc.events.find(event => event.event === "GameCreated")
        console.log('data: ', event.args)

        let params = {
          seed: event.args.seed.toNumber(),
          heroInfo1: atkToken,
          heroInfo2: defToken
        }
        const res = await Moralis.Cloud.run("battle", params);
        console.log(res)
        setGameIndex(event.args.gameIndex);
        setGameResult(res[1]);
        setData(res[0]);
        // printLines();

      } catch (err) {
        console.log("Error: ", err)
      }

    }
    getGameResult()
  }, [])

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
