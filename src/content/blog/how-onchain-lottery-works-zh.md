---
title: '如何实现一个链上彩票系统'
description: '研究了如何从头实现一个类似 pancakeswap lottery 的链上彩票系统'
pubDate: 'Jul 29 2022'
---

> [English Version](/posts/how-onchain-lottery-works)

彩票是一个非常适合使用智能合约去实现的场景，传统的彩票系统经常会因为其不透明性而遭到使用者的质疑。通过使用智能合约，使用者可以去验证整个过程是公平且可以被信任的。本文将从最基本的例子开始，逐步增加更多复杂特性，最后实现一个类似 [pancakeswap lottery](https://pancakeswap.finance/lottery) 的链上彩票系统。

## 整理头绪

整个抽奖过程大概有以下几个需要思考的地方：
* 奖券的形式及中奖规则
* 奖金的来源
* 如何生成抽奖结果

现实世界里的 [彩票](https://en.wikipedia.org/wiki/Lottery) 奖券形式种类繁多，我们考虑最经典的奖券形式为选择固定位数的数字，中奖规则按照相对最终结果命中的位数。假定奖券的总位数为 6 位，从首位数字开始，连续命中越多的数字将获得越多的奖金。

比如中奖数字为 `9 1 3 6 6 2`, 奖券 A 为 `9 1 3 9 6 2`，而奖券 B 为 `0 1 3 6 6 2`，奖券 A 将获得连续 3 位命中的奖励，而奖券 B 将不会获得奖励。

<!-- todo: 增加图片 -->

对于每次抽奖需要设立奖池，一般会由开设彩票的人注入资金，每位购买彩票的用户所付出的资金也会自动注入奖池。除此以外还可能会存在一些其他情况，比如赞助或者彩票的资金本身进入一些投资项目所产生的回报。对于我们要实现的彩票系统，只考虑前面那些最基本的场景。

由于奖券形式的不同，生成抽奖结果的方式也会有所不同，但本质上都去利用一些随机源产生随机数。对于我们上述的固定 6 位数字的奖券形式，就是去生成一个 6 位的随机数。

我们已经对整个抽奖过程有了基本的了解，先考虑最基本的代码框架

```solidity
contract Lottery Machine {
    enum Status {
        Pending,
        Open,
        Close,
        Claimable
    }

    // 每位用户对应的奖券
    mapping(address => uint32) private _userWithTicketNumber;
    // 奖池总数
    uint256 private _amountCollected;
    // 奖券的价格
    uint256 private _priceTicketInToken;
    // 抽奖的最终结果
    uint32 public finalNumber;
    // 当前抽奖的状态
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

虽然上述代码十分简陋，但它已经描述了彩票系统的主要流程，有一个抽奖状态变化的状态机，用户可以将资金注入奖池，每次购买奖券的资金也会进入奖池。但是还剩下两个函数未被实现，分别是 `_calculateRewards` 和 `_genRandomNumber`。前者用于计算某一张奖券命中的位数总共会获得多少奖金，后者则是在链上生成一个随机数。我们将马上实现它们。

## 计算奖金
奖金的多少应该由连续命中的位数决定，命中的位数越高的奖券可以获得的奖金越多。我们可以预置一些比例，比如按照命中位数由高到低，获取的奖池比例分别为 35%，25%，20%，10%，5%，3%，2%，这样就可以针对某次抽奖计算出某个命中位数的奖金总额。只要我们记录下不同命中位数下有多少中奖者，每位中奖者可以获得多少奖金只需要用命中位数的奖金总额除以总人数即可。

用一个例子来说明：某次抽奖的总奖池为 100E，中奖数字为 `9 1 3 6 6 2`，用户 A 购买了奖券 `9 1 3 9 6 2`，用户 B 购买了奖券 `9 1 3 5 6 2`，而用户 C 购买了 `9 1 2 3 3 3`。这样每一阶的奖金分别为 35E, 25E, 20E, 10E, 5E, 3E，2E。用户 A 和 用户 B 分别命中了三阶，他们将平分 5E, 用户 C 命中了二阶，他将获得 3E，剩下的阶由于没有人命中将保留在智能合约中。

因此我们需要在购买奖券的时候记录某一阶的命中人数，但是在购买是并不能预先知道中奖号码，如何进行统计呢？由于每一阶的中奖号码的组合总数是确定的，我们可以去针对不同的组合去做记录。比如第一位一共只有 0 ～ 9 的 10 种可能，前两位有 0 ～ 99 的 100 种可能，但由于命中了二阶将不会再有一阶的奖励，所以还需要扣除一阶的组合数，因此一共 90 种可能，更高阶也是以此类推。具体到代码实现层面，我们需要一个 mapping 去存储每一种组合的人数，然后在 `buyTicket` 的时候去累加。对于 key 的选取，如果直接采用取余的结果会产生碰撞，比如 `1` 和 `01`，转化为 string 存储 gas 消耗又太高。我们可以将取余的结果做一次移动，对一阶的取余的结果加上 1，对二阶的取余结果加上 11，对三阶的取余结果加上 111，以此类推，这样就可以直接用 uint256 作为 key 存储又避开了碰撞。 

```solidity
mapping(uint32 => uint256) private _numberTickets;

function buyTicket(uint32 ticketNumber) external {
	// 校验及划转代币相关逻辑
	...
	// 更新当前奖券所对应的每一阶组合的统计数量
	_numberTickets[1 + (ticketNumber % 10)]++;
  _numberTickets[11 + (ticketNumber % 100)]++;
  _numberTickets[111 + (ticketNumber % 1000)]++;
  _numberTickets[1111 + (ticketNumber % 10000)]++;
  _numberTickets[11111 + (ticketNumber % 100000)]++;
  _numberTickets[111111 + (ticketNumber % 1000000)]++;
}
```

这样只需要按照总奖池大小，每一阶的奖金比例以及每一阶的人数就能计算出中奖用户可以获得的奖金。由于每一阶里的中奖用户获得的奖金数额都是一样的，我们可以在 `drawFinalNumberAndMakeLotteryClaimable` 的时候做好计算并将结果缓存在合约里：

```solidity
mapping(uint32 => uint32) private _bracketCalculator;
// 每一阶占总奖金的百分比
uint256[6] rewardsBreakdown;
// 每一阶里一张中奖奖券对应的奖金
uint256[6] tokenPerBracket;

constructor(address sltAddress, address rngAddress) Ownable(msg.sender) {
	// 其余构造逻辑
	...
	// 初始化每一阶结果移动的数量
	_bracketCalculator[0] = 1;
	_bracketCalculator[1] = 11;
	_bracketCalculator[2] = 111;
	_bracketCalculator[3] = 1111;
	_bracketCalculator[4] = 11111;
	_bracketCalculator[5] = 111111;
}

function drawFinalNumberAndMakeLotteryClaimable() external {
	// 根据随机数生成最终中奖号码
	...
	// 计算每一阶里单个中奖用户的奖金
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

首先我们根据最终中奖号码，找到该号码对应的每一阶的中奖人数，这里跟存储时一样，需要做对应的移动转换才能找到正确的 key。需要注意更高阶的人数肯定包含低阶的人数，所以在计算当前阶人数时需要减去上一阶的人数。`rewardsBreakdown` 里存储了每一阶奖金占总奖金的百分比，比如 3500，2500，2000，1000，500，300，200，综合应该等于 10000，单个比率的最高精度为 1 / 10000。`tokenPerBracket` 存储了每一阶里单个中奖奖券对应的奖金。

用户可以调用 `claimTicket` 来领取奖金，`_calculateRewards` 根据对应的奖券号码和预期的阶数计算对应的奖金

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

这里只是简单校验了中奖号码与奖券号码是否满足阶数的要求，满足就返回之前缓存的单个奖券的奖金。

## 随机数生成

在链上实现随机数生成是十分困难的，类似 `block.timestamp` 无法作为严肃的随机数生成方式，因为链上的东西是所有人都可见的，这种随机性会被矿工控制，他们可以选择不打包你的交易来改变这个值。EVM 本身也不能提供真正的随机数函数，因为不同的节点可能会产生不同的链上状态，最终无法达成一致。

在实践中常用的方法是将随机数生成交给外部的预言机去实现，[ChainLink VRF](https://docs.chain.link/vrf/v2-5/subscription/get-a-random-number) 是一种可证明公平且可验证的随机数生成器。我们可以通过引入相关合约来实现随机数生成相关逻辑。首先定义相关的接口

```solidity
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/IOwnable.sol";

interface IRandomNumberGenerator is IOwnable {
    function requestRandomNumber() external;

    function viewResult() external view returns (uint256);
}
```

`requestRandomNumber` 去请求一个随机数，`viewResult` 则去查看最近一次请求的随机数结果。

随机数生成器的 [具体实现](https://github.com/vincenteof/play-with-solidity-smart-contract/blob/main/contracts/libraries/SimpleRandomNumberGenerator.sol) 可以参考 ChainLink 的实例代码，只要保证它实现我们上面定义的接口即可。需要注意的是 ChainLink 的合约代码继承了 `ConfirmedOwner`，想在彩票的合约代码中调用它的随机数生成方法需要先调用它的 `acceptOwnership` 来接受 owner 权限的转移。 

## 还剩下什么

上述的代码阐述了整个链上彩票系统的核心流程，但是用 production ready 的标准去衡量的话还缺少了很多东西，比如对智能合约最重要的安全性。当前的代码缺少各种权限与异常场景的校验，也没有任何的日志。就业务流程而言，多次抽奖与每个用户购买多个奖券也没有被支持，感兴趣的人可以把这些内容留作联系。你也可以参考 [我的代码](https://github.com/vincenteof/play-with-solidity-smart-contract/blob/main/contracts/Lottery/LotteryMachine.sol)，当然它也不是完备的，但你可以看到它非常类似于 [pancakeswap lottery](https://github.com/pancakeswap/pancake-smart-contracts/tree/master/projects/lottery) 的实现。 

