// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {EmailDomainProver} from "src/EmailDomainProver.sol";
import {EmailDomainVerifier} from "src/EmailProofVerifier.sol";

contract DeployAll is Script {
    function deployProver() public returns (address proverAddress) {
        vm.startBroadcast();
        proverAddress = address(new EmailDomainProver());
        console.log("Prover deployed at: ", proverAddress);
        vm.stopBroadcast();
    }

    function run() external {
        address proverAddress = deployProver();
        vm.startBroadcast();
        address verifierAddress = address(
            new EmailDomainVerifier(proverAddress)
        );
        console.log("Verifier deployed at: ", verifierAddress);
        vm.stopBroadcast();
    }
}
