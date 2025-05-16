import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import fs from "fs";
import { type Abi } from "viem";

const token = process.env.VLAYER_TOKEN;

const vlayer = createVlayerClient({
  url: "https://nightly-fake-prover.vlayer.xyz",
  token: token,
});

const proverAbi = [
  {
    type: "function",
    name: "main",
    inputs: [
      {
        name: "unverifiedEmail",
        type: "tuple",
        internalType: "struct UnverifiedEmail",
        components: [
          { name: "email", type: "string", internalType: "string" },
          {
            name: "dnsRecord",
            type: "tuple",
            internalType: "struct DnsRecord",
            components: [
              { name: "name", type: "string", internalType: "string" },
              {
                name: "recordType",
                type: "uint8",
                internalType: "uint8",
              },
              { name: "data", type: "string", internalType: "string" },
              { name: "ttl", type: "uint64", internalType: "uint64" },
            ],
          },
          {
            name: "verificationData",
            type: "tuple",
            internalType: "struct VerificationData",
            components: [
              {
                name: "validUntil",
                type: "uint64",
                internalType: "uint64",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
              { name: "pubKey", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Proof",
        components: [
          {
            name: "seal",
            type: "tuple",
            internalType: "struct Seal",
            components: [
              {
                name: "verifierSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "seal",
                type: "bytes32[8]",
                internalType: "bytes32[8]",
              },
              {
                name: "mode",
                type: "uint8",
                internalType: "enum ProofMode",
              },
            ],
          },
          {
            name: "callGuestId",
            type: "bytes32",
            internalType: "bytes32",
          },
          { name: "length", type: "uint256", internalType: "uint256" },
          {
            name: "callAssumptions",
            type: "tuple",
            internalType: "struct CallAssumptions",
            components: [
              {
                name: "proverContractAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "functionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "settleChainId",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "settleBlockNumber",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "settleBlockHash",
                type: "bytes32",
                internalType: "bytes32",
              },
            ],
          },
        ],
      },
      { name: "emailHash", type: "bytes32", internalType: "bytes32" },
      { name: "targetWallet", type: "address", internalType: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proof",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Proof",
        components: [
          {
            name: "seal",
            type: "tuple",
            internalType: "struct Seal",
            components: [
              {
                name: "verifierSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "seal",
                type: "bytes32[8]",
                internalType: "bytes32[8]",
              },
              {
                name: "mode",
                type: "uint8",
                internalType: "enum ProofMode",
              },
            ],
          },
          {
            name: "callGuestId",
            type: "bytes32",
            internalType: "bytes32",
          },
          { name: "length", type: "uint256", internalType: "uint256" },
          {
            name: "callAssumptions",
            type: "tuple",
            internalType: "struct CallAssumptions",
            components: [
              {
                name: "proverContractAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "functionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "settleChainId",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "settleBlockNumber",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "settleBlockHash",
                type: "bytes32",
                internalType: "bytes32",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "setBlock",
    inputs: [{ name: "blockNo", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setChain",
    inputs: [
      { name: "chainId", type: "uint256", internalType: "uint256" },
      { name: "blockNo", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stringToAddress",
    inputs: [{ name: "str", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "pure",
  },
  { type: "error", name: "FailedInnerCall", inputs: [] },
  { type: "error", name: "InvalidAddressLength", inputs: [] },
  { type: "error", name: "InvalidEmailDomain", inputs: [] },
  { type: "error", name: "InvalidHexCharacter", inputs: [] },
  { type: "error", name: "NoWalletAddressInSubject", inputs: [] },
];

async function main() {
  const email = await fs.readFileSync("testdata/verify_vlayer.eml");

  const hash = await vlayer.prove({
    address: "0x512681307de99eb46a4FedF5DF523f16cfc77E57",
    proverAbi: proverAbi as Abi,
    functionName: "main",
    args: [
      await preverifyEmail({
        mimeEmail: email.toString(),
        dnsResolverUrl: "https://test-dns.vlayer.xyz/dns-query", // Replace with your actual DNS resolver URL
      }),
    ],
    chainId: 11155111,
  });

  console.log("Proof hash:", hash);
}

main().catch(console.error);
