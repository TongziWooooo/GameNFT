import React, { useState, useEffect, createRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLocation, Navigate } from "react-router";
import Card from "../components/base/Card";
import "../styles/NFTDetail.css";
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
import {marketplaceAddress} from "../App"




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

  const attr = Object.entries(state.item.attributes).map((key, value) => {
        return (
            <li>{key}: {value}</li>
        )
      }
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
      const data = await contract.buyItem(state.item.contract, state.item.tokenID, {value: ethers.utils.parseEther(state.item.price.toString())})
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
        const data = await contract.createMarketItem(state.item.contract, nft.get("tokenID"),
            ethers.utils.parseEther(nft.get("price").toString()),
            {value: ethers.utils.parseEther(Moralis.Units.FromWei(listPrice.toString()))})
        console.log('data: ', data)
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

  return (
    <div>
      <Header />
      <div id="nft-detail-card-wrapper">
        <Card
          width={isMobile ? "100%" : "65vw"}
          height={isMobile ? "700px" : "60vh"}
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
                <div id='detail-info-container' style={{"position": "relative", "height": "80%"}}>
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
                    <div>
                      <TextInput style={{"position": "absolute", "bottom": "60px"}} child={
                        <label className="container" style={{"font-size": "25px"}}>
                          {"Publish your NFT!"}
                          <input type="checkbox" onChange={handleListed} checked={isListed}/>
                          <span className="checkmark"/>
                        </label>
                      }/>
                      <TextInput style={{"position": "absolute", "bottom": "0"}} icon={<FaEthereum style={{"color": "#C6C2C6"}} size="28px"/>} child={
                        <input id="search" style={{"font-size": "25px"}} placeholder={"Name"} onChange={handlePrice} value={price}/>
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
                  :
                  <div>
                    <Button width='100px' height='50px' color={Colors.buttons.secondary} textContent="Submit" onClick={modify}/>
                  </div>
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
