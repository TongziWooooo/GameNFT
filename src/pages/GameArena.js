import React, {useEffect, useState} from "react";
import CardList from "../components/CardList";
import Header from "../components/Header";
import Moralis from "moralis";
import {useMoralis} from "react-moralis";
import "../styles/Arena.css"
import {arenaAddress, gameNFTAddress} from "../App";
import {ethers} from "ethers";
import Arena from '../artifacts/contracts/Arena.sol/Arena.json'


const GameArena = () => {
  const NFT = Moralis.Object.extend("NFT");
  const team = Moralis.Object.extend("Team");

  const [isTeamPage, setIsTeamPage] = useState(false);
  const [myTeamMember, setMyTeamMember] = useState("");
  const [exploreData, setExploreData] = useState([]);
  const { authenticate, isAuthenticated, isAuthenticating, user} = useMoralis();

  const switchArena = () => {
    setIsTeamPage(!isTeamPage)
    console.log("isTeamPage:", isTeamPage)
  };

  const getTeam = async (user_address) => {
    const agent = new Moralis.Query(team);
    agent.equalTo("user", user_address);
    return await agent.find();
  }

  const handleChangeTeam = async (tokenID) => {
    const user = Moralis.User.current();
    const user_address = user.get("ethAddress");
    const results = await getTeam(user_address);

    // setting up the contract
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(arenaAddress, Arena.abi, signer)

    // quit the arena
    if (results.length && results[0].get("contract") === gameNFTAddress && results[0].get("tokenID") === tokenID) {
      try {
        const data = await contract.quitArena()
        console.log('data: ', data)
        results[0].destroy();
        setMyTeamMember("");
        fetchData();
        return;
      } catch (err) {
        console.log("Error: ", err)
      }
    }
    // change the Team
    console.log(tokenID)
    try {
      const data = await contract.createPlayer(gameNFTAddress, tokenID,
          { value: ethers.utils.parseEther("1") })
      console.log('data: ', data)

      // put in the database
      // a new team
      if (results.length === 0) {
        const myTeam = new team();
        myTeam.set("user", user_address);
        myTeam.set("contract", gameNFTAddress);
        myTeam.set("tokenID", tokenID);
        myTeam.save()
            .then((res) => {
              console.log('Team created!', res.get("user"), res.get("contract"), res.get("tokenID"));
              alert("Successfully created!");
            }, (error) => {
              alert('Failed to create, with error code: ' + error.message);
            });
      }
      // update the team
      else {
        const myTeam = results[0];
        myTeam.set("contract", gameNFTAddress);
        myTeam.set("tokenID", tokenID);
        myTeam.save()
            .then((res) => {
              console.log('Team updated!', res.get("user"), res.get("contract"), res.get("tokenID"));
              setMyTeamMember(res.get("tokenID"));
              fetchData();
              alert("Successfully updated!");
            }, (error) => {
              alert('Failed to update, with error code: ' + error.message);
            });
      }
    } catch (err) {
      console.log("Error: ", err)
    }
  }

  const fetchData = async () => {
    if (isTeamPage) {
      // require login
      console.log(user)
      console.log(isAuthenticated)
      if (!Moralis.User.current()) {
        await Moralis.authenticate();
      }
      else {
        // query my NFTs
        const user = Moralis.User.current();
        const user_address = user.get("ethAddress");
        const query_owner = new Moralis.Query(NFT);
        query_owner.equalTo("owner", user_address);
        const query_publisher = new Moralis.Query(NFT);
        query_publisher.equalTo("publisher", user_address);
        const query_tokenType = new Moralis.Query(NFT);
        query_tokenType.equalTo("tokenType", 0);
        const results = await Moralis.Query.and(query_tokenType, Moralis.Query.or(query_owner, query_publisher)).find();
        const myTeam = await getTeam(user_address);
        if (myTeam.length !== 0) {
          setMyTeamMember(myTeam[0].get("tokenID"));
          console.log(myTeamMember)
        }
        const parsed_results = results.map((item) => (
            {
              ...item.attributes,
              "rawItem": item,
              "inTeam": item.attributes.tokenID === myTeamMember
            }
        ))
        console.log(parsed_results)
        setExploreData(parsed_results);
      }
    }
    else {
      // explore teams
      // fetch all NFTs
      const agent_team = new Moralis.Query(team);
      const teams = await agent_team.find();
      // get ones on the teams
      const agent = new Moralis.Query(NFT);
      agent.containedIn("tokenID", teams.map((item) => [item.attributes.tokenID]));
      const results = await agent.find()
      const parsed_results = results.map((item) => (
          {
            ...item.attributes,
            "rawItem": item,
            "inTeam": item.get("tokenID") === myTeamMember,
          }
      ))
      console.log(parsed_results)
      setExploreData(parsed_results);
    }
  }
  useEffect(() => {
    fetchData();
  }, [isAuthenticated, isTeamPage])

  return (
    <div id="arena">
      <Header />
      <div id="arena-buttons">
        <button id={!isTeamPage ? "arena-selected" : "arena"} onClick={switchArena}>Hall</button>
        <button id={isTeamPage ? "arena-selected" : "arena"} onClick={switchArena}>My Team</button>
      </div>
      <div id="list-container" style={{"marginTop": "90px"}}>
        <CardList list={exploreData} page={"arena-" + isTeamPage} handleChangeTeam={handleChangeTeam}/>
      </div>
    </div>
  );
};

export default GameArena;
