pragma solidity ^0.4.23;
contract election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    event votedEvent(uint indexed_candidateId);
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    uint public candidateCount;
    constructor() public {
        addCandidate("Jack");
		addCandidate("Mary");
    }
    function addCandidate(string _name) private {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }
    function vote(uint _candidateId) public {
        require(!voters[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidateCount);
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit votedEvent(_candidateId);
    }
}