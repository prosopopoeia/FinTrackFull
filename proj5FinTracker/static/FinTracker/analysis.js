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
});//end addEventListener

var expenseCatTableElems;
var expenseGroupNames;
var currentPeriod;

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
		
		calculateDict(transactions, 'trans_date', 3500, 600, jperiod.ALL, false);
		var jsyear = document.querySelector('#analyze-year');		
		var tdClickAttr = document.createAttribute('onClick');
		tdClickAttr.value = `byYearClicked()`;
		//console.log(`jsyear.text, ${jsyear.value} innerText`);
		jsyear.setAttributeNode(tdClickAttr);
		
	});	
}

function byYearClicked(type = 0, ctype = column.CAT ) {
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
	//console.log(`getCatDAta: cat ${cat} group ${group}`);
	// Get all transactions for current user
	currentPeriod = jsperiod;
	fetch('jsvcat', {
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
		calculateDict(transactions, 'trans_date', 2500, 600, jsperiod, group);
		let transactionDisplayElement = document.querySelector('#top-heading');
		transactionDisplayElement.innerHTML = (cat) ? `${cat}` : `${group}`;
		var jsyear = document.querySelector('#analyze-year');
		var tdClickAttr = document.createAttribute('onClick');
		//console.log(`jsyear.text, ${jsyear.value} innerText`);
		date = jsyear.value + "-01-01";
		//console.log (date);
		//console.log ('date aboveget cat data');
		tdClickAttr.value = `getCatData(cat, group, date, ${jperiod.YEAR})`;
		jsyear.setAttributeNode(tdClickAttr);
	});	
}

function calculateDict(transactions, dbFieldName, width, height, jsperiod, isGroup = false) {
	
	//console.log(`is group: ${isGroup}`);
	unifiedExpenseMap = new Object();
	expenseCountMap = new Object()	
	incomeMap = new Object();
	incomeCount = new Object();
	groupMap = new Object();
	groupCount = new Object();
	
	var tCount = 0;
	var runningTally = 0;
	var incomeTally = 0;
	const regexDateFormat = /\d\d\d\d-\d\d/; ///Remove with TODO#1
	var hasIncomeData = false;
	var hasExpenseData = false;	
	
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
			hasExpenseData = true;
			if(unifiedExpenseMap[tElem])
			{					
				unifiedExpenseMap[tElem] += Math.abs(tAmount);
				++expenseCountMap[tElem];	
				//console.log(`total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);
			}
			else {
				unifiedExpenseMap[tElem] = Math.abs(tAmount);
				expenseCountMap[tElem] = 1;
				
				//console.log(`****Before total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);				
				//console.log(`-----After total: ${runningTally} (${tAmount} -> ${tran['trans_category']}`);
				//console.log(`2: count: ${expensesByDateMap[tdate]} amt: expensesByDateMap[tdate]`);
			}	
			runningTally += Math.abs(tAmount);
		}
		else {
			hasIncomeData = true;
			if (incomeMap[tElem]) {
				incomeMap[tElem] += tAmount;
				incomeCount[tElem] += 1;
			}
			else {
				incomeMap[tElem] = tAmount;	
				incomecount[tElem] = 1;
			}
			incomeTally += tAmount;
		}
		if (isGroup) {
			//console.log(`tran[amt]: ${tran['trans_category']}`); 
			if (groupMap[tran['trans_category']]) {
				//console.log(`tran[cat]: ${tran['trans_amt']}`); 
				groupMap[tran['trans_category']] += Math.abs(tAmount);								
				groupCount[tElem] += 1;
			}
			else {
				//console.log(`tran[amt]: ${tran['trans_amt']}`); 
				groupMap[tran['trans_category']] = Math.abs(tAmount);
				groupCount[tElem] = 1;
			}	
			//console.log(`group: trangroup: ${tran['trans_category']}`);
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
	showGroupAndCatList(expenseCatTableElems, expenseGroupNames, transactionDisplayElement3);
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
    //currElem.innerHTML = '';	
	
    var options = {
          title: ctitle,
		  hAxis: {title: 'month/year', slantedText: 'true'},
		  vAxis: {title: 'amt'},
		  pointSize: '10',
		  theme: 'maximized',		  
		  backgroundColor: '#e6e6e6',
          curveType: 'function',
		  width: cwidth, 
		  height: cheight,
		  //backgroundColor.stroke: 'red',
		  chartArea: {left: 10},
          legend: { position: 'bottom' }
	 };
     var chart = new google.visualization.LineChart(currElem);

     chart.draw(dataMap, options);      
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

function convertMapTotalToAvg(dataMap, dataCounts) {
	var dataMapKeys = Object.keys(dataMap);
	unifiedAvgMap = new Object();
	runningAvg = 0;
	
	var current = 0;
	for (k of dataMapKeys) {
		
		//console.log(`date :  amount in ${k}: ${dataMap[k]} - count for ${k}: ${dataCounts[k]}	 `);
		
		
		current = dataMap[k] /dataCounts[k];
		if(runningAvg) {
			current = (current + dataCounts[k]) / 2;
		
		}
		unifiedAvgMap[k] = current;
		//console.log(`current for ${k}: ${current}, unifiedAvgMapValue: ${unifiedAvgMap[k]}`);
		
		//console.log(`uam = ${unifiedAvgMap[k]}, current = ${current}, dkm = ${dataMap[k]}`);
	}
	return unifiedAvgMap;
}

function formatDataForChart(imap) {
	var tranMapKeys = Object.keys(imap);
	
	var returnList = [["Year", "Expenses"]];////////////////////TBD////////////
	for (k of tranMapKeys) {		
		var kv = [k , imap[k]];
		returnList.push(kv);
	}	
	return google.visualization.arrayToDataTable(returnList);
}

/* TO BE MOVED TO ITS OWN FILE WHEN FINISHED */

function createStats () {
	
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
	figureavg = function (tot, count) {
		return tot / count;
	},
	
	
	
		
};


/*
	average over time
	whether it has risen/declined over time
	highest peak/lowest valley
	comparison of cats within same group
*/

