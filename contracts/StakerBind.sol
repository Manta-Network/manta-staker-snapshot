// contracts/Staker.sol
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract StakerBind {
    // An address type variable is used to store ethereum accounts.
    address public owner;

    struct AtlanticAddress {
        string atlanticAddress;
    }

    // pacific address => [atlantic address]
    mapping(address => AtlanticAddress[]) pacificAddressToAtlanticAddress;

    // atlantic address => pacific address
    mapping(string => address) atlanticAddressToPacificAddress;

    // bind event
    event BindPacificAddress(
        address indexed pacificAddress,
        string indexedAtlanticAddress
    );

    // unbind event
    event UnbindPacificAddress(
        address indexed pacificAddress,
        string indexedAtlanticAddress
    );

    constructor() {
        owner = msg.sender;
    }

    // bind pacific address to atlantic address
    function bindAtlanticAddress(string memory newAtlanticAddress) external {
        require(
            bytes(newAtlanticAddress).length > 0,
            "The atlantic address is empty"
        );

        address pacificAddress = msg.sender;
        AtlanticAddress[]
            memory currentAtlanticAddress = pacificAddressToAtlanticAddress[
                pacificAddress
            ];
        if (currentAtlanticAddress.length > 0) {
            // The Pacific address is already bound to atlantic address
            bool isAtlanticAddressExists = false;
            for (uint i = 0; i < currentAtlanticAddress.length; i++) {
                // compare atlanticAddress is exits or not
                if (
                    keccak256(
                        abi.encodePacked(
                            currentAtlanticAddress[i].atlanticAddress
                        )
                    ) == keccak256(abi.encodePacked(newAtlanticAddress))
                ) {
                    isAtlanticAddressExists = true;
                    break;
                }
            }

            // bind not exists atlantic address
            if (!isAtlanticAddressExists) {
                _bindNewAtlanticAddress(pacificAddress, newAtlanticAddress);
            }
        } else {
            // The Pacific address is not bound to any address
            _bindNewAtlanticAddress(pacificAddress, newAtlanticAddress);
        }
    }

    // bind new atlantic address
    function _bindNewAtlanticAddress(
        address pacificAddress,
        string memory atlanticAddress
    ) internal {
        // add new bind record
        pacificAddressToAtlanticAddress[pacificAddress].push(
            AtlanticAddress(atlanticAddress)
        );
        atlanticAddressToPacificAddress[atlanticAddress] = pacificAddress;
        emit BindPacificAddress(pacificAddress, atlanticAddress);
    }

    //unbind atalantic address
    function unbindAtlanticAddress(string memory newAtlanticAddress) external {
        require(
            bytes(newAtlanticAddress).length > 0,
            "The atlantic address is empty"
        );

        address pacificAddress = msg.sender;
        require(
            pacificAddressToAtlanticAddress[pacificAddress].length > 0,
            "The sender is not bound to any atlantic address"
        );

        // remove record by pacific address
        AtlanticAddress[]
            memory currentAtlanticAddress = pacificAddressToAtlanticAddress[
                pacificAddress
            ];
        uint addressLength = currentAtlanticAddress.length;
        for (uint i = 0; i < currentAtlanticAddress.length; i++) {
            // compare atlanticAddress is exits or not
            if (
                keccak256(
                    abi.encodePacked(currentAtlanticAddress[i].atlanticAddress)
                ) == keccak256(abi.encodePacked(newAtlanticAddress))
            ) {
                // switch it with the last element of an array
                // remove last element
                pacificAddressToAtlanticAddress[pacificAddress][
                    i
                ] = pacificAddressToAtlanticAddress[pacificAddress][
                    addressLength - 1
                ];
                pacificAddressToAtlanticAddress[pacificAddress].pop();
                break;
            }
        }

        // remove record by atlantic address
        delete atlanticAddressToPacificAddress[newAtlanticAddress];

        emit UnbindPacificAddress(pacificAddress, newAtlanticAddress);
    }

    // query bound relations by pacific address
    function getRecordByPacificAddress(
        address pacificAddress
    ) external view returns (AtlanticAddress[] memory) {
        return pacificAddressToAtlanticAddress[pacificAddress];
    }

    // query bound relations by atlantic address
    function getRecordByAtlanticAddress(
        string memory atlanticAddress
    ) external view returns (address) {
        return atlanticAddressToPacificAddress[atlanticAddress];
    }
}
