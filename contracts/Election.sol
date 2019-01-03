pragma solidity ^0.4.23;
contract election {
    // �ṹ��
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // �¼�
    event votedEvent(uint indexed_candidateId);
    // �洢�ṹ��
    mapping(uint => Candidate) public candidates;
    // �Ƿ��Ѿ�ͶƱ��
    mapping(address => bool) public voters;
    // ������
    uint public candidateCount;
    // ���캯��
    constructor() public {
        addCandidate("Jack");
        addCandidate("Mary");
    }
    // ��Ӻ�ѡ��
    function addCandidate(string _name) private {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }
    // ͶƱ
    function vote(uint _candidateId) public {
        // ����
        require(!voters[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidateCount);
        // ��¼�û��Ѿ�ͶƱ��
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit votedEvent(_candidateId);
    }
}