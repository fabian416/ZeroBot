// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {NFT} from "../src/NFT.sol";

contract CounterTest is Test {
    NFT public nft;

    function setUp() public {
        nft = new NFT(msg.sender);
    }
}
