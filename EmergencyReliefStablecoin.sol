// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EmergencyReliefStablecoin
 * @dev An ERC-20 compliant stablecoin for emergency relief operations
 * This contract implements a permissioned stablecoin where only authorized
 * addresses can mint tokens for emergency relief purposes
 */
contract EmergencyReliefStablecoin is ERC20, ERC20Burnable, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    // Mapping to track individual spending limits for beneficiaries
    mapping(address => uint256) public spendingLimits;
    
    // Category-based spending limits (food, medicine, shelter, etc.)
    mapping(bytes32 => uint256) public categoryLimits;
    
    // Track spending per category for each beneficiary
    mapping(address => mapping(bytes32 => uint256)) public categorySpending;
    
    // Whitelist mappings
    mapping(address => bool) public isWhitelistedBeneficiary;
    mapping(address => bool) public isWhitelistedVendor;
    
    // Events for audit tracking
    event SpendingLimitSet(address indexed beneficiary, uint256 limit);
    event CategoryLimitSet(bytes32 indexed category, uint256 limit);
    event CategorySpent(address indexed beneficiary, address indexed vendor, bytes32 indexed category, uint256 amount);
    event BeneficiaryWhitelisted(address indexed beneficiary, bool status);
    event VendorWhitelisted(address indexed vendor, bool status);
    event FundsDonated(address indexed donor, address indexed token, uint256 amount);
    event EmergencyPause(bool paused);

    constructor() ERC20("Emergency Relief Stablecoin", "ERS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        // Set default category limits (in wei equivalent)
        categoryLimits[keccak256("FOOD")] = 1000 * 10**18; // 1000 ERS for food
        categoryLimits[keccak256("MEDICINE")] = 500 * 10**18; // 500 ERS for medicine
        categoryLimits[keccak256("SHELTER")] = 2000 * 10**18; // 2000 ERS for shelter
        categoryLimits[keccak256("WATER")] = 300 * 10**18; // 300 ERS for water
        categoryLimits[keccak256("CLOTHING")] = 200 * 10**18; // 200 ERS for clothing
    }

    /**
     * @dev Mints new tokens to the specified address
     * Only accounts with MINTER_ROLE can call this function
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    /**
     * @dev Sets a spending limit for a specific beneficiary
     * Only accounts with OPERATOR_ROLE can call this function
     */
    function setSpendingLimit(address beneficiary, uint256 limit) public onlyRole(OPERATOR_ROLE) whenNotPaused {
        spendingLimits[beneficiary] = limit;
        emit SpendingLimitSet(beneficiary, limit);
    }

    /**
     * @dev Sets a spending limit for a specific category
     * Only accounts with OPERATOR_ROLE can call this function
     */
    function setCategoryLimit(bytes32 category, uint256 limit) public onlyRole(OPERATOR_ROLE) whenNotPaused {
        categoryLimits[category] = limit;
        emit CategoryLimitSet(category, limit);
    }

    /**
     * @dev Overrides the transfer function to enforce spending limits
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(_canTransfer(msg.sender, amount), "Transfer exceeds spending limit");
        return super.transfer(to, amount);
    }

    /**
     * @dev Overrides the transferFrom function to enforce spending limits
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(_canTransfer(from, amount), "Transfer exceeds spending limit");
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Function to spend tokens within a specific category
     * This is for vendors to spend on behalf of beneficiaries
     * Only approved vendors can call this function
     */
    function spendInCategory(address beneficiary, bytes32 category, uint256 amount) external whenNotPaused nonReentrant returns (bool) {
        require(isWhitelistedVendor[msg.sender], "Vendor not approved");
        require(isWhitelistedBeneficiary[beneficiary], "Beneficiary not whitelisted");
        require(categorySpending[beneficiary][category] + amount <= categoryLimits[category], 
                "Spending exceeds category limit");
        require(spendingLimits[beneficiary] == 0 || 
                balanceOf(beneficiary) >= amount, 
                "Insufficient balance for beneficiary");
        
        categorySpending[beneficiary][category] += amount;
        _transfer(beneficiary, msg.sender, amount);
        
        emit CategorySpent(beneficiary, msg.sender, category, amount);
        return true;
    }

    /**
     * @dev Function to accept ERC20 stablecoin donations
     * This function receives donations of other ERC20 tokens
     */
    function donateERC20Token(address tokenAddress, uint256 amount) external whenNotPaused nonReentrant returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from donor to this contract
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit FundsDonated(msg.sender, tokenAddress, amount);
        return true;
    }

    /**
     * @dev Function to whitelist a beneficiary
     * Only accounts with OPERATOR_ROLE can call this function
     */
    function whitelistBeneficiary(address beneficiary, bool status) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        isWhitelistedBeneficiary[beneficiary] = status;
        emit BeneficiaryWhitelisted(beneficiary, status);
    }

    /**
     * @dev Function to whitelist a vendor
     * Only accounts with OPERATOR_ROLE can call this function
     */
    function whitelistVendor(address vendor, bool status) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        isWhitelistedVendor[vendor] = status;
        emit VendorWhitelisted(vendor, status);
    }

    /**
     * @dev Internal function to check if a transfer is allowed based on spending limits
     */
    function _canTransfer(address account, uint256 amount) internal view returns (bool) {
        // Admins, minters, and operators can always transfer
        if (hasRole(DEFAULT_ADMIN_ROLE, account) || 
            hasRole(MINTER_ROLE, account) || 
            hasRole(OPERATOR_ROLE, account)) {
            return true;
        }
        
        // Check if the account has a spending limit set
        if (spendingLimits[account] > 0) {
            return balanceOf(account) >= amount;
        }
        
        // If no spending limit is set, transfers are allowed
        return true;
    }

    /**
     * @dev Returns the total spent in a specific category for a beneficiary
     */
    function getCategorySpent(address beneficiary, bytes32 category) public view returns (uint256) {
        return categorySpending[beneficiary][category];
    }

    /**
     * @dev Returns the remaining available amount in a specific category for a beneficiary
     */
    function getCategoryRemaining(address beneficiary, bytes32 category) public view returns (uint256) {
        uint256 limit = categoryLimits[category];
        uint256 spent = categorySpending[beneficiary][category];
        return limit > spent ? limit - spent : 0;
    }

    /**
     * @dev Returns the total balance of a specific ERC20 token held by this contract
     */
    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }

    /**
     * @dev Emergency function to pause all operations
     * Only accounts with EMERGENCY_ROLE can call this function
     */
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPause(true);
    }

    /**
     * @dev Emergency function to unpause operations
     * Only accounts with EMERGENCY_ROLE can call this function
     */
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyPause(false);
    }
}