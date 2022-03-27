import react from "react";
import React, { useEffect, useState } from "react";
import CardList from "../components/CardList";
import {exploreList, hotDropsData} from "../constants/MockupData";
import '../styles/Explore.css';
import Header from "../components/Header";
import Search from "../components/Search";
import Moralis from "moralis";


const Explore = () => {
  const NFT = Moralis.Object.extend("NFT");
  const agent = new Moralis.Query(NFT);

  const [exploreData, setExploreData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {

      const results = await agent.find();
      const parsed_results = results.map((item) => (
        item.attributes
      ))
      console.log(parsed_results)
      setExploreData(parsed_results);
    }
    fetchData();
  }, [])

  return (
    <div id="explore">
      <Header />
      <Search/>
      <div id="list-container" style={{"margin-top": "90px"}}>
        <CardList list={exploreData} />
      </div>
    </div>
  );
};

export default Explore;
