// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Strings} from "@openzeppelin-contracts-5.0.1/utils/Strings.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";

contract EmailDomainProver is Prover {
    using RegexLib for string;
    using Strings for string;
    using EmailProofLib for UnverifiedEmail;

    error InvalidAddressLength();
    error InvalidHexCharacter();
    error NoWalletAddressInSubject();
    error InvalidEmailDomain();

    function stringToAddress(string memory str) public pure returns (address) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length != 42) {
            revert InvalidAddressLength();
        }
        bytes memory addrBytes = new bytes(20);

        for (uint256 i = 0; i < 20; i++) {
            addrBytes[i] = bytes1(
                hexCharToByte(strBytes[2 + i * 2]) *
                    16 +
                    hexCharToByte(strBytes[3 + i * 2])
            );
        }

        return address(uint160(bytes20(addrBytes)));
    }

    function hexCharToByte(bytes1 char) internal pure returns (uint8) {
        uint8 byteValue = uint8(char);
        if (
            byteValue >= uint8(bytes1("0")) && byteValue <= uint8(bytes1("9"))
        ) {
            return byteValue - uint8(bytes1("0"));
        } else if (
            byteValue >= uint8(bytes1("a")) && byteValue <= uint8(bytes1("f"))
        ) {
            return 10 + byteValue - uint8(bytes1("a"));
        } else if (
            byteValue >= uint8(bytes1("A")) && byteValue <= uint8(bytes1("F"))
        ) {
            return 10 + byteValue - uint8(bytes1("A"));
        }
        revert InvalidHexCharacter();
    }

    function main(
        UnverifiedEmail calldata unverifiedEmail
    )
        public
        view
        returns (Proof memory, bytes32 emailHash, address targetWallet)
    {
        VerifiedEmail memory email = unverifiedEmail.verify();
        string[] memory subjectCapture = email.subject.capture(
            "^This is my wallet at address: (0x[a-fA-F0-9]{40})$"
        );
        if (subjectCapture.length <= 0) {
            revert NoWalletAddressInSubject();
        }

        targetWallet = stringToAddress(subjectCapture[1]);

        // @TODO: we can also return the domain in captures to Verifier contract
        // optional checks
        string[] memory captures = email.from.capture(
            "^[\\w.-]+@([a-zA-Z\\d.-]+\\.[a-zA-Z]{2,})$"
        );
        if (captures.length != 2) {
            revert InvalidEmailDomain();
        }
        if (bytes(captures[1]).length <= 0) {
            revert InvalidEmailDomain();
        }

        return (proof(), sha256(abi.encodePacked(email.from)), targetWallet);
    }
}
