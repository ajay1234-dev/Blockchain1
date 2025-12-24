// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EmergencyReliefStablecoin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EmergencyReliefManager
 * @dev Main contract to manage emergency relief funds and operations
 * This contract coordinates between donors, beneficiaries, and vendors
 * with strict spending rules and auditability
 */
contract EmergencyReliefManager is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    EmergencyReliefStablecoin public stablecoin;
    
    // Donor information
    mapping(address => uint256) public donorBalances;
    
    // Emergency events tracking
    struct EmergencyEvent {
        string name;
        string description;
        uint256 targetFunding;
        uint256 currentFunding;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    mapping(uint256 => EmergencyEvent) public emergencyEvents;
    uint256 public emergencyEventCount;
    
    // Transaction tracking
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        bytes32 category;
        uint256 eventId;
        uint256 timestamp;
        string description;
    }
    
    Transaction[] public transactions;
    
    // Events for audit tracking
    event DonorAdded(address indexed donor);
    event BeneficiaryAdded(address indexed beneficiary);
    event VendorAdded(address indexed vendor);
    event FundsDeposited(address indexed donor, uint256 amount);
    event BeneficiaryWhitelisted(address indexed beneficiary, uint256 eventId, bool status);
    event VendorWhitelisted(address indexed vendor, bool status);
    event FundsDistributed(address indexed beneficiary, uint256 amount, uint256 eventId);
    event EmergencyEventCreated(uint256 indexed eventId, string name, uint256 targetFunding);
    event FundsSpent(address indexed beneficiary, address indexed vendor, uint256 amount, bytes32 category);
    event ERC20DonationReceived(address indexed donor, address indexed token, uint256 amount);
    event EmergencyPause(bool paused);

    constructor(address _stablecoinAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        stablecoin = EmergencyReliefStablecoin(_stablecoinAddress);
    }

    /**
     * @dev Allows donors to deposit ETH funds to the contract
     * These funds will be used to mint stablecoins for beneficiaries
     */
    function depositFunds() external payable onlyRole(DONOR_ROLE) nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        
        donorBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Function to accept ERC20 stablecoin donations
     * This function receives donations of other ERC20 tokens
     */
    function donateERC20Token(address tokenAddress, uint256 amount) external onlyRole(DONOR_ROLE) nonReentrant whenNotPaused returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from donor to this contract
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit ERC20DonationReceived(msg.sender, tokenAddress, amount);
        return true;
    }

    /**
     * @dev Creates a new emergency event
     */
    function createEmergencyEvent(string memory name, string memory description, uint256 targetFunding) 
        external onlyRole(OPERATOR_ROLE) whenNotPaused returns (uint256) {
        emergencyEventCount++;
        
        emergencyEvents[emergencyEventCount] = EmergencyEvent({
            name: name,
            description: description,
            targetFunding: targetFunding,
            currentFunding: 0,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        emit EmergencyEventCreated(emergencyEventCount, name, targetFunding);
        return emergencyEventCount;
    }

    /**
     * @dev Adds a beneficiary to the whitelist for a specific emergency event
     */
    function addBeneficiary(address beneficiary, uint256 eventId) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(emergencyEvents[eventId].active, "Emergency event is not active");
        
        // Whitelist the beneficiary in both contracts
        stablecoin.whitelistBeneficiary(beneficiary, true);
        
        emit BeneficiaryAdded(beneficiary);
        emit BeneficiaryWhitelisted(beneficiary, eventId, true);
    }

    /**
     * @dev Adds a vendor to the whitelist
     */
    function addVendor(address vendor) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        // Whitelist the vendor in the stablecoin contract
        stablecoin.whitelistVendor(vendor, true);
        
        emit VendorAdded(vendor);
        emit VendorWhitelisted(vendor, true);
    }

    /**
     * @dev Distributes funds to a beneficiary by minting stablecoins
     */
    function distributeFunds(address beneficiary, uint256 amount, uint256 eventId) 
        external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(stablecoin.isWhitelistedBeneficiary(beneficiary), "Beneficiary not whitelisted");
        require(emergencyEvents[eventId].active, "Emergency event is not active");
        
        // Mint new stablecoins to the beneficiary
        stablecoin.mint(beneficiary, amount);
        
        // Update emergency event funding
        emergencyEvents[eventId].currentFunding += amount;
        emergencyEvents[eventId].updatedAt = block.timestamp;
        
        emit FundsDistributed(beneficiary, amount, eventId);
        
        // Record the transaction
        transactions.push(Transaction({
            from: address(this),
            to: beneficiary,
            amount: amount,
            category: "DIRECT_AID",
            eventId: eventId,
            timestamp: block.timestamp,
            description: "Direct fund distribution to beneficiary"
        }));
    }

    /**
     * @dev Allows vendors to spend funds on behalf of beneficiaries
     * This function calls the spendInCategory function in the stablecoin contract
     */
    function vendorSpend(address beneficiary, uint256 amount, bytes32 category) 
        external whenNotPaused returns (bool) {
        require(stablecoin.isWhitelistedVendor(msg.sender), "Vendor not approved");
        require(stablecoin.isWhitelistedBeneficiary(beneficiary), "Beneficiary not whitelisted");
        
        // Call the spendInCategory function in the stablecoin contract
        bool success = stablecoin.spendInCategory(beneficiary, category, amount);
        require(success, "Spending failed");
        
        emit FundsSpent(beneficiary, msg.sender, amount, category);
        
        // Record the transaction
        transactions.push(Transaction({
            from: beneficiary,
            to: msg.sender,
            amount: amount,
            category: category,
            eventId: 0, // Not linked to a specific event
            timestamp: block.timestamp,
            description: "Vendor spending on behalf of beneficiary"
        }));
        
        return true;
    }

    /**
     * @dev Sets spending limits for a beneficiary
     */
    function setBeneficiarySpendingLimit(address beneficiary, uint256 limit) 
        external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(stablecoin.isWhitelistedBeneficiary(beneficiary), "Beneficiary not whitelisted");
        stablecoin.setSpendingLimit(beneficiary, limit);
    }

    /**
     * @dev Sets category limits
     */
    function setCategoryLimit(bytes32 category, uint256 limit) 
        external onlyRole(OPERATOR_ROLE) whenNotPaused {
        stablecoin.setCategoryLimit(category, limit);
    }

    /**
     * @dev Pauses all operations (emergency pause)
     */
    function pauseOperations() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPause(true);
    }

    /**
     * @dev Unpauses operations
     */
    function unpauseOperations() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyPause(false);
    }

    /**
     * @dev Allows admin to withdraw excess ETH funds (not allocated to beneficiaries)
     */
    function withdrawETHFunds(address payable to, uint256 amount) 
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant whenNotPaused {
        require(address(this).balance >= amount, "Insufficient contract balance");
        to.transfer(amount);
    }

    /**
     * @dev Allows admin to withdraw excess ERC20 token funds
     */
    function withdrawERC20Funds(address tokenAddress, address to, uint256 amount)
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant whenNotPaused {
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
        require(token.transfer(to, amount), "Transfer failed");
    }

    /**
     * @dev Returns the total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Returns transaction details by index
     */
    function getTransaction(uint256 index) external view returns (Transaction memory) {
        require(index < transactions.length, "Index out of bounds");
        return transactions[index];
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable whenNotPaused {
        // Funds received are added to the general pool
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @dev Function to get the balance of a specific ERC20 token held by this contract
     */
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }
}