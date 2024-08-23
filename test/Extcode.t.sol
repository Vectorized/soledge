// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/SoladyTest.sol";

contract ExtcodeTest is SoladyTest {
    address internal _extcodecopy;
    address internal _extcodesize;
    address internal _extcodehash;
    address internal _extcode;

    function setUp() public {
        _extcode = address(uint160(uint256(keccak256("extcode"))));
        _extcodecopy = address(uint160(uint256(keccak256("extcodecopy"))));
        _extcodehash = address(uint160(uint256(keccak256("extcodehash"))));
        _extcodesize = address(uint160(uint256(keccak256("extcodesize"))));
        vm.etch(_extcode, hex"383618600e573d353b3d52593df35b6040358038353d3d353c803df300000000");
        vm.etch(_extcodecopy, hex"604035806020353d3d353c3df3");
        vm.etch(_extcodesize, hex"3d353b3d52593df3");
        vm.etch(_extcodehash, hex"3d353f3d52593df3");
    }

    function testExtcodeInitCodes() public {
        bytes memory extcodeInitCode =
            hex"7b383618600e573d353b3d52593df35b6040358038353d3d353c803df33d5260206004f3";
        _testInitCode(extcodeInitCode, _extcode);
        emit LogBytes32("extcodeInitCodeHash", keccak256(extcodeInitCode));

        bytes memory extcodecopyInitCode = hex"6c604035806020353d3d353c3df33d52600d6013f3";
        _testInitCode(extcodecopyInitCode, _extcodecopy);
        emit LogBytes32("extcodecopyInitCodeHash", keccak256(extcodecopyInitCode));

        bytes memory extcodesizeInitCode = hex"673d353b3d52593df33d5260086018f3";
        _testInitCode(extcodesizeInitCode, _extcodesize);
        emit LogBytes32("extcodesizeInitCodeHash", keccak256(extcodesizeInitCode));

        bytes memory extcodehashInitCode = hex"673d353f3d52593df33d5260086018f3";
        _testInitCode(extcodehashInitCode, _extcodehash);
        emit LogBytes32("extcodehashInitCodeHash", keccak256(extcodehashInitCode));
    }

    function _testInitCode(bytes memory initCode, address etched) internal {
        address instance;
        /// @solidity memory-safe-assembly
        assembly {
            instance := create(0, add(0x20, initCode), mload(initCode))
        }
        assertEq(instance.code, etched.code);
    }

    function testExtcodehash() public {
        bytes32 expected;
        /// @solidity memory-safe-assembly
        assembly {
            expected := extcodehash(address())
        }
        (bool success, bytes memory result) = _extcodehash.call(abi.encode(address(this)));
        assertEq(abi.decode(result, (bytes32)), expected);
        assertTrue(success);
    }

    function testExtcodesize() public {
        bytes32 expected;
        /// @solidity memory-safe-assembly
        assembly {
            expected := extcodesize(address())
        }
        (bool success, bytes memory result) = _extcodesize.call(abi.encode(address(this)));
        assertEq(abi.decode(result, (bytes32)), expected);
        assertTrue(success);

        (success, result) = _extcode.call(abi.encode(address(this)));
        assertEq(abi.decode(result, (bytes32)), expected);
        assertTrue(success);
    }

    function testExtcodecopy(uint256 offset, uint256 length) public {
        offset = _bound(offset, 0, 0xff);
        length = _bound(length, 0, 0x1ff);
        (bool success, bytes memory result) =
            _extcodecopy.call(abi.encode(address(this), offset, length));
        bytes memory expected;
        /// @solidity memory-safe-assembly
        assembly {
            expected := mload(0x40)
            mstore(expected, length)
            extcodecopy(address(), add(expected, 0x20), offset, length)
            mstore(0x40, add(add(expected, 0x40), length))
        }
        assertEq(result, expected);
        assertTrue(success);

        (success, result) = _extcode.call(abi.encode(address(this), offset, length));
        assertEq(result, expected);
        assertTrue(success);
    }
}
