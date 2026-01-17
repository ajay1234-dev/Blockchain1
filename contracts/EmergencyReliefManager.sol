// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EmergencyReliefManager is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

    IERC20 public reliefToken;

    struct DisasterEvent {
        uint256 id;
        string name;
        string description;
        uint256 totalFunds;
        uint256 allocatedFunds;
        bool active;
        address createdBy;
        uint256 createdAt;
    }

    struct Beneficiary {
        uint256 id;
        address walletAddress;
        uint256 eventId;
        bool approved;
        uint256 allocatedAmount;
        uint256 receivedAmount;
        bool active;
    }

    struct Allocation {
        uint256 id;
        uint256 eventId;
        address beneficiaryAddress;
        uint256 amount;
        bool released;
        uint256 createdAt;
    }

    mapping(uint256 => DisasterEvent) public disasterEvents;
    mapping(uint256 => Beneficiary) public beneficiaries;
    // Removed vendor mapping
    mapping(uint256 => Allocation) public allocations;
    mapping(address => uint256[]) public beneficiaryIdsByAddress;
    // Removed vendorIdsByAddress mapping
    mapping(uint256 => uint256[]) public allocationsByEvent;

    uint256 public disasterEventCount;
    uint256 public beneficiaryCount;
    // Removed vendorCount
    uint256 public allocationCount;

    event DisasterEventCreated(uint256 indexed eventId, string name, address indexed createdBy);
    event BeneficiaryAdded(uint256 indexed beneficiaryId, address indexed walletAddress, uint256 indexed eventId);
    // Removed VendorAdded event

    event FundsAllocated(uint256 indexed allocationId, uint256 indexed eventId, address indexed beneficiaryAddress, uint256 amount);
    event FundsReleased(uint256 indexed allocationId, address indexed beneficiaryAddress, uint256 amount);

    constructor(address _reliefTokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        reliefToken = IERC20(_reliefTokenAddress);
    }

    function setReliefToken(address _reliefTokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reliefToken = IERC20(_reliefTokenAddress);
    }

    function createDisasterEvent(string memory name, string memory description) external onlyRole(ADMIN_ROLE) returns (uint256) {
        disasterEventCount++;
        uint256 eventId = disasterEventCount;

        disasterEvents[eventId] = DisasterEvent({
            id: eventId,
            name: name,
            description: description,
            totalFunds: 0,
            allocatedFunds: 0,
            active: true,
            createdBy: msg.sender,
            createdAt: block.timestamp
        });

        emit DisasterEventCreated(eventId, name, msg.sender);
        return eventId;
    }

    function addBeneficiary(address walletAddress, uint256 eventId) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(disasterEvents[eventId].active, "Disaster event not active");
        
        beneficiaryCount++;
        uint256 beneficiaryId = beneficiaryCount;

        beneficiaries[beneficiaryId] = Beneficiary({
            id: beneficiaryId,
            walletAddress: walletAddress,
            eventId: eventId,
            approved: true, // For simplicity, auto-approve in this implementation
            allocatedAmount: 0,
            receivedAmount: 0,
            active: true
        });

        beneficiaryIdsByAddress[walletAddress].push(beneficiaryId);

        emit BeneficiaryAdded(beneficiaryId, walletAddress, eventId);
        return beneficiaryId;
    }

    function allocateFunds(uint256 eventId, address beneficiaryAddress, uint256 amount) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(disasterEvents[eventId].active, "Disaster event not active");
        require(reliefToken.balanceOf(address(this)) >= amount, "Insufficient funds in contract");

        allocationCount++;
        uint256 allocationId = allocationCount;

        allocations[allocationId] = Allocation({
            id: allocationId,
            eventId: eventId,
            beneficiaryAddress: beneficiaryAddress,
            amount: amount,
            released: false,
            createdAt: block.timestamp
        });

        allocationsByEvent[eventId].push(allocationId);
        
        // Update event funds
        disasterEvents[eventId].allocatedFunds += amount;

        emit FundsAllocated(allocationId, eventId, beneficiaryAddress, amount);
        return allocationId;
    }

    function releaseFunds(uint256 allocationId) external onlyRole(ADMIN_ROLE) nonReentrant returns (bool) {
        Allocation storage allocation = allocations[allocationId];
        require(!allocation.released, "Funds already released");
        require(allocation.amount > 0, "Invalid allocation");

        // Transfer tokens to beneficiary
        require(reliefToken.transfer(allocation.beneficiaryAddress, allocation.amount), "Transfer failed");

        allocation.released = true;
        
        // Update beneficiary received amount
        for (uint i = 0; i < beneficiaryIdsByAddress[allocation.beneficiaryAddress].length; i++) {
            uint256 beneficiaryId = beneficiaryIdsByAddress[allocation.beneficiaryAddress][i];
            if (beneficiaries[beneficiaryId].walletAddress == allocation.beneficiaryAddress) {
                beneficiaries[beneficiaryId].receivedAmount += allocation.amount;
                break;
            }
        }

        emit FundsReleased(allocationId, allocation.beneficiaryAddress, allocation.amount);
        return true;
    }

    function getDisasterEvent(uint256 eventId) external view returns (DisasterEvent memory) {
        return disasterEvents[eventId];
    }

    function getBeneficiary(uint256 beneficiaryId) external view returns (Beneficiary memory) {
        return beneficiaries[beneficiaryId];
    }

    function getAllocation(uint256 allocationId) external view returns (Allocation memory) {
        return allocations[allocationId];
    }

    function getBeneficiaryIdsByAddress(address addr) external view returns (uint256[] memory) {
        return beneficiaryIdsByAddress[addr];
    }

    function getAllocationsByEvent(uint256 eventId) external view returns (uint256[] memory) {
        return allocationsByEvent[eventId];
    }
}