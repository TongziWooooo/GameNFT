import React, { useEffect, useState } from "react";
import CardList from "../components/CardList";
import '../styles/Explore.css';
import Header from "../components/Header";
import Search from "../components/Search";
import Moralis from "moralis";
import {useMoralis} from "react-moralis";


const MyCollection = () => {
  const NFT = Moralis.Object.extend("NFT");

  const [exploreData, setExploreData] = useState([]);
  const { authenticate, isAuthenticated, isAuthenticating, user} = useMoralis();


  useEffect(() => {
    const fetchData = async () => {
      // require login
      let current_user = user
      console.log(current_user)
      console.log(isAuthenticated)
      if (!isAuthenticated) {
        setExploreData([]);
        alert('Please login to see your collection!')
      }
      else {
        const query_owner = new Moralis.Query(NFT);
        query_owner.equalTo("owner", current_user.get("ethAddress"));
        const query_publisher = new Moralis.Query(NFT);
        query_publisher.equalTo("publisher", current_user.get("ethAddress"));
        const results = await Moralis.Query.or(query_owner, query_publisher).find();
        const parsed_results = results.map((item) => (
            {
              ...item.attributes,
              "rawItem": item
            }
        ))
        console.log(parsed_results)
        setExploreData(parsed_results);
      }
    }
    fetchData();
  }, [isAuthenticated])

  return (
    <div id="my-collection">
      <Header />
      {/*<Search/>*/}
      <div id="list-container" style={{"marginTop": "90px"}}>
        <CardList list={exploreData} page={"collection"}/>
      </div>
    </div>
  );
};

export default MyCollection;
