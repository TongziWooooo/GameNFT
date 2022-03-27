import react from "react";
import React, { useEffect, useState, useRef } from "react";
import CardList from "../components/CardList";
import {exploreList, hotDropsData} from "../constants/MockupData";
import '../styles/Explore.css';
import Header from "../components/Header";
import Search from "../components/Search";
import Moralis from "moralis";


const Explore = () => {

  const parsedResults = useRef([]);
  const [exploreData, setExploreData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const NFT = Moralis.Object.extend("NFT");
      const agent = new Moralis.Query(NFT);
      const results = await agent.find();
      parsedResults.current = results.map((item) => (
        item.attributes
      ))
      console.log(parsedResults.current)
      setExploreData(parsedResults.current);
    }
    fetchData();
  }, [])

  const [query, setQuery] = useState("");
  useEffect(() => {
    console.log(query)
  }, [query])
  const handleQuery = (e) => {
    setQuery(e.target.value);
  }

  const handleClick = () => {
    setExploreData(parsedResults.current.filter(item => (
      item.name.toLowerCase().includes(query.toLowerCase())
    )))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter")
      handleClick();
  }


  return (
    <div id="explore">
      <Header />
      <Search handleQuery={handleQuery} handleClick={handleClick} handleKeyDown={handleKeyDown}/>
      <div id="list-container" style={{"margin-top": "90px"}}>
        <CardList list={exploreData} page={"explore"}/>
      </div>
    </div>
  );
};

export default Explore;
