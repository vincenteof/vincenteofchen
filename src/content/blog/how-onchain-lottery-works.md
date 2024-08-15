---
title: How to Implement an On-Chain Lottery System
description: Exploring how to build an on-chain lottery system similar to PancakeSwap Lottery from scratch
pubDate: 'Jul 29 2022'
---
> [中文翻译 Chinese Version](/posts/how-onchain-lottery-works-zh)

The lottery is an ideal use case for implementing with smart contracts, as traditional lottery systems are often questioned by users due to their lack of transparency. By using smart contracts, users can verify that the entire process is fair and trustworthy. This article will start with the most basic example and gradually add more complex features, ultimately implementing an on-chain lottery system similar to [PancakeSwap Lottery](https://pancakeswap.finance/lottery).

## Organizing Thoughts

The entire lottery process involves several key considerations:
* The format of the lottery tickets and the winning rules
* The source of the prize pool
* How to generate the lottery result

In the real world, [lottery](https://en.wikipedia.org/wiki/Lottery) ticket formats are varied. We will consider the classic format where users choose a fixed number of digits, with the winning rules based on how many digits match the final result. Suppose the total number of digits on a ticket is 6. The more consecutive digits that match from the beginning, the higher the prize. 

For example, if the winning number is `9 1 3 6 6 2`, Ticket A is `9 1 3 9 6 2`, and Ticket B is `0 1 3 6 6 2`, Ticket A would win a prize for matching 3 consecutive digits, while Ticket B would not win anything.

<!-- todo: 增加图片 -->

For each lottery draw, a prize pool needs to be established. Generally, funds are injected by the person hosting the lottery, and the funds paid by each user purchasing a ticket are automatically added to the prize pool. Additionally, there might be other situations, such as sponsorship or the funds from the lottery itself being invested in some projects generating returns. For the lottery system we want to implement, we will only consider the most basic scenarios mentioned above.

The way the lottery result is generated will vary depending on the ticket format, but it essentially involves using some source of randomness to generate random numbers. For the fixed 6-digit ticket format we mentioned, this means generating a 6-digit random number.

Now that we have a basic understanding of the entire lottery process, let’s consider the most basic code framework:

```solidity
contract Lottery Machine {
    enum Status {
        Pending,
        Open,
        Close,
        Claimable
    }

    // Ticket number corresponding to each user
    mapping(address => uint32) private _userWithTicketNumber;
    // Total amount collected in the prize pool
    uint256 private _amountCollected;
    // Price of each ticket
    uint256 private _priceTicketInToken;
    // Final result of the lottery draw
    uint32 public finalNumber;
    // Current status of the lottery
    Status public status;

    constructor(address sltAddress) {
        status = Status.Pending;
    }

    function injectFunds(uint256 amount) external {
        _amountCollected += amount;
    }

    function startLottery(
        uint256 priceTicketInToken
    ) external {
        status = Status.Open;
        _priceTicketInToken = priceTicketInToken;
    }

    function buyTicket(uint32 ticketNumber) external {
        _userWithTicketNumber[msg.sender] = ticketNumber;
        _amountCollected += _priceTicketInToken;
    }

    function closeLottery() external {
        status = Status.Close;
    }

    function drawFinalNumberAndMakeLotteryClaimable() external {
        uint32 finalNumber_ = _genRandomNumber() 
        finalNumber = finalNumber_;
        status = Status.Claimable;
    }

    function claimTicket(uint32 bracket) external {
        uint32 ticketNumber = _userWithTicketNumber[msg.sender];
        uint256 rewards = _calculateRewards(ticketNumber, bracket);
        _amountCollected -= rewards;
    }
}
```
<!-- todo: 用各个函数来描述流程 -->

Although the code above is quite simple, it already outlines the main process of a lottery system. It includes a state machine that tracks changes in the lottery’s status, allows users to inject funds into the prize pool, and ensures that each ticket purchase adds funds to the pool. However, there are still two functions that have not been implemented, namely `_calculateRewards` and `_genRandomNumber`. The former is used to calculate the total prize amount for a ticket based on how many digits match, while the latter is for generating a random number on-chain. We will implement these functions next.

## Calculating the Prize
The amount of the prize should be determined by the number of consecutive digits that match. The more digits that match, the higher the prize. We can preset some ratios, for example, the proportions of the prize pool allocated to matching digits from high to low could be 35%, 25%, 20%, 10%, 5%, 3%, 2%. This allows us to calculate the total prize for a particular match. As long as we keep track of the number of winners at each level, we can calculate how much each winner should receive by dividing the total prize for that level by the number of winners.

Let’s illustrate with an example: Suppose the total prize pool is 100E, the winning number is `9 1 3 6 6 2`, User A bought a ticket with `9 1 3 9 6 2`, User B bought a ticket with `9 1 3 5 6 2`, and User C bought `9 1 2 3 3 3`. The prizes for each bracket would be 35E, 25E, 20E, 10E, 5E, 3E, 2E. Users A and B both matched three digits, so they would split the 5E prize, while User C matched two digits and would receive 3E. The remaining brackets with no winners would retain their prize amounts in the smart contract.

Therefore, when purchasing a ticket, we need to record the number of matches for each bracket. However, since the winning number is not known at the time of purchase, how do we keep track? Since the total number of possible combinations for each bracket is fixed, we can keep track of different combinations. For example, there are only 10 possible numbers (0-9) for the first digit, 100 possible combinations (0-99) for the first two digits, but since matching two digits excludes matching one digit, there are actually 90 possible combinations, and so on. In terms of code implementation, we need a mapping to store the number of people with each combination, then increment it when a ticket is purchased. For the key, using the remainder directly could cause collisions, such as between `1` and `01`, while storing as strings consumes too much gas. We can add an offset to the remainder for each bracket: add 1 to the remainder for the first level, add 11 for the second level, add 111 for the third level, and so on, allowing us to use uint256 as the key while avoiding collisions.

```solidity
mapping(uint32 => uint256) private _numberTickets;

function buyTicket(uint32 ticketNumber) external {
	// Validation and token transfer logic
	...
	// Update the statistics for each combination corresponding to the ticket
	_numberTickets[1 + (ticketNumber % 10)]++;
  _numberTickets[11 + (ticketNumber % 100)]++;
  _numberTickets[111 + (ticketNumber % 1000)]++;
  _numberTickets[1111 + (ticketNumber % 10000)]++;
  _numberTickets[11111 + (ticketNumber % 100000)]++;
  _numberTickets[111111 + (ticketNumber % 1000000)]++;
}
```

This way, by considering the size of the total prize pool, the percentage allocated to each bracket, and the number of winners at each bracket, we can calculate how much each winning user should receive. Since the prize amount for each winner at a particular bracket is the same, we can calculate and cache the results in the contract during the `drawFinalNumberAndMakeLotteryClaimable` function:

```solidity
mapping(uint32 => uint32) private _bracketCalculator;
// Percentage of the total prize allocated to each bracket
uint256[6] rewardsBreakdown;
// Prize amount for each winning ticket at each bracket
uint256[6] tokenPerBracket;

constructor(address sltAddress, address rngAddress) Ownable(msg.sender) {
	// Other constructor logic
	...
	// Initialize the number of offsets for each bracket
	_bracketCalculator[0] = 1;
	_bracketCalculator[1] = 11;
	_bracketCalculator[2] = 111;
	_bracketCalculator[3] = 1111;
	_bracketCalculator[4] = 11111;
	_bracketCalculator[5] = 111111;
}

function drawFinalNumberAndMakeLotteryClaimable() external {
	// Generate the final winning number based on the random number
	...
	// Calculate the prize amount for each winner at each level
	uint256 numberAddressesInPreviousBracket;
  for (uint32 i = 0; i < 6; i++) {
  	uint32 j = 5 - i;
  	uint32 transformedWinningNumber = _bracketCalculator[j] + (finalNumber_ % (uint32(10) ** (j + 1)));
    uint256 winnersInCurrentBracket = _numberTickets[transformedWinningNumber] - numberAddressesInPreviousBracket;
    if (winnersInCurrentBracket != 0) {
    	tokenPerBracket[j] =  (rewardsBreakdown[j] * amountCollected) / winnersInCurrentBracket / 10000;
    	numberAddressesInPreviousBracket = _numberTickets[transformedWinningNumber];
    } else {
    	tokenPerBracket[j] = 0;
    }
  }	
}
```

First, we determine the number of winners at each level bracket on the final winning number. Just as when storing the data, we need to apply the same offset transformation to find the correct key. Note that the winner count at a higher bracket will necessarily include the count from the lower ones, so when calculating the number of winners at the current bracket, we subtract the number of winners at the previous one. The `rewardsBreakdown` array stores the percentage of the total prize allocated to each bracket, such as 3500, 2500, 2000, 1000, 500, 300, 200, which should sum up to 10000. The highest precision for an individual ratio is 1/10000. The `tokenPerBracket` array stores the prize amount corresponding to a single winning ticket at each bracket.

Users can call the `claimTicket` function to claim their prize. The `_calculateRewards` function calculates the corresponding prize based on the ticket number and the expected bracket level:

```solidity
function _calculateRewards(uint32 ticketNumber, uint32 bracket) internal view returns (uint256) {
  uint32 transformedTicketNumber = _bracketCalculator[bracket] + (ticketNumber % (uint32(10) ** (bracket + 1)));
  uint32 transformedFinalNumber = _bracketCalculator[bracket] + (finalNumber % (uint32(10) ** (bracket + 1)));
  if (transformedFinalNumber == transformedTicketNumber) {
  	return tokenPerBracket[bracket];
  } else {
    return 0;
  }
}
```

Here, we simply check whether the winning number and the ticket number match the required criteria for the specified bracket. If they match, we return the previously cached prize amount for a single ticket at that bracket.

## Generating Random Numbers

Generating random numbers on-chain is quite challenging. Using something like `block.timestamp` is not a serious method for generating randomness, as everything on-chain is visible to everyone, and this “randomness” can be manipulated by miners who can choose not to include your transaction in a block to alter this value. The EVM itself also cannot provide a true random number function, as different nodes might produce different on-chain states, leading to a failure to reach consensus.

In practice, the common approach is to delegate random number generation to an external oracle. [ChainLink VRF](https://docs.chain.link/vrf/v2-5/subscription/get-a-random-number) is a provably fair and verifiable random number generator. We can implement the random number generation logic by introducing the relevant contract. First, we define the necessary interface:

```solidity
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/IOwnable.sol";

interface IRandomNumberGenerator is IOwnable {
    function requestRandomNumber() external;
    function viewResult() external view returns (uint256);
}
```

The `requestRandomNumber` function requests a random number, while the `viewResult` function allows us to view the result of the most recent random number request.

The [implementation](https://github.com/vincenteof/play-with-solidity-smart-contract/blob/main/contracts/libraries/SimpleRandomNumberGenerator.sol) of the random number generator can be referenced from ChainLink’s example code, as long as it implements the interface we defined above. Note that ChainLink’s contract code inherits from `ConfirmedOwner`, so to call the random number generation method from our lottery contract, we need to first call `acceptOwnership` to accept the transfer of ownership rights.

## What’s Left

The code outlined above describes the core process of an on-chain lottery system. However, if we were to evaluate it by production-ready standards, many things are still missing, such as the most important aspect of smart contracts—security. The current code lacks various permission and exception scenario checks, and there are no logs. From a business process perspective, multiple lotteries and multiple ticket purchases by each user are also not supported. Interested readers can leave these features for practice. You can also refer to [my code](https://github.com/vincenteof/play-with-solidity-smart-contract/blob/main/contracts/Lottery/LotteryMachine.sol), which, although also not complete, is quite similar to the implementation of the [PancakeSwap Lottery](https://github.com/pancakeswap/pancake-smart-contracts/tree/master/projects/lottery).
