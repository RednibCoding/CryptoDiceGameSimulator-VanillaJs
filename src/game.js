let dom = {
	// Misc
	alertPosition:					"alert-position",
	// Base
	houseEdge:						"house_edge",
	balance:						"balance",
	betsize:						"bet_size",
	payout:							"payout",
	// On win
	onWinReturnToBase_RadioBtn: 	"rad_onwin_return_to_base",
	onWinIncBetBy_RadioBtn:			"rad_onwin_inc_bet_by",
	onWinIncBetBy:					"onwin_inc_bet_by",
	onWinDecBetBy_RadioBtn:			"rad_onwin_dec_bet_by",
	onWinDecBetBy:					"onwin_dec_bet_by",
	// On loss
	onLossReturnToBase_RadioBtn:	"rad_onloss_return_to_base",
	onLossIncBetBy_RadioBtn:		"rad_onloss_inc_bet_by",
	onLossIncBetBy:					"onloss_inc_bet_by",
	onLossDecBetBy_RadioBtn:		"rad_onloss_dec_bet_by",
	onLossDecBetBy:					"onloss_dec_bet_by",
	// To win
	rollover_RadioBtn:				"rad_toWin_roll_over",
	rollover:						"towin_roll_over_val",
	rollunder_RadioBtn:				"rad_toWin_roll_under",
	rollunder:						"towin_roll_under_val",
	// Limit
	numRolls:						"limit_num_rolls_val",
	balHigher:						"limit_stop_if_bal_heigher_val",
	balLower:						"limit_stop_if_bal_lower_val",
	maxBetsize:						"limit_max_bet_size_val",
}


let config = {
	minHouseEdge:	0.1,
	maxHouseEdge:	3.0,
	minBalance:		0.00000001,
	maxBalance:		10000.0,
	minBetsize:		0.00000001,
	maxBetsize:		1000,
	minPayout:		1.02,
	maxPayout:		1002.0,
	minIncDecBet:	0,
	maxIncDecBet:	10000,
	minRolls:		1,
	maxRolls:		200000,
	minStopBal:		0,
	maxStopBal:		10000,
	minMaxBetsize:	0,
	maxMaxBetsize:	100	
}

function calculateRollUnderValue(multiplier, houseEdge)
{
	let result = (100.000-houseEdge)/multiplier;
	result = (Math.floor(result*1000)/1000).toFixed(3)
	return result;
}

function calculateRollOverValue(multiplier, houseEdge)
{
	let result = calculateRollUnderValue(multiplier, houseEdge)
	result = (99.999-result).toFixed(3);
	return result;
}

// Alert
function raiseAlert(text, parentId)
{
	let div = document.createElement("div");
	div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
	div.textContent = text;
	
	let btn = document.createElement("button");
	btn.setAttribute("type", "button");
	btn.setAttribute("class", "close");
	btn.setAttribute("data-dismiss", "alert");
	btn.setAttribute("aria-label", "Close");

	div.appendChild(btn);

	let domPosition = document.getElementById(parentId);
	domPosition.appendChild(div);
}

function dismissAlerts(parentId)
{
	let domPosition = document.getElementById(parentId);
	domPosition.innerHTML = null;
}


// OnChange for input boxes

function onHouseEdgeChange(input)
{
	if (input.value < 0.1) input.value = 0.1;
	if (input.value > 3.0) input.value = 3.0;

	let payout = parseFloat(document.getElementById(dom.payout).value)
	let newRollOverVal = calculateRollOverValue(payout, input.value);
	let newRollUnderVal = calculateRollUnderValue(payout, input.value);
	document.getElementById(dom.rollover).innerHTML = newRollOverVal;
	document.getElementById(dom.rollunder).innerHTML = newRollUnderVal;
}

function onBalanceChange(input)
{
	if (input.value < config.minBalance) input.value = parseFloat(config.minBalance).toFixed(8);
	if (input.value > config.maxBalance) input.value = parseFloat(config.maxBalance).toFixed(8);
}

function onBetsizeChange(input)
{
	if (input.value < config.minBetsize) input.value = parseFloat(config.minBetsize).toFixed(8);
	if (input.value > config.maxBetsize) input.value = parseFloat(config.maxBetsize).toFixed(8);
}

function onPayoutChange(input)
{
	if (input.value < config.minPayout) input.value = config.minPayout;
	if (input.value > config.maxPayout) input.value = config.maxPayout;

	let houseEdge = parseFloat(document.getElementById(dom.houseEdge).value)
	let newRollOverVal = calculateRollOverValue(input.value, houseEdge);
	let newRollUnderVal = calculateRollUnderValue(input.value, houseEdge);
	document.getElementById(dom.rollover).innerHTML = newRollOverVal;
	document.getElementById(dom.rollunder).innerHTML = newRollUnderVal;
}

function onIncDecBetChange(input)
{
	if (input.value < config.minIncDecBet) input.value = config.minIncDecBet;
	if (input.value > config.maxIncDecBet) input.value = config.maxIncDecBet;
}

function onNumRollsChange(input)
{
	if (input.value < config.minRolls) input.value = config.minRolls;
	if (input.value > config.maxRolls) input.value = config.maxRolls;
}

function onStopIfBalHigherLowerChange(input)
{
	if (input.value < config.minStopBal) input.value = config.minStopBal;
	if (input.value > config.maxStopBal) input.value = config.maxStopBal;
}

function onMaxBetsizeChange(input)
{
	if (input.value < config.minMaxBetsize) input.value = config.minMaxBetsize;
	if (input.value > config.maxMaxBetsize) input.value = config.maxMaxBetsize;
}


class GameHandler
{
	constructor()
	{
		this._rollsMade = 0;
		this._highestBet = 0;
		this._longestWinStreak = 0;
		this._longestLoseStreak = 0;
		this._profit = 0;
		this._startBalance = 0;
		this._chartData = [];
		this._chart = null;
	}

	isValidStartCondition()
	{
		dismissAlerts(dom.alertPosition);

		let balance = document.getElementById(dom.balance).value;
		let betsize = document.getElementById(dom.betsize).value;

		if(document.getElementById(dom.houseEdge).value === "")
			{raiseAlert("House edge can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.balance).value === "")
			{raiseAlert("Balance can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.betsize).value === "")
			{raiseAlert("Betsize can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.payout).value === "")
			{raiseAlert("Payout can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.numRolls).value === "")
			{raiseAlert("Number of rolls can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.balHigher).value === "")
			{raiseAlert("Stop if balance is heiger can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.balLower).value === "")
			{raiseAlert("Stop if balance is lower can not be empty.", dom.alertPosition); return false;}
		if(document.getElementById(dom.maxBetsize).value === "")
			{raiseAlert("Max betsize can not be empty.", dom.alertPosition); return false;}

		if(document.getElementById(dom.onWinIncBetBy_RadioBtn).checked)
		{
			if(document.getElementById(dom.onWinIncBetBy).value === "")
			{raiseAlert("On win increase bet by can not be empty.", dom.alertPosition); return false;}
		}
		if(document.getElementById(dom.onWinDecBetBy_RadioBtn).checked)
		{
			if(document.getElementById(dom.onWinDecBetBy).value === "")
			{raiseAlert("On win decrease bet by can not be empty.", dom.alertPosition); return false;}
		}
		if(document.getElementById(dom.onLossIncBetBy_RadioBtn).checked)
		{
			if(document.getElementById(dom.onLossIncBetBy).value === "")
			{raiseAlert("On loss increase bet by can not be empty.", dom.alertPosition); return false;}
		}
		if(document.getElementById(dom.onLossDecBetBy_RadioBtn).checked)
		{
			if(document.getElementById(dom.onLossDecBetBy).value === "")
			{raiseAlert("On loss decrease bet by can not be empty.", dom.alertPosition); return false;}
		}

		if(balance < betsize)
		{
			raiseAlert("Balance must be greater or equal to bet size.", dom.alertPosition)
			return false;
		}
			

		return true;
		
	}
	
	prepareAutoRoll()
	{
		this._rollsMade = 0;
		this._highestBet = 0;
		this._longestWinStreak = 0;
		this._longestLoseStreak = 0;
		this._profit = 0;
		this._startBalance = 0;
		this._chartData = [];
		if(this._chart != null)
			this._chart.destroy();
	}

	performAutoRoll(shouldStop)
	{
		if(shouldStop==true){return};
		let rndNum = 0;

		let balance = parseFloat(document.getElementById(dom.balance).value);
		this._startBalance = balance;
		let payout = parseFloat(document.getElementById(dom.payout).value);
		let betsize = parseFloat(document.getElementById(dom.betsize).value);
		let baseBetSize = betsize;
		let maxBetSize = parseFloat(document.getElementById(dom.maxBetsize).value);
		let stopBalHigher = parseFloat(document.getElementById(dom.balHigher).value);
		let stopBalLower = parseFloat(document.getElementById(dom.balLower).value);
		let rollOver = parseFloat(document.getElementById(dom.rollover).innerHTML)
		let rollUnder = parseFloat(document.getElementById(dom.rollunder).innerHTML);
		let numRolls = parseFloat(document.getElementById(dom.numRolls).value);

		let roundsWonInARow = 0;
		let roundsLostInARow = 0;

		let isWin = false;
		
		for(let rolls=numRolls; rolls > 0; rolls--)
		{
			

			if(balance < betsize)
			{
				raiseAlert("Stopped: Bet size is greater then balance.", dom.alertPosition);
				break;
			}
			if(balance > stopBalHigher)
			{
				raiseAlert("Stopped: Balance is heigher than limit.", dom.alertPosition);
				break;
			}
			if(balance < stopBalLower)
			{
				raiseAlert("Stopped: Balance is lower than limit.", dom.alertPosition);
				break;
			}
			if(betsize > maxBetSize)
			{
				raiseAlert("Stoppen: Bet size is greater than maximum bet size.", dom.alertPosition);
				break;
			}

			rndNum = parseFloat((Math.random() * 100).toFixed(3));
			balance -= parseFloat((betsize).toFixed(8));
			this._rollsMade += 1;

			if(betsize > this._highestBet)
				this._highestBet = parseFloat(betsize.toFixed(8));

			if(document.getElementById(dom.rollover_RadioBtn).checked)
			{
				if(rndNum >= rollOver) // win
					isWin = true;
				else // loss
					isWin = false;
			}
			else if(document.getElementById(dom.rollunder_RadioBtn).checked)
			{
				if(rndNum <= rollUnder) // win
					isWin = true;
				else // loss
					isWin = false;
			}

			if(this._rollsMade > 0)
			{
				if(isWin == true)
				{
					balance = parseFloat((balance + betsize * payout).toFixed(8));

					// Update statistic
					roundsLostInARow = 0;
					roundsWonInARow += 1;

					if(roundsWonInARow > this._longestWinStreak)
						this._longestWinStreak = roundsWonInARow;	
				}
				else
				{
					// Update statistic
					roundsWonInARow = 0;
					roundsLostInARow += 1;

					if(roundsLostInARow > this._longestLoseStreak)
						this._longestLoseStreak = roundsLostInARow;
				}
			
				this._chartData.push(parseFloat((balance).toFixed(8)));
				betsize = this._updateBetSize(isWin, betsize, baseBetSize);
			}
		}
		document.getElementById(dom.balance).value = parseFloat(balance.toFixed(8));
		this._profit = balance - this._startBalance;
	}

	_updateBetSize(isWin, currentBetsize, baseBetSize)
	{
		if(isWin)
		{
			if(document.getElementById(dom.onWinReturnToBase_RadioBtn).checked)
			{
				return parseFloat(baseBetSize);
			}
			else if(document.getElementById(dom.onWinIncBetBy_RadioBtn).checked)
			{
				let incBetVal = parseFloat(document.getElementById(dom.onWinIncBetBy).value);
				let betSizePercentVal = (currentBetsize/100) * incBetVal;
				return parseFloat((currentBetsize + betSizePercentVal));
			}
			else if(document.getElementById(dom.onWinDecBetBy_RadioBtn).checked)
			{
				let decBetVal = parseFloat(document.getElementById(dom.onWinDecBetBy).value);
				let betSizePercentVal = (currentBetsize/100) * decBetVal;
				return parseFloat((currentBetsize + betSizePercentVal));
			}
		}
		else
		{
			if(document.getElementById(dom.onLossReturnToBase_RadioBtn).checked)
			{
				return parseFloat(baseBetSize);
			}
			else if(document.getElementById(dom.onLossIncBetBy_RadioBtn).checked)
			{
				let incBetVal = parseFloat(document.getElementById(dom.onLossIncBetBy).value);
				let betSizePercentVal = (currentBetsize/100) * incBetVal;
				return parseFloat((currentBetsize + betSizePercentVal));
			}
			else if(document.getElementById(dom.onLossDecBetBy_RadioBtn).checked)
			{
				let decBetVal = parseFloat(document.getElementById(dom.onLossDecBetBy).value);
				let betSizePercentVal = (currentBetsize/100) * decBetVal;
				return parseFloat((currentBetsize + betSizePercentVal));
			}
		}
	}

	writeStatistic()
	{
		let table = document.getElementById("statistic");

		// Clear the table
		table.innerHTML = "";

		let rows = new Array();
		rows[0] = ["Rolls", this._rollsMade];
		rows[1] = ["Balance before", this._startBalance.toFixed(8)];
		rows[2] = ["Balance after", parseFloat(document.getElementById(dom.balance).value).toFixed(8)]
		rows[3] = ["Profit", parseFloat(this._profit).toFixed(8)];
		rows[4] = ["Highest bet", this._highestBet.toFixed(8)];
		rows[5] = ["Longest win streak", this._longestWinStreak];
		rows[6] = ["Longes lose streak", this._longestLoseStreak];

		// Table rows
		for(let i = 0; i < rows.length; i++)
		{
			let row = table.insertRow(i);
			row.insertCell(0).innerHTML = rows[i][0];
			row.insertCell(1).innerHTML = rows[i][1];
		}
	}

	createChart()
	{
		// Returns an array with numbers between start and end
		// Step: take only every nth element
		function range(start, end, step = 1) {
			const len = Math.floor((end - start) / step) + 1
			return Array(len).fill().map((_, idx) => start + (idx * step))
		}

		// Returns a new array with only every nth element of the array
		function resize(arr, step)
		{
			return arr.filter(function(value, index, arr) {
				return index % step == 0;
			});
		}

		let step = Math.floor(this._chartData.length / 100);
		if(this._chartData.length < 100) {step = 1};
		let reducedRange = range(1, this._chartData.length, step);
		// Make sure the last element of the reduced array contains the last element
		// of original array
		// Otherwise the chart would be misleading
		reducedRange[reducedRange.length-1] = this._chartData.length;

		let reducedArray = resize(this._chartData, step);
		// Make sure the last element of the resized array contains the last element
		// of original array
		// Otherwise the chart would be misleading
		reducedArray[reducedArray.length-1] = this._chartData[this._chartData.length-1];

		var ctx = document.getElementById('chart').getContext('2d');
		this._chart = new Chart(ctx,
		{
			// The type of chart
			type: 'line',

			// The data for the dataset
			data: {
				labels: reducedRange,
				datasets: [{
					label: "BTC",
					borderColor: "#4d423c",
					data: reducedArray
				}]
			},

			// Configuration options
			options: {
				responsive: true,
				maintainAspectRatio: false
			}
		});
		
	}
}

let game = null;

function onStart()
{
	

	if(game.isValidStartCondition())
	{
		game.prepareAutoRoll();
		game.performAutoRoll(false);
		game.writeStatistic();
		game.createChart();
	}
	else
	{
		console.log("Not a valid start condition: Check your inputs.")
	}
}

function onReady()
{
	game = new GameHandler();
	document.getElementById(dom.houseEdge).value = 0.8;
	document.getElementById(dom.balance).value = 0.14;
	document.getElementById(dom.betsize).value = (0.00000001).toFixed(8);
	document.getElementById(dom.payout).value = 1.9;
	document.getElementById(dom.numRolls).value = 100;
	document.getElementById(dom.balHigher).value = 1;
	document.getElementById(dom.balLower).value = 0.01;
	document.getElementById(dom.maxBetsize).value = 0.01;

	let houseEdge = parseFloat(document.getElementById(dom.houseEdge).value)
	let payout = parseFloat(document.getElementById(dom.payout).value)
	let newRollOverVal = calculateRollOverValue(payout, houseEdge);
	let newRollUnderVal = calculateRollUnderValue(payout, houseEdge);
	document.getElementById(dom.rollover).innerHTML = newRollOverVal;
	document.getElementById(dom.rollunder).innerHTML = newRollUnderVal;
}


onReady();
