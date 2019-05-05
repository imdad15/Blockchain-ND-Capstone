pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";
import "./Verifier.sol";

contract SolnSquareVerifier is ERC721Metadata, Verifier {

    struct Solution {
        bytes32 hash;
        address submitterAddress;
        bool hasToken;
    }

    Solution[] solutions;

    mapping (address => Solution) addressToSolution;

    mapping (bytes32 => Solution) uniqueSolutions;

    event SolutionAdded(bytes32 proofHash, address submitterAddress);

    constructor(string memory name, string memory symbol) ERC721Metadata(name, symbol, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/") public {}

    function addSolution
    (
        uint[2] memory a,
        uint[2] memory a_p,
        uint[2][2] memory b,
        uint[2] memory b_p,
        uint[2] memory c,
        uint[2] memory c_p,
        uint[2] memory h,
        uint[2] memory k,
        uint[2] memory input
    )
    public
    {
        bytes32 proofHash = createProofHash(a, a_p, b, b_p, c, c_p, h, k, input);
        require(uniqueSolutions[proofHash].submitterAddress == address(0), "Solution exists already");

        bool isValid = verifyTx(a, a_p, b, b_p, c, c_p, h, k, input);
        require(isValid == true, "Solution is not valid");

        Solution memory solution =  Solution({
        hash: createProofHash(a, a_p, b, b_p, c, c_p, h, k, input), submitterAddress: msg.sender, hasToken: false});
        solutions.push(solution);
        addressToSolution[msg.sender] = solution;
        uniqueSolutions[solution.hash] = solution;

        emit SolutionAdded(proofHash, msg.sender);
    }

    function mint(address to, uint tokenId)
    public
    {
        Solution memory solution = addressToSolution[to];
        require(solution.hash > 0, "Solution does not exist");
        require(solution.hasToken == false, "Solution had been used for token minting already");
        _mint(to, tokenId);
        addressToSolution[to].hasToken = true;
        setTokenURI(tokenId);
    }


    function createProofHash(uint[2] memory a, uint[2] memory a_p, uint[2][2] memory b, uint[2] memory b_p, uint[2] memory c, uint[2] memory c_p, uint[2] memory h, uint[2] memory k, uint[2] memory input)
    internal
    pure
    returns (bytes32)
    {
        bytes32 keyBytes = keccak256(abi.encodePacked(a, a_p, b, b_p, c, c_p, h, k, input));
        return keyBytes;
    }
}


//contract Verifier {
//    function verifyTx(uint[2] memory a, uint[2] memory a_p, uint[2][2] memory b, uint[2] memory b_p, uint[2] memory c, uint[2] memory c_p, uint[2] memory h, uint[2] memory k, uint[2] memory input) public returns (bool r);
//}

// TODO [+] define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>

// TODO [+] define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class

// TODO [+] define a solutions struct that can hold an index & an address

// TODO [+] define an array of the above struct

// TODO [+] define a mapping to store unique solutions submitted

// TODO [+] Create an event to emit when a solution is added

// TODO Create a function to add the solutions to the array and emit the event

// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly