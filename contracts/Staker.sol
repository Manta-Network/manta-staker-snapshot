// contracts/Staker.sol
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Staker is Initializable {
    // An address type variable is used to store ethereum accounts.
    address public admin;
    mapping(address => bool) public isHandler;

    // atlantic address => pacific address
    mapping(string => address) atlanticAddressToPacificAddress;

    // atlantic address => account nonce
    mapping(string => uint32) atlanticAddressNonce;

    bytes32 private constant DOMAIN_SEPARATOR_TYPEHASH =
        0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218;

    // bind event
    event BindPacificAddress(
        string atlanticAddress,
        address indexed pacificAddress
    );

    modifier onlyAdmin() {
        require(admin == msg.sender, "Staker: Only Admin");
        _;
    }

    modifier onlyHandler() {
        require(isHandler[msg.sender], "Staker: forbidden");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        admin = msg.sender;
        isHandler[msg.sender] = true;
    }

    /**
     * @dev Set Admin
     */
    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Staker: invalid new admin");
        admin = _newAdmin;
    }

    /**
     * @dev Set handler
     */
    function setHandler(address _handler, bool _isActive) public onlyAdmin {
        require(_handler != address(0), "Staker: invalid handler");
        isHandler[_handler] = _isActive;
    }

    // bind pacific address to atlantic address
    function bindPacificAddress(
        string memory atlanticAddress,
        address pacificAddress,
        uint32 nonce,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        require(
            bytes(atlanticAddress).length > 0,
            "Staker: The atlantic address is empty"
        );

        address signer = _recoverSigner(
            atlanticAddress,
            pacificAddress,
            nonce,
            _v,
            _r,
            _s
        );
        // Make sure the signature is signed by the handler
        require(
            isHandler[signer],
            "Staker: Only handler can sign the signature"
        );

        require(
            nonce > atlanticAddressNonce[atlanticAddress],
            "Staker: The nonce is expired"
        );

        atlanticAddressToPacificAddress[atlanticAddress] = pacificAddress;
        atlanticAddressNonce[atlanticAddress] = nonce;

        emit BindPacificAddress(atlanticAddress, pacificAddress);
    }

    /**
     * @dev Recover signer
     */
    function _recoverSigner(
        string memory atlanticAddress,
        address pacificAddress,
        uint nonce,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) private view returns (address) {
        // Concat the message
        bytes memory dataContent = abi.encode(
            atlanticAddress,
            pacificAddress,
            nonce
        );

        bytes32 dataHash = keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator(),
                keccak256(dataContent)
            )
        );

        return
            ecrecover(
                keccak256(
                    abi.encodePacked(
                        "\x19Ethereum Signed Message:\n32",
                        dataHash
                    )
                ),
                _v,
                _r,
                _s
            );
    }

    /**
     * @dev Returns the domain separator for this contract, as defined in the EIP-712 standard.
     * @return bytes32 The domain separator hash.
     */
    function domainSeparator() public view returns (bytes32) {
        uint256 chainId;
        /* solhint-disable no-inline-assembly */
        /// @solidity memory-safe-assembly
        assembly {
            chainId := chainid()
        }

        /* solhint-enable no-inline-assembly */

        return keccak256(abi.encode(DOMAIN_SEPARATOR_TYPEHASH, chainId, this));
    }

    // query bound relations by atlantic address
    function getRecordByAtlanticAddress(
        string memory atlanticAddress
    ) public view returns (address) {
        return atlanticAddressToPacificAddress[atlanticAddress];
    }

    // query account nonceby atlantic address
    function getNonceByAtlanticAddress(
        string memory atlanticAddress
    ) public view returns (uint32) {
        return atlanticAddressNonce[atlanticAddress];
    }
}
