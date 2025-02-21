document.addEventListener('DOMContentLoaded', function() {
	
	google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(getAllData);
	var topHeading = document.querySelector('#top-heading');
	topHeading.innerHTML = "Budget Over Time";
	var bottomHeading = document.querySelector('#bottom-heading');
	bottomHeading.style.display = 'none';	
	expenseCatTableElems = [];
	expenseGroupNames = [];
	currentPeriod = jperiod.ALL;
	currentType = column.NONE;
});//end addEventListener

var expenseCatTableElems;
var expenseGroupNames;
var currentPeriod;	// is this a year, month, or epoch view?
var currentType; 	// is this a category or group view?

function getAllData(jsperiod = jperiod.ALL, date ="2018-11-11") {
	console.log(`get all data: ${jsperiod}, ${date}`);
	// Get all transactions for current user
	currentPeriod = jsperiod;
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: date,
			jstype: jsperiod
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		
		calculateDict(transactions, 'trans_date', window.screen.width, 600, jperiod.ALL, false, false);
		var jsyear = document.querySelector('#analyze-year');		
		var tdClickAttr = document.createAttribute('onClick');
		tdClickAttr.value = `byYearClicked()`;
		console.log(`getAllData jsyear.text, ${jsyear.value} innerText`);
		jsyear.setAttributeNode(tdClickAttr);
		
	});	
}

function byYearClicked(type = 0, ctype = column.CAT ) {
	console.log(`byYearClicked clicked`);
	var jsyearBox = document.querySelector('#gyf-year');
	date = jsyearBox.value + '-01-01';
	globalDisplayedDate = date;
	currentPeriod = jperiod.YEAR;
	console.log(`byYearClicked: ${type}, ${ctype}`);
	if (type) {
		if (column.CAT) {
			getCatDAta(type, 0, date, jperiod.YEAR);
		}
		else {
			getCatDAta(0, type, date, jperiod.YEAR);
		}
	}
	else {
		getAllData(jperiod.YEAR, date);
	}	
}

function getCatData(cat, group, date = "2018-12-01", jsperiod = jperiod.ALL) {
	console.log(`getCatDAta: cat ${cat} group ${group}`);
	// Get all transactions for current user
	currentPeriod = jsperiod;
	fetchCategories(cat, group, date, jsperiod);
	setUpTable(cat, group, date, jsperiod);
}

async function setUpTable(cat, group, date, jsperiod) {
	fetch('jsvreturnbyyear', {
		method: 'POST',
		body: JSON.stringify({
			jscat: cat,
			jsgrp: group,
			jsdate: date,
			jsperiod: jsperiod		
		})			
	})
	.then(response => response.json())
	.then(items => {
		
		//for (it of items["items"])
			console.log(items["2018"]["trans_amt__sum"]);
		console.log(items["2018"][0]);
		let ox = items["2018"];
		for (butt of ox) {
			console.log(butt);
		}
		
		let indy = ox.search(/\d/);
		let chibby = ox.substring(indy,5);
		console.log(indy);
		let glibby = ox.substr(5,indy);
		console.log(chibby);
		console.log(glibby);
//		ighty = items["2018"];
		
		//console.log(items["thing"][0]);
		//console.log(items["thing"]["2018"]);
		console.log(ox);
			//displayCTrans(tranny);
		//}
	});		
}



async function fetchCategories(cat, group, date, jsperiod) {
	const response = await fetch('jsvcat', {
	method: 'POST',
	body: JSON.stringify({
		jscat: cat,
		jsgrp: group,
		jsdate: date,
		jsperiod: jsperiod		
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		var bottomHeading = document.querySelector('#bottom-heading');
		bottomHeading.style.display = 'block';
		console.log(`group: ${group}`);
		calculateDict(transactions, 'trans_date', window.screen.width, 600, jsperiod, group, cat);
		let transactionDisplayElement = document.querySelector('#top-heading');
		transactionDisplayElement.innerHTML = (cat) ? `${cat}` : `${group}`;
		var jsyear = document.querySelector('#analyze-year');
		var tdClickAttr = document.createAttribute('onClick');
		//console.log(`jsyear.text, ${jsyear.value} innerText`);
		date = jsyear.value + "-01-01";
		//console.log (date);
		//console.log ('date aboveget cat data');
		tdClickAttr.value = `getCatData(${cat}, ${group}, ${date}, ${jperiod.YEAR})`;
		jsyear.setAttributeNode(tdClickAttr);			
	});	
}

function calculateDict(transactions, dbFieldName, width, height, jsperiod, isGroup = false, isCat = false) {
	
	console.log(`calculateDict: is group: ${isGroup}`);
	unifiedExpenseMap = new Object();
	expenseCountMap = new Object()	
	incomeMap = new Object();
	incomeCount = new Object();
	
	groupMap = new Object();
	groupCount = new Object();
	catMap = new Object();
	catCount = new Object();
	
	var tCount = 0;
	var runningTally = 0;
	var incomeTally = 0;
	const regexDateFormat = /\d\d\d\d-\d\d/; ///Remove with TODO#1
	var hasIncomeData = false;
	var hasExpenseData = false;	
	var lowestValuePairGroup = new Map();
	var highestValuePairGroup = new Map();
	var lowestValuePairCat = new Map();
	var highestValuePairCat = new Map();
	
	var statList = [];
	
	while (tran = transactions[tCount++]) {
		
		tAmount = parseFloat(tran['trans_amt']);
		tElem = tran[`${dbFieldName}`];		// if always using date... then don't need this
		
		//don't need this with changes - TODO#1 confirm TODO TODO TODO TODO
		if (tElem.match(regexDateFormat) && jsperiod == jperiod.ALL) {
			tElem = tElem.match(regexDateFormat);			
		}				
		
		
		let elemNotInList = Boolean(expenseCatTableElems.indexOf(tran['trans_category']) == -1);
		//console.log(`outer appended: ${tran['trans_category']}, innner bool: ${elemNotInList}, ${expenseCatTableElems.indexOf(tran['trans_category']) == -1}`	);
		if (elemNotInList) {		
			expenseCatTableElems.push(tran['trans_category']);
			
			if (Boolean(expenseGroupNames.indexOf(tran['trans_group']) == -1)) {
				//console.log(`Inner TWO appended: ${tran['trans_group']}`);
				expenseGroupNames.push(tran['trans_group']);
			}
			//console.log(`Inner TWO appended: ${tran['trans_category']}, innner bool: ${elemNotInList}, ${expenseCatTableElems.indexOf(tran['trans_category']) == -1}`	);
		}
		
		if (tAmount < 0) {
			tAmount = Math.abs(tAmount);
			hasExpenseData = true;
			if(unifiedExpenseMap[tElem])
			{					
				unifiedExpenseMap[tElem] += tAmount;
				++expenseCountMap[tElem];	
				//console.log(`total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);
			}
			else {
				unifiedExpenseMap[tElem] = tAmount;
				expenseCountMap[tElem] = 1;
				
				//console.log(`****Before total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);				
				//console.log(`-----After total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);
				//console.log(`2: count: ${expensesByDateMap[tdate]} amt: expensesByDateMap[tdate]`);
			}	
			runningTally += tAmount;
		}
		else {
			hasIncomeData = true; //TODO -> If there is a positive value, even if not income, this will be set true and destroy display
			if (incomeMap[tElem]) {
				incomeMap[tElem] += tAmount;
				incomeCount[tElem] += 1;
			}
			else {
				incomeMap[tElem] = tAmount;	
				incomeCount[tElem] = 1;
			}
			incomeTally += tAmount;
		}
		if (isGroup) {
			console.log(`tran[amt]: ${tran['trans_category']}`); 
			let transactionCategory = tran.trans_category;
			if (groupMap[transactionCategory]) {
				//console.log(`tran[cat]: ${tran['trans_amt']}`); 
				groupMap[tran['trans_category']] += tAmount;								
				groupCount[tran.trans_category] += 1;
				
				// if there is a highest/lowest value for the category, and it is greater/less than
				// the existing value, then it becomes the new value				
				if(highestValuePairGroup.get(tran.trans_category)
				&& highestValuePairGroup.get(tran.trans_category) < tAmount)
				{
					highestValuePairGroup.set(tran.trans_category, tAmount); 
				}
				if(lowestValuePairGroup.get(tran.trans_category) 
				&& lowestValuePairGroup.get(tran.trans_category) > tAmount)
				{
					lowestValuePairGroup.set(tran.trans_category, tAmount); 
				}
				//console.log(`groupmap: ${tran.trans_category} :: ${groupCount.trans_category}`);
			}			
			else {
				//console.log(`tran[amt]: ${tran['trans_amt']}`); 
				groupMap[tran['trans_category']] = tAmount;
				groupCount[tran.trans_category] = 1;
				highestValuePairGroup.set(tran.trans_category, tAmount);
				lowestValuePairGroup.set(tran.trans_category, tAmount);
				
			}	
			//console.log(`group: lowest: ${highestValuePairGroup.get(tran.trans_category)} ${tran['trans_category']}`);
		}
		else if (isCat) {
				if(catMap[tran.trans_date]) {
					
				}
				else {
					
				}
				
		}
	} //END while(transactions)
		
	let transactionDisplayElement = document.querySelector('#sub1');
	let transactionDisplayElement2 = document.querySelector('#section2');
	
	if (hasIncomeData && !hasExpenseData) {
		//console.log(`hasExpenseData && !hasIncomeData`);
		displayGraph(formatDataForChart(incomeMap), 'section1' , 'Monthly Income', width, height);		
		transactionDisplayElement.style.display = 'none';	
		showTotal(incomeTally.toFixed(2), 'sub2');
	}	
	else if (hasExpenseData && !hasIncomeData && isGroup) {
		//console.log(`hasExpenseData && !hasIncomeData && isGroup`);
		transactionDisplayElement.style.display = 'none';	
		displayGraph(formatDataForChart(unifiedExpenseMap), 'section1', 'Expenses by Group', width, height);			
		displayGraph(formatDataForChart(groupMap), 'section2', 'Breakdown by Category', width, height);	
		showTotal(runningTally.toFixed(2), 'sub2');
		statList = buildStatList(groupMap, groupCount, runningTally, expenseCountMap, highestValuePairGroup, lowestValuePairGroup);
		
	}
	else if (hasExpenseData && !hasIncomeData) { //this is the case when showing a category//
		//console.log(`hasExpenseData && !hasIncomeData`);
		displayGraph(formatDataForChart(unifiedExpenseMap), 'section1', 'Category Expenses', width, height);	
		transactionDisplayElement.style.display = 'none';
		transactionDisplayElement2.style.display = 'none';
		showTotal(runningTally.toFixed(2), 'sub2');
	}
	else {
		displayGraph(formatDataForChart(incomeMap), 'section1' , 'Monthly Income', width, height);
		showTotal(incomeTally.toFixed(2), 'sub1');
		displayGraph(formatDataForChart(unifiedExpenseMap), 'section2', 'Monthly Cumulative Expense Total', width, height);	
		showTotal(runningTally.toFixed(2), 'sub2');
	}
	
	let transactionDisplayElement3 = document.querySelector('#displayBody');
	//console.log(`expenseCatElements: ${expenseCatTableElems}, ${expenseGroupNames}`);
	clearTable();
	statList.forEach(showStats);
	showGroupAndCatList(expenseCatTableElems, expenseGroupNames, transactionDisplayElement3);
}

function clearTable() {
	var htmlTarget = document.querySelector('#sub2b');
	htmlTarget.innerHTML = "";
}
function showStats(stat) {
	
	var statTable = document.createElement('table');
	var statTableAttr = document.createAttribute('class');
	statTableAttr.value = 'table table-bordered table-striped';
	statTable.setAttributeNode(statTableAttr);
	
	/* var statCaption = document.createElement('caption');
	statCaption.innerHTML = stat.name;
	statTable.append(statCaption); */
	
	var statNameTR = document.createElement('tr');
	var statNameTD = document.createElement('td');
	var snh3 = document.createElement('h3');
	snh3.innerHTML = "Category: " + stat.name;
	statNameTD.append(snh3);
	statNameTR.append(statNameTD);
	statTable.append(statNameTR);
	
	var statCountTR = document.createElement('tr');
	var statCountTD = document.createElement('td');
	
	var sch5 = document.createElement('b');
	sch5.innerHTML = `Count: ${stat.count}`; 
	statCountTD.append(sch5);
	statCountTR.append(statCountTD);
	statTable.append(statCountTR);
	
	
	var statTotalTR = document.createElement('tr');
	var statTotalTD = document.createElement('td');
	
	var sth5 = document.createElement('b');
	sth5.innerHTML = "Total: " + formatToUSDollar(stat.total);
	statTotalTD.append(sth5);
	statTotalTR.append(statTotalTD);
	statTable.append(statTotalTR);
	
	
	var statAvgTR = document.createElement('tr');
	var statAvgTD = document.createElement('td');
	
	var ab = document.createElement('b');
	ab.innerHTML = "Average: " + formatToUSDollar(stat.avg);
	statAvgTD.append(ab);
	statAvgTR.append(statAvgTD);
	statTable.append(statAvgTR);
	
	
	var statHighTR = document.createElement('tr');
	var statHighTD = document.createElement('td');
	
	var highb = document.createElement('b');
	highb.innerHTML = "highest: " + formatToUSDollar(stat.highest);
	statHighTD.append(highb);
	statHighTR.append(statHighTD);
	statTable.append(statHighTR);
	
	var statLowTR = document.createElement('tr');
	var statLowTD = document.createElement('td');
	
	var lowb = document.createElement('b');
	lowb.innerHTML = "Lowest: " + formatToUSDollar(stat.lowest);
	statLowTD.append(lowb);
	statLowTR.append(statLowTD);
	statTable.append(statLowTR);
	
	
	var htmlTarget = document.querySelector('#sub2b');
	htmlTarget.append(statTable);
	
	
	/* querySelector('#sub2b-target');
	
	var stH3 = document.createElement('h3');
	stH3.innerHTML = stat.name;
	statCaption.append(stH3);
	 */
}

function buildStatList(groupMap, groupCount, runningTally, expenseCountMap, highMap, lowMap) {
	/*groupCount:      count for number of members of category*/
	/*expenseCountMap: count of total number of transactions for given date*/
	var groupMapKeys = Object.keys(groupMap);
	console.log(`k: ${k}, v: ${groupMap[k]}, count: ${groupCount}`);
	catStatList = [];	
	
	for (k of groupMapKeys) {		
		let catstat = {};
		catstat.name = k;
		catstat.desc = "";
		catstat.count = groupCount[k];
		catstat.total = groupMap[k];
		catstat.avg = catstat.total / catstat.count;
		catstat.highest = highMap.get(k);		
		catstat.lowest = lowMap.get(k);
		
		//console.log(`k: ${k}, v: ${groupMap[k]}, count: ${groupCount[k]}`);
		catStatList.push(catstat);
		
	}	
	//console.log(catStatList);
	return catStatList
}



function getCurrentAvg(numberOfEntries, currentAvg, entryToAdd) {
	
	var returnValue = currentAvg * --numberOfEntries;
	returnValue += entryToAdd;
	return returnValue / ++numberOfEntries;
}

///TODO UNUSED////
/*function setUpYearSearch() {
	var today = formatTodaysDate();
	
	//var leftHeading = document.querySelector('#left-heading');
	
	var jsyear = document.querySelector('#gyf-year');
	var tdClickAttr = document.createAttribute('onClick');
	tdClickAttr.value = `getAllData(${jperiod.YEAR}, ${jsyear.text})`;
	jsyear.setAttributeNode(tdClickAttr);
	
}*/

function showTotal(total, totalDisplayElement, isGroup = false) {
	//totalDisplayElement.append(total);
	
	elem = document.querySelector(`#${totalDisplayElement}`);
	elem.innerHTML = '';
	var h3elem = document.createElement('h3');
	//var divelem = document.createElement('div');
		
	h3elem.append(formatToUSDollar(total));
	//divelem.append(h3elem);
	
	//var posAttr = document.createAttribute('
	
	elem.append(h3elem);	
}

function formatToUSDollar(value) {
	const dollars = new Intl.NumberFormat(`en-US`, {
		currency: `USD`,
		style: 'currency',
	}).format(value);
	return dollars;
}

function displayGraph(dataMap, elem, ctitle, cwidth, cheight) {
	
	//console.log(`displayGraph: ${elem}`)
	currElem = document.getElementById(elem)
    	
    var options = {
          title: ctitle,
		  hAxis: {title: 'month/year', slantedText: 'true'},
		  vAxis: {title: 'amt'},
		  pointSize: '6',
		  theme: 'maximized',		  
		  backgroundColor: '#e6e6e6',		  
		  trendlines: {
			1: {
			  type: 'linear',
			  color: 'green',
			  lineWidth: 30,
			  opacity: 1,
			  showR2: true			  
			}
		  },
          series: {
			  1: {curveType: 'function'}
		  },
		  width: cwidth, 
		  height: cheight,
		  //backgroundColor.stroke: 'red',
		  chartArea: {left: 10},
          legend: { position: 'bottom' }
	 };
    
	var chart2 = new google.visualization.ColumnChart(currElem);
	//var chart = new google.visualization.LineChart(currElem);
    
	chart2.draw(dataMap, options);
	//chart.draw(dataMap, options); 
}

function showGroupAndCatList(list1, list2, transactionDisplayElement) {
	//console.log(`Outer: ${tran['trans_category']}, indexOf: ${expenseCatTableElems.indexOf(trElem)} bool: ${expenseCatTableElems.indexOf(trElem) == -1}`);
	
	//tdElem.append(tran['trans_category']);
	//
	transactionDisplayElement.innerHTML = "";
	
	var heading2 = document.createElement('h2');
	heading2.append("cli>ck to displya")
	var tableHeading = document.querySelector("#table_heading");
	tableHeading.innerHTML = "";
	tableHeading.append(heading2);
	
	for (let i = 0; i < list1.length - 1; i++) {
		var trElem = document.createElement('tr');
		var tdElem1 = document.createElement('td');
		var tdElem2 = document.createElement('td');
		tdElem1.append(list1[i]);
		if (list2[i])		
			tdElem2.append(list2[i]);
			
		var tdClickAttr = document.createAttribute('onClick');
		var tdClickFunction = `getCatData('${list1[i]}', 0, globalDisplayedDate, ${currentPeriod})`;
		tdClickAttr.value = tdClickFunction;
		tdElem1.setAttributeNode(tdClickAttr);
		
		var tdClickAttr2 = document.createAttribute('onClick');
		var tdClickFunction2 = `getCatData(0, '${list2[i]}', globalDisplayedDate, ${currentPeriod})`;
		tdClickAttr2.value = tdClickFunction2;
		tdElem2.setAttributeNode(tdClickAttr2);
		
		trElem.append(tdElem1);
		trElem.append(tdElem2);		
		transactionDisplayElement.append(trElem);
	}	
}


///TODO - DONT THINK THIS IS USED, HAVEN'T TESTED THOUROUGHLY BUT LIKELY CAN BE REMOVED
function convertMapTotalToAvg(dataMap, dataCounts) {
	console.log(`CALLED convertMapTotalToAvg - IT IS NEEDED AFTERALL `);
	// var dataMapKeys = Object.keys(dataMap);
	// unifiedAvgMap = new Object();
	// runningAvg = 0;
	
	// var current = 0;
	// for (k of dataMapKeys) {
		
		// //console.log(`date :  amount in ${k}: ${dataMap[k]} - count for ${k}: ${dataCounts[k]}	 `);
		
		
		// current = dataMap[k] /dataCounts[k];
		// if(runningAvg) {
			// current = (current + dataCounts[k]) / 2;
		
		// }
		// unifiedAvgMap[k] = current;
		// //console.log(`current for ${k}: ${current}, unifiedAvgMapValue: ${unifiedAvgMap[k]}`);
		
		// //console.log(`uam = ${unifiedAvgMap[k]}, current = ${current}, dkm = ${dataMap[k]}`);
	// }
	// return unifiedAvgMap;
}

function formatDataForChart(imap) {
	var tranMapKeys = Object.keys(imap);
	var runningAvg = imap[tranMapKeys[0]]; //INIT WITH LATEST VALUE
	let numberOTrannies = 1;
	let totes = imap[tranMapKeys[0]];
		//console.log(`imap ${tranMapKeys[0]}: ${imap[tranMapKeys[0]]} `);
	var returnList = [["Year", "Expenses"]];////////////////////TBD////////////
	for (k of tranMapKeys) {
		//Get rid of outliers:
		let dollarAmt = imap[k];
		let shortDate = k.slice(5,7) + "/" + k.slice(2,4);
		
		if(dollarAmt > (runningAvg * 3.1 )) {
				//console.log(`hit2 ${dollarAmt}, greatest: ${runningAvg}`);
				shortDate = '!!'
				dollarAmt = 0;
		}
		else {
			totes += dollarAmt;
			numberOTrannies += 1;
			runningAvg = totes/numberOTrannies;
		}		
				
		let kv = [shortDate , dollarAmt];
		returnList.push(kv);
	}	
	
	//console.log(`returnList: ${returnList} `);
	//console.log(`imap: ${tranMapKeys}`);
	return google.visualization.arrayToDataTable(returnList);
}

/* TO BE MOVED TO ITS OWN FILE WHEN FINISHED */

// function createStats () {
	
// }


function displayCTrans(row, ctarget) {
	//incoming: [0cat, 1total, 2%income, 3%expenses, 4diff, 5%ofother ]
	//console.log(`tname ${row[0]}, ${row[1]} : amt ${row[2]}, ${row[3]}, ${row[4]}, 6: ${row[5]} $row[6]`);
	
	var tr1 = document.createElement('tr');
	
	var tran_group_val = row[0];
	var td0 = document.createElement('td');
	var div0 = document.createElement('div');
	var div0ClickAttr = document.createAttribute('onClick');
	var div0Function = `catCompare('${tran_group_val}', '${row[6]}')`;
	div0ClickAttr.value = div0Function;
	div0.setAttributeNode(div0ClickAttr);
	
	div0.innerHTML = tran_group_val;
	td0.append(div0);	
	
	var td1 = document.createElement('td');
	var div1 = document.createElement('div');
	div1.innerHTML = row[1];
	td1.append(div1);
	
		
	/////////////table elements/////////////
	
	///Description/Msg///			
	var td2 = document.createElement('td');
	var div2 = document.createElement('div');
	div2.innerHTML = row[2];
	td2.append(div2);
		YYYYYYYYYYYYY
	
		
	///Amount///	
	
	var td3 = document.createElement('td');
	var div3 = document.createElement('div');
	div3.innerHTML = row[3]; 	
	td3.append(div3);
	
	var td4 = document.createElement('td');
	var div4 = document.createElement('div');
	div4.innerHTML = row[4]; 	
	td4.append(div4);
	
	
	var td5 = document.createElement('td');
	var div5 = document.createElement('div');
	div5.innerHTML = row[5]; 	
	td5.append(div5);

	
	
	tr1.append(td0);
	tr1.append(td1);
	tr1.append(td2);
	tr1.append(td3);
	tr1.append(td4);
	tr1.append(td5);
	
	//tr1.append(td4);
	//tr1.append(td5);	
	//console.log(`${ctarget} is targ`);
	var transRows = document.querySelector(ctarget);
	transRows.append(tr1);
	
	// let currentDate = new Date();
	// console.log(currentDate);		
}



const CatStats = {
	name : "",
	desc: "",
	count: 0,
	total: 0,
	avg: 0,
	largest: 0,
	smallest: 0,
	dateStart: "",
	dateEnd: "",
	
	createCatStats: function(name, desc, count, total) {
		this.name = name;
		this.desc = desc;
		this.count = count;
		this.total = total;
		
	},
	
	setDates: function(start = "", end = "") {
		this.dateStart = start;
		this.dateEnd = end;
	}
	
	
};

const StatMethods = {
	figureavg:  function (tot, count) {
		return tot / count;
	}
	
	
	
		
};


/*
	average over time
	whether it has risen/declined over time
	highest peak/lowest valley
	comparison of cats within same group
*/

