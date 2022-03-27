pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./GameNFT.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _itemID;
    Counters.Counter private _itemSold;

    // Solidity classify payable or not in 0.5,
    // address payable could use .transfer() and .send()
    address payable owner;
    uint shelfPrice = 0.01 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemID;
        address NFTContract;
        uint tokenID;
        address payable seller;
        address payable owner;
        uint price;
        bool isSold;
    }

    mapping(uint => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        // at most 3 indexed identifier could be used
        // in order to be searched or filtered;
        uint indexed itemID,
        address indexed nftContract,
        uint256 indexed tokenID,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListPrice() public view returns (uint) {
        return shelfPrice;
    }

    // nonReentrant Prevents a contract from calling itself, directly or indirectly.
    function createMarketItem(address nftContract, uint tokenID,
        uint price) public payable nonReentrant {
        require(price > 0, "The price should be > 0");
        // require(msg.value == shelfPrice, "Value must equal to shelfPrice");

        _itemID.increment();
        uint itemID = _itemID.current();

        // Store the market item on the Chain first.
        idToMarketItem[itemID] =  MarketItem(
            itemID,
            nftContract,
            tokenID,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        // Convert to ERC721 and then transfer from sender to server.

        GameNFT(nftContract).transferItem(msg.sender, address(this), tokenID);
        // ERC721(nftContract).transferFrom(msg.sender, address(this), tokenID);

        emit MarketItemCreated(
            itemID,
            nftContract,
            tokenID,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    //
    function buyItem(address nftContract, uint itemID) public payable nonReentrant{
        uint price = idToMarketItem[itemID].price;
        uint tokenID = idToMarketItem[itemID].tokenID;
        // require(msg.value == price, "Please pay the asking price");

        // Transfer Item to msg.sender
        GameNFT(nftContract).transferItem(address(this), msg.sender, tokenID);
        // Transfer money to seller
        idToMarketItem[itemID].seller.transfer(msg.value);

        MarketItem storage tmp = idToMarketItem[itemID];

        tmp.owner = payable(msg.sender);
        tmp.isSold = true;
        _itemSold.increment();
    }

    function fetchUnsoldItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemID.current();
        uint unsoldItemCount = _itemID.current() - _itemSold.current();
        uint curIndex = 0;

        MarketItem[] memory itemList = new MarketItem[](unsoldItemCount);
        for (uint i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == address(0)) {
                // Stored on the Chain
                MarketItem storage curItem = idToMarketItem[i];
                itemList[curIndex] = curItem;
                curIndex += 1;
            }
        }
        return itemList;
    }

    function fetchUserNFT() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemID.current();
        uint itemNum = 0;
        uint curIndex = 0;

        for(uint i = 1; i <= totalItemCount; i++){
            if(idToMarketItem[i].owner == msg.sender){
                itemNum += 1;
            }
        }

        MarketItem[] memory itemList = new MarketItem[](itemNum);

        for(uint i = 1; i <= totalItemCount; i++){
            if(idToMarketItem[i].owner == msg.sender){
                MarketItem storage curItem = idToMarketItem[i];
                itemList[curIndex] = curItem;
                curIndex += 1;
            }
        }
        return itemList;
    }

}