// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/SoladyTest.sol";
import {LibT} from "../src/utils/LibT.sol";

contract LibTTest is SoladyTest {
    function testLibT(bytes32 s, uint256 i) public {
        unchecked {
            assertEq(LibT.get(s), bytes32(0));
            LibT.set(s, bytes32(i));
            assertEq(LibT.get(s), bytes32(i));
            LibT.clear(s);
            assertEq(LibT.get(s), bytes32(0));
        }
    }
}
