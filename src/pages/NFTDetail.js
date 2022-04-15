import React, { useState, useEffect, createRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLocation, Navigate } from "react-router";
import Card from "../components/base/Card";
import "../styles/NFTDetail.css";
import "../styles/utils.css"
import { ColorExtractor } from "react-color-extractor";
import Button from "../components/base/Button";
import { FaEthereum } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useMobile } from "../hooks/isMobile";
import { hotDropsData } from "../constants/MockupData";
import NFTCard from "../components/NFTCard";
import { useARStatus } from "../hooks/isARStatus";
import TextInput from "../components/base/TextInput";
import Checkbox from "../components/base/Checkbox";
import {Colors} from "../constants/Colors";

import Moralis from "moralis";
import {ethers} from "ethers";
import Marketplace from "../artifacts/contracts/Marketplace.sol/Marketplace.json";
import {useMoralis} from "react-moralis";
import {arenaAddress, gameNFTAddress, marketplaceAddress} from "../App"
import Arena from "../artifacts/contracts/Arena.sol/Arena.json";




const NFTDetail = () => {
  const isMobile = useMobile();

  const [colors, setColors] = useState([]);

  const [isLike, setIsLike] = useState(false);

  const like = () => setIsLike(!isLike);

  const getColors = (colors) => {
    setColors((c) => [...c, ...colors]);
  };

  const navigate = useNavigate();

  const { state } = useLocation();

  const [inTeam, setInTeam] = useState(state.item.inTeam);

  useEffect(() => {
  }, [inTeam]);

  useEffect(() => {
    setColors([]);
  }, [state]);

  const isARSupport = useARStatus(state.item.img);

  const [price, setPrice] = useState(state.item.price);
  useEffect(() => {
    console.log("price: ", price);
  }, [price])
  const handlePrice = (e) => {
    setPrice(e.target.value);
  }

  const [isListed, setIsListed] = useState(state.item.isListed);
  useEffect(() => {
    console.log("isListed: ", isListed);
  }, [isListed])
  const handleListed = () => {
    setIsListed(!isListed);
  }

  const attr = Object.keys(state.item.attributes).map(key =>
      <span className="game-prop-line" key={key}>{key}: {state.item.attributes[key]}</span>
  )


  const buy = async () => {
    if (!Moralis.User.current()) {
      await Moralis.authenticate();
    }
    const user = Moralis.User.current();
    const user_address = user.get("ethAddress");
    if (user_address === state.item.owner) {
      alert("You can't buy your owned item!")
      return
    }
    if (!state.item.isListed) {
      alert("You can't buy an unlisted item!")
      return
    }
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer)
    try {
      const data = await contract.buyItem(state.item.contract, state.item.itemID, {value: ethers.utils.parseEther(state.item.price.toString())})
      console.log('data: ', data)

      const NFT = Moralis.Object.extend("NFT");
      const query = new Moralis.Query(NFT);
      console.log(state.item);
      const nft = await query.get(state.item.rawItem.id)
      nft.set("owner", user.get("ethAddress"));
      nft.set("isListed", false);
      nft.save().then((updated) => {
        console.log("Successfully bought!");
        console.log(nft.attributes);
      }, (error) => {
        console.log(error)
      });
    } catch (err) {
      console.log("Error: ", err)
    }
  }

  const modify = async () => {
    // field check
    if (!price) {
      alert("Please set the price!")
      return
    }
    const _team = await getTeamUserByToken(state.item.tokenID)
    if (_team.length) {
      alert("You can't modify an item when it's in your team!")
      return
    }
    // fetch item from database
    const NFT = Moralis.Object.extend("NFT");
    const query = new Moralis.Query(NFT);
    const nft = await query.get(state.item.rawItem.id)
    console.log(nft)
    // update
    nft.set("isListed", isListed);
    nft.set("price", price);
    // list the item
    if ((isListed && !state.item.isListed) || (state.item.isListed && price != state.item.price)) {
      if (state.item.isListed && price != state.item.price) // to update listed item price, first buy it from market then relist it {
        await buy();
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer)
      try {
        const listPrice = await contract.getListPrice();
        console.log(state.item.contract)
        console.log(nft.get("tokenID"))
        console.log(listPrice)
        console.log(ethers.utils.parseEther(Moralis.Units.FromWei(listPrice.toString())))
        console.log(nft.get("price"))
        console.log(ethers.utils.parseEther(nft.get("price").toString()))
        const transaction = await contract.createMarketItem(state.item.contract, nft.get("tokenID"),
            ethers.utils.parseEther(nft.get("price").toString()),
            {value: ethers.utils.parseEther(Moralis.Units.FromWei(listPrice.toString()))})
        const rc = await transaction.wait()
        const event = rc.events.find(event => event.event === "MarketItemCreated")
        const q = event.args[0]
        console.log("args", event.args)
        console.log(transaction)
        const itemID = parseInt(q._hex, 16);
        nft.set("itemID", itemID)
        nft.set("publisher", state.item.owner)  // publisher should be himself
        nft.set("owner", marketplaceAddress); // transfer it to the market!
      } catch (err) {
        console.log("Error: ", err)
        return
      }
    }
    // unlist the item -> buy it!
    else if ((!isListed && state.item.isListed)) {
      await buy();
    }
    // else keep unlisted, only update the price
    nft.save().then((updated) => {
      console.log("Successfully updated.");
      console.log(nft);
      console.log("isListed:", state.item.isListed, "->", updated.get("isListed"));
      console.log("isSold:", state.item.isSold, "->", updated.get("isSold"));
      console.log("price:", state.item.price, "->", updated.get("price"));
    }, (error) => {
      console.log(error)
    });
  }


  const NFT = Moralis.Object.extend("NFT");
  const team = Moralis.Object.extend("Team");
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
        setInTeam(false);
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
              alert("Successfully created!");
              setInTeam(true);
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
              alert("Successfully updated!");
              setInTeam(true);
            }, (error) => {
              alert('Failed to update, with error code: ' + error.message);
            });
      }
    } catch (err) {
      console.log("Error: ", err)
    }
  }

  return (
    <div>
      <Header />
      <div id="nft-detail-card-wrapper">
        <Card
          width={isMobile ? "100%" : "65vw"}
          height={isMobile ? "100%" : "70vh"}
          blurColor={colors[0]}
          child={
            //Detail Content
            <div id="detail-content">
              {isARSupport ?
                <model-viewer ar-scale="auto" ar ar-modes="webxr scene-viewer quick-look" id="arDetail" loading="eager" camera-controls auto-rotate src={state.item.img} > </model-viewer>
                :
                <> <ColorExtractor getColors={getColors}>
                  <img id="detail-image" src={state.item.img} />
                </ColorExtractor></>
              }

              <div id="detail-info" style={{}}>
                <div id='detail-info-container' style={{"position": "relative", "height": "87%"}}>
                  <p id="name"> {state.item.name} </p>
                  <p id="collection"> {state.item.tokenType === 1 ? "Artwork" : "Game Prop"} </p>
                  <p id="description" > {state.item.description} </p>
                  {
                    state.item.tokenType === 1 ? null :
                        <div id="game-prop-attr">
                          <p id="game-prop-title"> Prop attributes: </p>
                          {attr} </div>
                  }

                  {state.page === "collection" ?
                    <div className="box-wrapper">
                      <TextInput style={{marginBottom: "10px", "width": "80%"}} child={
                        <label className="container" style={{"fontSize": "25px"}}>
                          {"Publish your NFT!"}
                          <input type="checkbox" onChange={handleListed} checked={isListed}/>
                          <span className="checkmark"/>
                        </label>
                      }/>
                      <TextInput style={{"width": "80%"}} icon={<FaEthereum style={{"color": "#C6C2C6"}} size="28px"/>} child={
                        <input id="search" style={{"fontSize": "25px"}} placeholder={"Name"} onChange={handlePrice} value={price}/>
                      }/>

                    </div>
                    :
                    null
                  }

                </div>

                {state.page === "explore" ?
                  <div id="detail-controls" className="like-container" style={{"height": "20%"}}>
                    <Button
                      width={isMobile ? "70%" : "130px"}
                      height="50px"
                      child={
                        <div id="button-child">
                          <FaEthereum size="28px"/>
                          <p id="price" style={{"padding": "10px"}}> {state.item.price} </p>
                          <p id="label">Buy</p>
                        </div>
                      }
                      onClick={buy}
                    />
                    <div className="like-container">
                      <button className="like" onClick={like}>
                        {!isLike ? (
                          <AiOutlineHeart size="45" color="white"/>
                        ) : (
                          <AiFillHeart
                            size="45"
                            style={{
                              stroke: `-webkit-linear-gradient(
                                      to bottom,
                                      #38ef7d,
                                      #11998e
                                    );`,
                            }}
                            color="#00f5c966"
                          />
                        )}
                      </button>
                      <p className="like-count">{state.item.like}</p>
                    </div>
                  </div>
                  : state.page === "collection" ?
                  <div style={{marginBottom: "10px"}}>
                    <Button width='100px' height='50px' color={Colors.buttons.secondary} textContent="Submit" onClick={modify}/>
                  </div>
                        : state.page === "arena-true" ? <Button color={inTeam ? "yellow" :Colors.buttons.secondary}
                                                          textContent={inTeam ? "Quit" : "Set in Team"}
                                                          onClick={() => handleChangeTeam(state.item.tokenID)} /> :
                            state.page === "arena-false" ? <Button color={inTeam ? "yellow" :Colors.buttons.danger}
                                                             textContent={inTeam ? "Quit" : "Fight"}
                                                             onClick={inTeam? () => handleChangeTeam(state.item.tokenID) : () => handleFight(state.item.tokenID)} /> : null
                }
              </div>
            </div>
          }
        />
        
      </div>

    </div>
  );
};

export default NFTDetail;
