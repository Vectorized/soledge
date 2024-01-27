// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Transient storage get/set helper.
/// @author Soledge (https://github.com/vectorized/soledge/blob/main/src/utils/LibTransient.sol)
library LibTransient {
    /// @dev Returns the value at `tSlot` in transient storage.
    function get(bytes32 tSlot) internal view returns (bytes32 result) {
        /// @solidity memory-safe-assembly
        assembly {
            result := tload(tSlot)
        }
    }

    /// @dev Sets the value at `tSlot` in transient storage to `value`.
    function set(bytes32 tSlot, bytes32 value) internal {
        /// @solidity memory-safe-assembly
        assembly {
            tstore(tSlot, value)
        }
    }
}
