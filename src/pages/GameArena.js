import React, {useEffect, useState} from "react";
import CardList from "../components/CardList";
import Header from "../components/Header";
import Moralis from "moralis";
import {useMoralis} from "react-moralis";
import "../styles/Arena.css"
import {arenaAddress, gameNFTAddress} from "../App";
import {ethers} from "ethers";
import Arena from '../artifacts/contracts/Arena.sol/Arena.json'
import {useNavigate} from "react-router-dom";


const GameArena = () => {
  const NFT = Moralis.Object.extend("NFT");
  const team = Moralis.Object.extend("Team");
  const navigate = useNavigate();

  const [isTeamPage, setIsTeamPage] = useState(false);
  const [myTeamMember, setMyTeamMember] = useState("");
  const [exploreData, setExploreData] = useState([]);
  const { authenticate, isAuthenticated, isAuthenticating, user} = useMoralis();

  useEffect(() => {

  }, [myTeamMember])

  const switchArena = (e) => {
    if (e.target.value === "Hall") {
      setIsTeamPage(false)
    }
    else {
      setIsTeamPage(true)
    }
    console.log("isTeamPage:", isTeamPage)
  };


  // Team functions
  const getTeamTokenByUser = async (user_address) => {
    const agent = new Moralis.Query(team);
    agent.equalTo("user", user_address);
    return await agent.find();
  }
  const getTeamUserByToken = async (tokenID) => {
    const agent = new Moralis.Query(team);
    agent.equalTo("tokenID", tokenID);
    return await agent.find();
  }

  // NFT functions
  const getNFTByID = async (tokenID) => {
    const agent = new Moralis.Query(NFT);
    agent.equalTo("tokenID", tokenID);
    return await agent.first();
  }

  const handleFight = async (tokenID) => {
    // require login
    if (!Moralis.User.current()) {
      alert('Please login to fight!')
      return;
    }
    const user = Moralis.User.current();
    const attacker = user.get("ethAddress");
    const userTeam = await getTeamTokenByUser(attacker);
    if (!userTeam.length) {
      alert('You need to setup a team first!')
      return;
    }
    const defender = (await getTeamUserByToken(tokenID))[0].attributes.user;
    const attacker_token = await getNFTByID(userTeam[0].attributes.tokenID);
    const defender_token = await getNFTByID(tokenID);
    const params = {
      attacker: {address: attacker, token: attacker_token.attributes},
      defender: {address: defender, token: defender_token.attributes}
    }
    console.log(params)

    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Start fighting with ${defender_token.attributes.name}?`)) {
      navigate("/game", {state: params})
    }
  }

  const handleChangeTeam = async (tokenID) => {
    const user = Moralis.User.current();
    const user_address = user.get("ethAddress");
    const results = await getTeamTokenByUser(user_address);

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
        await results[0].destroy();
        setMyTeamMember("");
        await fetchData();
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
            .then(async (res) => {
              console.log('Team created!', res.get("user"), res.get("contract"), res.get("tokenID"));
              await fetchData();
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
            .then(async (res) => {
              console.log('Team updated!', res.get("user"), res.get("contract"), res.get("tokenID"));
              setMyTeamMember(res.get("tokenID"));
              await fetchData();
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
        setExploreData([]);
        alert('Please login to manage your team!')
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
        let myTeam;
        const res = await getTeamTokenByUser(user_address);
        if (res.length !== 0) {
          setMyTeamMember(res[0].get("tokenID"));
          myTeam = res[0].get("tokenID");
          console.log(myTeam);
        }
        const parsed_results = results.map((item) => (
            {
              ...item.attributes,
              "rawItem": item,
              "inTeam": item.get("tokenID") === myTeam,
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
      // get my team
      const user = Moralis.User.current();
      let myTeam;
      if (user) {
        const user_address = user.get("ethAddress");
        const res = await getTeamTokenByUser(user_address);
        if (res.length !== 0) {
          setMyTeamMember(res[0].get("tokenID"));
          myTeam = res[0].get("tokenID");
          console.log(myTeam);
        }
      }
      const parsed_results = results.map((item) => (
          {
            ...item.attributes,
            "rawItem": item,
            "inTeam": item.get("tokenID") === myTeam,
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
        <button id={!isTeamPage ? "arena-selected" : "arena"} value={"Hall"} onClick={switchArena}>Hall</button>
        <button id={isTeamPage ? "arena-selected" : "arena"} value={"My Team"} onClick={switchArena}>My Team</button>
      </div>
      <div id="list-container" style={{"marginTop": "90px"}}>
        <CardList list={exploreData} page={"arena-" + isTeamPage} handleChangeTeam={handleChangeTeam} handleFight={handleFight}/>
      </div>
    </div>
  );
};

export default GameArena;
