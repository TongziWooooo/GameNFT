pragma solidity ^0.8.10;

import "./GameNFT.sol";
import "hardhat/console.sol";

contract ArenaGame{
    using Counters for Counters.Counter;
    Counters.Counter private _gameNum;

    uint constant gameFee = 0.005 ether;
    uint constant minPrice = 0.01 ether;
    uint constant modNum = 2**16;

    GameNFT gameNFT;

    enum _ResultType{
        Win,
        Lose,
        TBD
    }

    struct GameInfo{
        uint gameIndex;
        address atkPlayer;
        address defPlayer;
        HeroInfo atkHeroInfo;
        HeroInfo defHeroInfo;
        uint seed;
        _ResultType result;
    }

    event GameCreated(
        uint gameIndex,
        address atkPlayer,
        address defPlayer,
        HeroInfo atkHeroInfo,
        HeroInfo defHeroInfo,
        uint seed
    );

    GameNFT.PlayerInfo t;

    struct HeroInfo{
        uint tokenID;
        string name;
        uint attack;
        uint armor;
        uint speed;
        uint luck;
        uint hp;
    }

    mapping (uint => GameInfo) public GameRecords;

    constructor(GameNFT _gameNFT) public{
        gameNFT = _gameNFT;
    }

    function test(HeroInfo memory heroInfo) public view returns(HeroInfo memory){
        console.log(heroInfo.tokenID);
        console.log(heroInfo.name);
        console.log(heroInfo.attack);
        console.log(heroInfo.armor);
        console.log(heroInfo.speed);
        console.log(heroInfo.luck);
        console.log(heroInfo.hp);
        return heroInfo;
    }

    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randomNum % _mod;
    }

    function createGame(address atkPlayer, address defPlayer, HeroInfo memory atkHeroInfo,
        HeroInfo memory defHeroInfo) public{

        _gameNum.increment();
        uint gameIndex = _gameNum.current();
        uint seed = _createRandomNum(modNum);

        GameRecords[gameIndex] = GameInfo(
            gameIndex,
            atkPlayer,
            defPlayer,
            atkHeroInfo,
            defHeroInfo,
            seed,
            _ResultType.TBD
        );

        emit GameCreated(
            gameIndex,
            atkPlayer,
            defPlayer,
            atkHeroInfo,
            defHeroInfo,
            seed
        );

    }

    function updateGameResult(uint gameIndex, _ResultType result) public{
        GameInfo storage gameInfo = GameRecords[gameIndex];
        gameInfo.result = result;
    }

    function fetchGameRecords() public view returns(GameInfo[] memory){
        uint recordCount = _gameNum.current();

        GameInfo[] memory itemList = new GameInfo[] (recordCount);
        for (uint curIndex = 0; curIndex < recordCount; curIndex++) {
            itemList[curIndex] = GameRecords[curIndex + 1];
        }
        return itemList;
    }

    // function createGame(address player1, address player2)
    //     public view returns(_ResultType, string[] memory){

    //     HeroInfo memory hero1Info = HeroInfo(10, 10, 10, 10, 50);
    //     HeroInfo memory hero2Info = HeroInfo(12, 8, 5, 20, 50);

    //     (_ResultType gameResult, string[] memory resultLog)  = fight(hero1Info, hero2Info);

    //     return (gameResult, resultLog);
    // }



    // function fight(HeroInfo memory hero1Info, HeroInfo memory hero2Info)
    //     public view returns (_ResultType, string[] memory){

    //     string[] memory resultLog = new string[](10);

    //     return (_ResultType.Win, resultLog);
    // }



    // function createGameBP(uint player1TokenID, uint player2TokenID)
    //     public view returns (_ResultType, string memory){

    //     // require(msg.value >= minPrice, "The minimal stake is required");
    //     // require(gameNFT.ownerOf(player1TokenID) == msg.sender, "This is not your NFT");

    //     GameNFT.PlayerInfo memory player1Info = gameNFT.getProperty(player1TokenID);
    //     GameNFT.PlayerInfo memory player2Info = gameNFT.getProperty(player2TokenID);

    //     (_ResultType gameResult, string memory resultLog)  = fightBP(player1Info, player2Info);


    //     return (gameResult, resultLog);
    // }



    // function fightBP(GameNFT.PlayerInfo memory player1Info, GameNFT.PlayerInfo memory player2Info)
    //     public view returns (_ResultType, string memory){

    //     string memory resultLog = "1,2,3,4,5";


    //     return (_ResultType.Win, resultLog);
    // }

}