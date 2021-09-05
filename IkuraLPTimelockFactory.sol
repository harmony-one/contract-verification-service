// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

interface IERC20 {
    function transfer(address to, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function approve(address spender, uint tokens) external returns (bool success);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function totalSupply() external view returns (uint);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

library SafeMath {
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }

    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }

    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }

    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

contract Ownable is Context {
    address private _owner;
    address private _previousOwner;
    uint256 private _lockTime;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

     /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function geUnlockTime() public view returns (uint256) {
        return _lockTime;
    }

    //Locks the contract for owner for the amount of time provided
    function lock(uint256 time) public virtual onlyOwner {
        _previousOwner = _owner;
        _owner = address(0);
        _lockTime = block.timestamp + time;
        emit OwnershipTransferred(_owner, address(0));
    }
    
    //Unlocks the contract for owner when _lockTime is exceeds
    function unlock() public virtual {
        require(_previousOwner == msg.sender, "You don't have permission to unlock");
        require(block.timestamp > _lockTime , "Contract is locked until 7 days");
        emit OwnershipTransferred(_owner, _previousOwner);
        _owner = _previousOwner;
    }
}

contract IkuraLPTimelockFactory is Ownable {
    
    // Fee receiver
    address payable private _feeReceiver;
    
    // Fee LP 100% = 10000
    uint256 private _feeLP;
    
    // Fee fiat
    uint256 private _feeFiat;
    
    event IkuraLPTimelockCreated(address indexed owner, address indexed IkuraLP, uint256 amount, address indexed target, uint256 releaseTime, uint8 feeOption, address IkuraLPTimelock);
    
    constructor (address payable feeReceiver_, uint256 feeLP_, uint256 feeFiat_) {
        _feeReceiver = feeReceiver_;
        _feeLP = feeLP_;
        _feeFiat = feeFiat_;
    }
    
    function feeReceiver() public view virtual returns (address payable) {
        return _feeReceiver;
    }
    
    function setFeeReceiver(address payable feeReceiver_) public onlyOwner {
        _feeReceiver = feeReceiver_;
    }

    function feeLP() public view virtual returns (uint256) {
        return _feeLP;
    }
    
    function setFeeLP(uint256 feeLP_) public onlyOwner {
        _feeLP = feeLP_;
    }

    function feeFiat() public view virtual returns (uint256) {
        return _feeFiat;
    }
    
    function setFeeFiat(uint256 feeFiat_) public onlyOwner {
        _feeFiat = feeFiat_;
    }
    
    function createIkuraLPTimelock(IERC20 IkuraLP_, uint256 amount_, address target_, uint256 releaseTime_, uint8 feeOption_) public {
        require(amount_ > 0, "Invalid amount");
        require(target_ != address(0), "Invalid target address");
        require(releaseTime_ > block.timestamp, "ReleaseTime should be future time");
        require(feeOption_ == 0 || feeOption_ == 1, "FeeOption can be 0 or 1");
        
        IkuraLPTimelock IkuraLPTimelock = new IkuraLPTimelock(IkuraLP_, target_, releaseTime_, feeOption_, _feeReceiver, _feeLP, _feeFiat);
        IkuraLP_.transferFrom(msg.sender, address(IkuraLPTimelock), amount_);
        IkuraLPTimelock.transferOwnership(msg.sender);
        
        emit IkuraLPTimelockCreated(msg.sender, address(IkuraLP_), amount_, target_, releaseTime_, feeOption_, address(IkuraLPTimelock));
    }
    
}

contract IkuraLPTimelock is Ownable {
    using SafeMath for uint256;

    // The den where the IkuraLP is being held
    IERC20 private _IkuraLP;

    // The target the IkuraLP is going to try to devour
    address private _target;

    // timestamp when the IkuraLP wakes up
    uint256 private _releaseTime;
    
    // Fee option
    uint8 private _feeOption;
    
    // Fee receiver
    address payable private _feeReceiver;
    
    // Fee LP
    uint256 private _feeLP;
    
    // Fee fiat
    uint256 private _feeFiat;

    constructor (IERC20 IkuraLP_, address target_, uint256 releaseTime_, uint8 feeOption_, address payable feeReceiver_, uint256 feeLP_, uint256 feeFiat_) {
        require(target_ != address(0), "Invalid target address");
        require(releaseTime_ > block.timestamp, "ReleaseTime should be future time");
        require(feeOption_ == 0 || feeOption_ == 1, "FeeOption can be 0 or 1");
        
        _IkuraLP = IkuraLP_;
        _target = target_;
        _releaseTime = releaseTime_;
        _feeOption = feeOption_;
        _feeReceiver = feeReceiver_;
        _feeLP = feeLP_;
        _feeFiat = feeFiat_;
    }

    /**
     * @return the IkuraLP's den.
     */
    function IkuraLP() public view virtual returns (IERC20) {
        return _IkuraLP;
    }

    /**
     * @return the target to release hell upon.
     */
    function target() public view virtual returns (address) {
        return _target;
    }
    
    function setTarget(address target_) public onlyOwner {
        require(target_ != address(0), "Invalid target address");
        _target = target_;
    }

    /**
     * @return the feeOption
     */
    function feeOption() public view virtual returns (uint8) {
        return _feeOption;
    }
    
    function setFeeOption(uint8 feeOption_) public onlyOwner {
        require(feeOption_ == 0 || feeOption_ == 1, "FeeOption can be 0 or 1");
        _feeOption = feeOption_;
    }

    /**
     * @return the feeReceiver
     */
    function feeReceiver() public view virtual returns (address payable) {
        return _feeReceiver;
    }

    /**
     * @return the feeLP
     */
    function feeLP() public view virtual returns (uint256) {
        return _feeLP;
    }

    /**
     * @return the feeFiat
     */
    function feeFiat() public view virtual returns (uint256) {
        return _feeFiat;
    }

    /**
     * @return the epoch time.
     */
    function blockTimeStamp() public view virtual returns (uint256) {
        return block.timestamp;
    }

    /**
     * @return the IkuraLP's health, defeat him by exhausting him.
     */
    function IkuraLPsHealth() public view virtual returns (uint256) {
        uint256 amount = IkuraLP().balanceOf(address(this));

        return amount;
    }

    /**
     * @return the time when the IkuraLP will wake up and can be released.
     */
    function releaseTime() public view virtual returns (uint256) {
        return _releaseTime;
    }
    
    function setReleaseTime(uint256 releaseTime_) public onlyOwner {
        require(releaseTime_ > block.timestamp, "ReleaseTime should be future time");
        
        _releaseTime = releaseTime_;
    }

    /**
     * @notice Releases the IkuraLP upon the target, there will be blood.
     */
    function releaseTheIkuraLP() public virtual payable {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= releaseTime(), "The IkuraLP is still asleep, you might not want to wake him up.");

        uint256 amount = IkuraLP().balanceOf(address(this));
        require(amount > 0, "There's no IkuraLP, WHERE'S THE IkuraLP?");
        
        if (_feeOption == 0) {
            uint256 feeAmount = amount.mul(_feeLP).div(10000);
            amount -= feeAmount;
            IkuraLP().transfer(feeReceiver(), feeAmount);
        } else {
            require(msg.value >= feeFiat(), "Fiat fee amount is less");
            (bool sent, ) = feeReceiver().call{ value: msg.value }("");
            require(sent, "Fee transfer failed");
        }

        IkuraLP().transfer(target(), amount);
    }
}