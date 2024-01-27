// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/SoladyTest.sol";
import {LibTransient} from "../src/utils/LibTransient.sol";

contract LibTransientTest is SoladyTest {
    function testTransientSetAndGet(bytes32 s, uint256 i) public {
        unchecked {
            assertEq(LibTransient.get(s), bytes32(0));
            LibTransient.set(s, bytes32(i));
            assertEq(LibTransient.get(s), bytes32(i));
        }
    }
}
