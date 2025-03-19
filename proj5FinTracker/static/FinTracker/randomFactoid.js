document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	
	///things this will do:
	// comparator section
	// 1 - show % of income + % of spending
	// 2 - cmp - increase/decrease + amt + percentage
	// 
	////////////////
	// all data
	// 1. show amt of each year, totals
	// 2. income of each year totals
	
	//google.charts.load('current', {'packages':['corechart']});
	/////HERE IS CALL TO INITIAL LOADING	
	//google.setOnLoadCallback(getTransactionsInRange);
	
	// form to get range
	var yearCompare = document.querySelector('#compare-form');
	yearCompare.addEventListener('submit', loadCompareData);

	var removeCat = document.querySelector('#remove-from-factoids-form');
	removeCat.addEventListener('submit', loadCompareData);

	var backToCompareButton = document.querySelector('#previous');
	backToCompareButton.style.display = 'none';
	
	var displayArea = document.querySelector('#display-area');
	displayArea.style.display = 'none';
	
});//end addEventListener	

// put calculated values in here so don't have to re-calc each time
var calcCache = new Map();
var globalDisplayedDate;
var globalDisplayedDate2;
var lock = 0;

var globalMap = new Map();
var globalAggs = new Map();


//period aggregates
var periodIncome = [0,0];
var periodExpense = [0,0];


var currentPeriodType = jperiod.MONTH; // gets updated on submit in loadCompareData() ^|

//* 
// TODO
// SAVE/EDIT FUNCTION ARE NOT COMPATIBLE DUE TO CHART LOGIC

function getTextMonth(month_ord) {
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return months[month_ord - 1];   
}

function loadCompareData(event) {
	event.preventDefault();
	
	periodExpense[0] = periodExpense[1] = 0;
	periodIncome[0] = periodIncome[1] = 0;
	
	console.log(`loadCompareData: ${event.submitter.id} is submitter`);
		
	var transRows = document.querySelector("#target").innerHTML = '';
	var transRows = document.querySelector("#rtarget").innerHTML = '';
	
	var displayArea = document.querySelector('#display-area');
	displayArea.style.display = 'block';
	
	var backToCompareButton = document.querySelector('#previous');
	backToCompareButton.style.display = 'block';
	console.log(`before if`);
	if ((event.submitter.id == "compare-button") || event.submitter.id == "restart-button") {
		console.log(`in if`);
		var v1 = document.querySelector('#value1')
		var v2 = document.querySelector('#value2')
				
		let strVal1 = v1.value.toString();
		let strVal2 = v2.value.toString();
		//console.log(strVal1);
		if (strVal1.length == 4) { //compare year
			currentPeriodType = jperiod.YEAR;
			strVal1 = strVal1.concat("/11/11");
			strVal2 = strVal2.concat("/11/11");
		}
		else if (strVal1.length == 7) {//compare month
			currentPeriodType = jperiod.MONTH;
			strVal1 = strVal1.concat("/11");
			strVal2 = strVal2.concat("/11");
		}
		else if (strVal1.length == 10) {//compare day
			currentPeriodType = jperiod.DAY;		
		}		
		
		globalDisplayedDate = strVal1;
		globalDisplayedDate2 = strVal2;
		console.log(`after getDataCount: ${strVal1}, ${strVal2}`);
		getDataCount("#term1a", strVal1, "" );
		getDataCount("#term2a", strVal2, "");
		//console.log(`after getDataCount: ${dateSet1}, ${dateSet2}`);
		loadSomeFunFactoids(strVal1, strVal2);		
	}
	else {
		var v1 = document.querySelector('#remover');
		// grocery "fast casual"
		console.log(`before else`);
		let excludedItems = v1.value.toString().split(" ");
		let excludes = [];
		//let qExclusions = excludedItems.split("\"");
		//let exes = [];
		//console.log(qExclusions);
		for (index in excludedItems) {
		    //console.log(ex);
			if (excludedItems[index].includes("_")) {
				excludes = excludedItems.filter(item => item != excludedItems[index]);
			}
			excludes.push(excludedItems[index].replace("_", " "));
			//ex.push(ex.trim());
		}
		//[grocery , fast casual]
		//let splitExclusions = excludedItems.split(" ");
		console.log(`exclusio: ${excludes}`)
		//console.log(`exclusions: ${exes[2]} --  ${exes[0]} -- ${exes[1]} ---> exes: ${exes}`)
		//console.log(`exclusions: ${splitExclusions[2]}, ${splitExclusions}, ${splitExclusions[0]}, ${splitExclusions[1]}`)
		console.log(`exclusions: ${excludedItems[2]}, ${excludedItems}, `)
		let exclusionAmt = [];
		//console.log(`else path ${excludedItems} is submitter`);
		//use the global data, we are doing a removal
		// for each
		//	if (not removed item)
			// factoidMap.forEach((amt, transactionName) => {
		// //console.log(`3 elemes: ${}, ${transactionName}, ${factoidMap2.get(transactionName)}`)
		// rowDataArray = createRowOfData(amt[0], amt[1], transactionName, periodExpense[0], periodIncome[0], amt[2]);
		// //console.log(`3 elemes: ${rowDataArray[1][0]}, ${rowDataArray[2]}`);
		// displayCTrans(rowDataArray, "#target");
		// console.log(`about to make row o' data with ${amt[2]}`)
		// rowDataArray = createRowOfData(amt[1], amt[0], transactionName, periodExpense[1], periodIncome[1], amt[2]);
		// globalMap.set(transactionName, rowDataArray);
		// displayCTrans(rowDataArray, "#rtarget");
	// });
		getDataCount("#term1a", globalDisplayedDate, "", column.NONE, excludes);
		getDataCount("#term2a", globalDisplayedDate2, "", column.NONE, excludes);
		globalMap.forEach((v,k) => {
			//console.log(`type of v7, gdd: ${typeof v[7]},${v[7]} ${typeof globalDisplayedDate},${globalDisplayedDate} ${v[7] == globalDisplayedDate} loccomp: ${v[7].localeCompare(globalDisplayedDate) === 0}`);
			//console.log(`${v[7]} == ${v[0]},  ${k} is submitter, exclusion: ${excludedItems}`);
			if(!excludedItems.includes(v[0])) {	//v[0] has the category, v[7] has the date
				if (v[7].localeCompare(globalDisplayedDate) === 0) {
					displayCTrans(v, "#target");
					//console.log(`date: ${v[7]} == ${globalDisplayedDate} comparatorKey ${k} is submitter`);
				}
				else {
					displayCTrans(v, "#rtarget");
					//console.log(`elsa date: ${v[7]} == ${globalDisplayedDate} comparatorKey ${k} is submitter`);
				}				
			}
			else {
				//console.log(`excluded ${excludedItems} `);
				// exclusion.push(v[1]);
				// exclusion.push(v[2]);
				// exclusion.push(v[1]);
			}
			//console.log(`outside ifs n elses date: ${v[7]} == ${globalDisplayedDate} comparatorKey ${k} is submitter`);
			//console.log(`${v[7]} == ${v},  ${k} is submitter`);
			//console.log(`${v[7]} == ${v},  ${k} is submitter`);
		});	
		
	}
}

function getDataCount(elem, pdate = 0, ucategory = "", COLUMN_TYPE = column.NONE, exclusions = "") {
	//get number of trasactions for given category
	console.log(`called getDataCount: ${pdate}, exc--------------------->${exclusions}`);
	//var dataObject = new Map();
	var returnCount = 0;
	
	//jsv will return:
	// avgSpent
	// * count
	// * least value
	   // * most value
	   // * sum
	   // * income
	   // * most expensive item
	   // * date this was purchased?
	   //interface:	   
 
	fetch('/jsvgetaggs', {
		method: 'POST',
		body: JSON.stringify({
			jsctype: COLUMN_TYPE,
			jsdate: pdate,
			jsdate: pdate,
			jscat: ucategory,
			jstype: currentPeriodType,
			jsexclusion: exclusions
		})
	})
	.then(response => response.json())
	.then(result => {
		//aggs has: transaction average, least from period, total spent, income:agsumPos, most expensive, cheapest
		//console.log(`about to return from then:agcount ${result['agcount']} also agavg${result['agavg']}`);
		var somb = result['totalSpent'];
		console.log(`result object: debitsV.expense ${result['agsum']}, total spent ${somb}`);
		
		if (periodExpense[0] == 0)
			periodExpense[0] = Math.abs(result['totalSpent']);
		else
			periodExpense[1] = Math.abs(result['totalSpent']);
		
		if (periodIncome[0] == 0)
			periodIncome[0] = Math.abs(result['agsumPos']);
		else
			periodIncome[1] = Math.abs(result['agsumPos']);
		
		let USDollar = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		});
		var cIncome = USDollar.format(result['agsumPos']);
		var mostExpensiveEntry = USDollar.format(Math.abs(result['agmin']));
		var totalSavings = USDollar.format(result['agsum']);		
		var spent = USDollar.format(Math.abs(result['totalSpent']))	;		
		var pavg = result['agsum'] / 12;
		var avgSpent = USDollar.format(Math.abs(pavg));
		var percentSaved = (result['agsum']/result['agsumPos']) * 100;
		//console.log(percentSaved);
		var percentSavedFormatted = Number(percentSaved/100).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 
		//console.log(percentSavedFormatted);
		var periodDate = (currentPeriodType == jperiod.YEAR) ? 
				`${pdate.slice(0,4)}` : `${getTextMonth(pdate.slice(5,7))}, ${pdate.slice(0,4)}`; 
		
		globalAggs.set("cat", ucategory);
		globalAggs.set("count", result['agcount']);
		globalAggs.set("income", cIncome);
		globalAggs.set("mostExpensive", mostExpensiveEntry);
		globalAggs.set("meitem1",result['mostExpensiveItem1']);
		globalAggs.set("meitem2",result['mostExpensiveItem2']);
		globalAggs.set("totalSavings", totalSavings);
		globalAggs.set("spent", spent);
		globalAggs.set("avg", pavg);
		globalAggs.set("avgSpent", avgSpent);
		globalAggs.set("percentSaved", pavg);
		globalAggs.set("periodDate", periodDate);
		globalAggs.set("percentSavedFormatted", percentSavedFormatted);
		
		cspot = document.querySelector(elem);
		cspot.innerHTML = setAggregateDisplay(elem);
	});
}
		
function setAggregateDisplay() {
		var message1a = (globalAggs.get("cat") == "") ? 
			` <br>Total Entries: ${globalAggs.get("count")}` : 
			` <br>Number of ${globalAggs.get("cat")} transactions: ${globalAggs.get("count")}`;
		
		
		var message1b = ` <br>Credits (Income, Gifts, Investments, etc.): ${globalAggs.get("income")}`;
		var message1b2 = `<br>Expenses: ${globalAggs.get("spent")}`;
		
		var message1c = (globalAggs.get("cat") == "") ?
			` <br>Most expensive entry: ${globalAggs.get("mostExpensive")} (${globalAggs.get("meitem1")}, ${globalAggs.get("meitem2")})` : 
			` <br>Most expensive ${globalAggs.get("cat")} transaction: ${globalAggs.get("mostExpensive")} on ${globalAggs.get("meitem2")} (${globalAggs.get("meitem1")})`;
			
		var message1d = (globalAggs.get("cat") == "") ?
			` <br>Total Saved (Credits - Debits): ${globalAggs.get("totalSavings")}` : 
			(globalAggs.get("cat") == "income") ?
				` <br>Total ${globalAggs.get("cat")}: ${globalAggs.get("totalSavings")}` :
				` <br>Total amount spent on ${globalAggs.get("cat")}: ${globalAggs.get("totalSavings")}`;

		var message1e = (globalAggs.get("cat") == "") ?
			'' :  
			(globalAggs.get("avSpent")) ? 
				` <br>Average amount of each ${globalAggs.get("cat")}(s) transaction: ${globalAggs.get("avSpent")}`
				: '';
		
		var message1g = (globalAggs.get("cat") == "") ?
			` <br>Percentage of income saved: ${globalAggs.get("percentSavedFormatted")}` : 
			` <br> - `;
		
		var msg = "";
		msg += globalAggs.get("periodDate");
		msg += message1a;
		msg += message1b;
		msg += message1b2;
		if (globalAggs.get("mostExpensive") < 0)
			msg += message1c;
		msg += message1d;
		msg += message1e;
		msg += message1g;
		
		return msg;	
}
	

async function fetchTrannys(pdate) {
  const response = await fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jstype: currentPeriodType
		})			
	});	
	
	const returnData = await response.json();	
	return returnData;
}

function loadSomeFunFactoids(pdate1 = 0, pdate2 = 0) {
	
	globalMap.clear()
	
	let factoidMap1 = new Map();
	let factoidMap2 = new Map();	
	let vobe = new Map();
		
	fetchTrannys(pdate1)
	.then(result1 => {			
		factoidMap1 = processTrannys(result1, null);		
		
		fetchTrannys(pdate2)
		.then(result2 => {					
			factoidMap2 = processTrannys(result2, factoidMap1);			
			displayment(factoidMap2, pdate1, pdate2);			
			});		
		});			
}

function displayment(factoidMap, pdate1, pdate2) {
	//console.log(`3 elemes: ${periodExpense[0]}, ${periodExpense[1]}, ${periodIncome[0]}, ${periodIncome[1]}`)
	// factoid map has:
	// 	-Key=CategoryName, 
	//  -Val=[period1's expense, period2's expense, groupName]
	
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'none';
	
	
	//TODO, sort out these functions
	var elcat = document.querySelector('#lcat')
	elcat.addEventListener('click', () => sortByColumn(factoidMap, column.CAT, pdate1, currentPeriodType));
	
	var ercat = document.querySelector('#rcat')
	ercat.addEventListener('click', () => sortByColumn(transactions, column.CAT, pdate, currentPeriodType));
			
	var eltot = document.querySelector('#ltotal')
	eltot.addEventListener('click', () => sortByColumn(transactions, column.AMT, pdate, currentPeriodType));

	var ertot = document.querySelector('#rtotal')
	ertot.addEventListener('click', () => sortByColumn(transactions, column.AMT, pdate, currentPeriodType));
	
	// at this point in execution factoid maps contain:
	// 
	// 2. map of categories/group [k-name, v-amount,amount,groupName]
	var rowDataArray = [];
	factoidMap.forEach((amt, transactionName) => {
		//console.log(`3 elemes: ${}, ${transactionName}, ${factoidMap2.get(transactionName)}`)
		rowDataArray = createRowOfData(amt[0], amt[1], transactionName, periodExpense[0], periodIncome[0], amt[2], pdate1);
		let key = transactionName + pdate1;
		globalMap.set(key, rowDataArray);
		//console.log(`sent1:  ${amt[0]}, ${amt[1]} ${periodExpense[0]} ${periodIncome[0]} ${amt[2]}, pdat1 ${pdate1}`);
		displayCTrans(rowDataArray, "#target");
		//console.log(`about to make row o' data with ${amt[2]}`)
		rowDataArray = createRowOfData(amt[1], amt[0], transactionName, periodExpense[1], periodIncome[1], amt[2], pdate2);
		//console.log(`sent2:  ${amt[1]}, ${amt[0]} ${periodExpense[1]} ${periodIncome[1]} ${amt[2]}, pdate ${pdate2} `);
		key = transactionName + pdate2;
		globalMap.set(key, rowDataArray);
		//console.log(`2about to make row o' data with ${globalMap.get(transactionName)}, ${rowDataArray}`)
		displayCTrans(rowDataArray, "#rtarget");
	});
	// factoidMap.forEach((amt, transactionName) => {
		// displayCTrans(amt[1], transactionName, "#rtarget");
	// });	
}
// 100 10  100 = ? * 10 || 10 = ? * 100
function createRowOfData(amt1, amt2, name, expense, income, groupName, pdate){
	//USDollar.format(Math.abs(result['agmin']));
	let USDollar = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		});
	rowDataArray = [];
	rowDataArray.push(name);
	rowDataArray.push(USDollar.format(amt1));
	var percentOfIncome = amt1/income * 100;
	///////////////
	//console.log(`3 elemes: income ${income}, expense ${expense}, 1[0] , a1 ${amt1}  % o i ${percentOfIncome}`);
	//////////
	percentOfIncome = Number(percentOfIncome/100).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 
	//console.log(`percentOfincome: % o i ${percentOfIncome}`);
	rowDataArray.push(percentOfIncome);
	var percentOfSpend = amt1/expense * 100; 
	percentOfSpend = Number(percentOfSpend/100).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 
	rowDataArray.push(percentOfSpend);
	var diff = USDollar.format(amt1 - amt2);
	rowDataArray.push(diff);
	var percentOfOther = amt1/amt2; 
	percentOfOther = Number(percentOfOther).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2}); 	
	rowDataArray.push(percentOfOther);
	rowDataArray.push(groupName);
	rowDataArray.push(pdate);
	
	//console.log(`pushed ${rowDataArray[6]}`);
	//console.log(`tje rest ${rowDataArray[5]} ${rowDataArray[4]} ${rowDataArray[3]} ${rowDataArray[2]} ${rowDataArray[1]} ${rowDataArray[0]}`);
	
	return rowDataArray;
}

function processTrannys(trannys, factoidMap) {	
	// factoid map: [group|cat]name, [amt, amt, groupName]
	let intermediaryMap = new Map();
	let wholeLotOFactoids = new Map();
	
	for (let trans of trannys) {
		let cAmt = 0;
		let existingAmt = intermediaryMap.get(trans['trans_category']);
		
		if (existingAmt != null && existingAmt[0] != 0) 
			cAmt = existingAmt[0] + Math.abs(trans['trans_amt']);		
		else
			cAmt = Math.abs(trans['trans_amt']);
		
		intermediaryMap.set(trans['trans_category'], [cAmt,0, trans['trans_group']]); //fill in the other value below
		//console.log(`categoryies.get: ${categories.get(trans['trans_category'])} of ${trans['trans_category']} :: ${Math.abs(trans['trans_amt'])}`);
		
		//console.log(`cat: ${trans['trans_category']} amt: ${trans['trans_amt']}`);
		let gAmt = 0;
		let existingAmtg = intermediaryMap.get(trans['trans_group']); // gets [v1,v2]
		if (existingAmtg != null && existingAmtg[0] != 0) 
			gAmt = existingAmtg[0] + Math.abs(trans['trans_amt']);		
		else
			gAmt = Math.abs(trans['trans_amt']);
		intermediaryMap.set(trans['trans_group'], [gAmt,0,trans['trans_group']]);	//fill in the other value below	
	}
	if (factoidMap != null) {
		factoidMap.forEach((amt, catNameasKey) => { //amt = [$,0]
			
			if (intermediaryMap.has(catNameasKey)) {
				wholeLotOFactoids.set(catNameasKey, [amt[0], intermediaryMap.get(catNameasKey)[0], amt[2]]); 
			}
			else {
				//console.log(`intermediary (${intermediaryMap.get(catNameasKey)}) does NOT have: ${catNameasKey}, amt: ${amt[0]}, ${[1]}`)
				wholeLotOFactoids.set(catNameasKey, [amt[0],0, amt[2]])
			}
		});		
	}
	else {
		intermediaryMap.forEach((v,k) => {
			wholeLotOFactoids.set(k,v);
		});
	}
	return wholeLotOFactoids;
}

function catCompare(catGrpName, groupName, COLUMN_TYPE = column.GRP) {
	console.log("catcomp");
	console.log(`catCompare ${catGrpName}`);
	
	var transRows = document.querySelector("#target").innerHTML = '';
	var transRows = document.querySelector("#rtarget").innerHTML = '';
	
	var backToCompareButton = document.querySelector('#previous');
	backToCompareButton.style.display = 'block';
	backToCompareButton.addEventListener('click', loadCompareData);
	
	document.querySelector("#remover").value = catGrpName;
	
	
	catCView(catGrpName, groupName);
	//catCView(catGrpName, groupName);
	console.log(`data1: ${catGrpName}, ${groupName}`);
	getDataCount("#term2a", globalDisplayedDate2, groupName,  COLUMN_TYPE);
	getDataCount("#term1a", globalDisplayedDate, groupName, COLUMN_TYPE);
}


async function fetchCTrannys(pdate, catGrpName, groupName) {
  const response = await fetch('jsvcatfact', {
		method: 'POST',
		body: JSON.stringify({
			jscat: catGrpName,			//the data is the category (e.g. home, entertainment, etc.)
			jsgrp: groupName,
			jsdate: pdate,
			jsperiod: currentPeriodType  ///this needs to address whether in year/month, not set..yet
		})
	});
	
	const returnData = await response.json();	
	return returnData;
}

//DUPLICATE//
function catCView(catGrpName, groupName) {

	//console.log(`catCView enter ColumnType: ${COLUMN_TYPE}`);

	//console.log(`innder html: ${document.querySelector('#date-span').innerHTML}`);
		
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'block';
	grpHeading.innerHTML = groupName;
	
	//console.log(`CATCVIEW:: catData: ${catGrpName}  categoryDAta: ${groupName}`);
	
	var removeButton = document.querySelector("#remover").innerHTML = '';
	var removeButton = document.querySelector("#remover").innerHTML = 'catGrpName';
	
	var catMap1 = new Map();
	var catMap2 = new Map();
	fetchCTrannys(globalDisplayedDate, catGrpName, groupName)
	.then(transactions => {		
		catMap1 = processTrannys(transactions, null);
		
		fetchCTrannys(globalDisplayedDate2, catGrpName, groupName)
		.then(transactions => {
			catMap2 = processTrannys(transactions, catMap1);
			displayment(catMap2, globalDisplayedDate, globalDisplayedDate2);
		});
	});
}

//DUPLICATE//
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