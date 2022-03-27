pragma solidity ^0.8.10;

import "./GameNFT.sol";
import "hardhat/console.sol";

contract ArenaGame{
    uint constant gameFee = 0.005 ether;
    uint constant minPrice = 0.01 ether;

    GameNFT gameNFT;

    enum _ResultType{
        Win,
        Lose
    }

    struct GameInfo{
        address player;
        uint result;
    }

    GameNFT.PlayerInfo t;

    // struct PlayerInfo{
    //     uint attack;
    //     uint speed;
    //     uint armor;
    //     uint healthPower;
    //     uint level;
    // }

    GameInfo[] public GameRecords;

    constructor(GameNFT _gameNFT) public{
        gameNFT = _gameNFT;
    }

    function createGame(uint player1TokenID, uint player2TokenID)
        public view returns (_ResultType, string memory){

        // require(msg.value >= minPrice, "The minimal stake is required");
        // require(gameNFT.ownerOf(player1TokenID) == msg.sender, "This is not your NFT");
//        console.log("");

        GameNFT.PlayerInfo memory player1Info = gameNFT.getProperty(player1TokenID);
        GameNFT.PlayerInfo memory player2Info = gameNFT.getProperty(player2TokenID);

        (_ResultType gameResult, string memory resultLog)  = fight(player1Info, player2Info);

        return (gameResult, resultLog);
    }



    function fight(GameNFT.PlayerInfo memory player1Info, GameNFT.PlayerInfo memory player2Info)
        public view returns (_ResultType, string memory){

        string memory resultLog = "1,2,3,4,5";

        return (_ResultType.Win, resultLog);
    }
}