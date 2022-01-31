document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});
	/////HERE IS CALL TO INITIAL LOADING	
	//google.setOnLoadCallback(getTransactionsInRange);
	
	// form to get range
	var yearCompare = document.querySelector('#compare-form');
	yearCompare.addEventListener('submit', loadCompareData);

	//var yearCompare2 = document.querySelector('#compare-button');
	//yearCompare2.addEventListener('click', comp);
	
});//end addEventListener	
	
var currentPeriodType = jperiod.MONTH;

function getDataCount(pdate = 0, ucategory = "", elem) {
	//get number of trasactions for given category
	console.log(`called getDataCount: ${pdate}`);
	 
	var returnCount = 0;
	fetch('/jsvgetaggs', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jscat: ucategory,
			jstype: currentPeriodType
		})
	})
	.then(response => response.json())
	.then(result => {
	console.log(`about to return from then: ${result['agcount']} also ${result['agavg']} and max: ${result['agmax']}`);
		
		var message1a = (ucategory == "") ? 
			` Total Entries: ${result['agcount']}` : 
			` Number of ${ucategory} transactions: ${result['agcount']}`;
		
		var message1b = (ucategory == "") ? 
			` <br>Average amount of an entry: ${result['agavg']}` : 
			` <br>Average amount of each ${ucategory} transaction: ${result['agavg']}`;
		
		var message1c = (ucategory == "") ?
			` <br>Most expensive entry: ${result['agmin']}` : 
			` <br>Most expensive ${ucategory} transaction: ${result['agmin']}`;
			
			var message1d = (ucategory == "") ?
			` <br>Total saved for period: ${result['agsum']}` : 
			` <br>Total amount spent on ${ucategory}: ${result['agsum']}`;
		
		var msg = "";
		msg += message1a;
		msg += message1b;
		msg += message1c;
		msg += message1d;
		cspot = document.querySelector(elem);
		
		//message1a += '\n';
		//message1a = result['agmax'] != 0 ? message1a.concat(message1c) : message1a;
		
		cspot.innerHTML = msg;
	});
	//console.log("end of compare catData")	
}

async function showCompare(event) {
	event.preventDefault();
	var v1 = document.querySelector('#value1')
	var v2 = document.querySelector('#value2')
	
	let strVal1 = v1.value.toString();
	let strVal2 = v2.value.toString();		
	
	loadCompareData("#target");
	console.log(`Show compare strVal1 = ${strVal1} & strVal2 = ${strVal2}`);
	loadCompareData("#rTarget");
	
	
}
	
function loadCompareData(event) {
	event.preventDefault();
	console.log("compare year");
	var v1 = document.querySelector('#value1')
	var v2 = document.querySelector('#value2')
	
	let catType = "none";
	let strVal1 = v1.value.toString();
	let strVal2 = v2.value.toString();
	//let periodType = jperiod.ALL;
	console.log(strVal1);
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
	console.log("after");
	console.log(strVal1);
	globalDisplayedDate = strVal1;
	globalDisplayedDate2 = strVal2;
	console.log(strVal1);
	console.log(strVal2);
	clearAllCharts();
	getDataCount(strVal1, "", "#term1a");
	getDataCount(strVal2, "", "#term2a");
	console.log(`after getDataCount: ${strVal1}`);
	loadFlexTable(strVal1, "#target");
	loadFlexTable(strVal2, "#rTarget");
}

//DUPLICATE//
function loadFlexTable(pdate = 0, ctarget = "#target") {
	
	//console.log(`loadTable ctype before period: ${period}`);
	//globalDisplayedDate = pdate;	
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jstype: currentPeriodType
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		//console.log("loadTable: transactions: ");
		//console.log(transactions[0]['trans_category']);
		
		var edate = document.querySelector('#edit-date')
		edate.addEventListener('click', () => sortByColumn(transactions, column.DATE, pdate, currentPeriodType));
		
		var eamt = document.querySelector('#edit-amount')
		eamt.addEventListener('click', () => sortByColumn(transactions, column.AMT, pdate, currentPeriodType));
		
		var ecat = document.querySelector('#edit-category')
		ecat.addEventListener('click', () => sortByColumn(transactions, column.CAT, pdate, currentPeriodType));

		//console.log(transactions);
		var transRows = document.querySelector(ctarget);
	    transRows.innerHTML = "";		
		for (let tran of transactions) {
			//console.log(tran['trans_category'])
			displayCTrans(tran, ctarget)
		}			
	});		
}

function catCompare(data, COLUMN_TYPE) {
	console.log("catcomp");
	console.log(`catCompare ${data}`);
	catCView(data, COLUMN_TYPE, null, "#target", globalDisplayedDate);
	catCView(data, COLUMN_TYPE, null, "#rTarget", globalDisplayedDate2);
	console.log(`data1: ${data}`)
	getDataCount(globalDisplayedDate2, data, "#term2a");
	getDataCount(globalDisplayedDate, data, "#term1a");
}
//DUPLICATE//
function catCView(data, COLUMN_TYPE, ctype = chartType.PIE, ctarget = "#target", catDate) {

	console.log(`catCView enter ColumnType: ${COLUMN_TYPE}`);

	//console.log(`innder html: ${document.querySelector('#date-span').innerHTML}`);
		
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'block';
	var catType;
	var catData = 0;
	var	grpData = 0;
	
	if (COLUMN_TYPE == column.CAT){
		catData = data.trim();
		grpData = 0;
		catType = "category";
	}
	else {
		grpData = data.trim();
		catData = 0;
		catType = "grouping";
	}
	console.log(`CATCVIEW:: catData: ${data}  categoryDAta: ${catData}, grpdata: ${grpData} date: ${catDate.match(/\d\d\d\d/)}`);
	
	//console.log(`sending: ${catData}
	fetch('jsvcat', {
		method: 'POST',
		body: JSON.stringify({
			jscat: catData,
			jsgrp: grpData,
			jsdate: catDate,
			jsperiod: currentPeriodType
		})
	})
	.then(response => response.json())
	.then(transactions => {
		
		
		var amount = 0;
		
		//transactions.forEach(displayTrans);
		var transRows = document.querySelector(ctarget);
	    transRows.innerHTML = "";		
		for (let tran of transactions) {			
			displayCTrans(tran, ctarget)
		}			
		
		if (document.querySelector('#add-form-group'))
			document.querySelector('#add-form-group').style.display = 'none';	
		if (document.querySelector('#findby-form'))
			document.querySelector('#findby-form').style.display = 'none';			
		
		var debtot = 0;
		if (document.querySelector('#tot-deb'))	{
			var debitTotal = document.querySelector('#tot-deb');
			debtot = parseFloat(debitTotal.innerHTML);
		}
		var credtot = 0;
		if (document.querySelector('#tot-cred')) {
			var creditTotal = document.querySelector('#tot-cred');
			credtot = parseFloat(creditTotal.innerHTML);
		}
		//console.log(`credtot: ${credtot} debtot ${debtot}`);
		
		//console.log(`transaction b4 leaving method: ${COLUMN_TYPE}`);
		var ags = {
			heading : data,
			credTotal : credtot,
			debTotal : debtot
		};
	    //console.log(`heading ${ags.heading}, cred: ${ags.credTotal}, deb: ${ags.debTotal}`);
		/* if (credtot > 0 || debtot > 0)
		{
			if (COLUMN_TYPE == column.CAT)
				createCatbyMonthChart(transactions, currentPeriodType, ctype, ags, COLUMN_TYPE);
			else if (COLUMN_TYPE == column.GRP)
				createChart(transactions);		
				//createCatbyMonthChart(transactions, currentPeriodType, ctype, ags, COLUMN_TYPE);
			else
				createChart(transactions);		
		} */
	});
	//console.log("catCview end");
}

//DUPLICATE//
function displayCTrans(transaction, ctarget) {
	
	//console.log(`displayTrans ${transaction} : ${transaction['trans_category']}`);
	var tr1 = document.createElement('tr');
	var trIDAttr = document.createAttribute('id');
	trIDAttr.value = `row${transaction['id']}`;
	tr1.setAttributeNode(trIDAttr);	
	const br = document.createElement('br');
	///////////////////edit column////////////////
	
	var td0 = document.createElement('td');
	var div0 = document.createElement('div');
	
	var editButton = document.createElement('button');
	editButton.innerHTML = "edit";
		
	var ecolumnIDAttr = document.createAttribute('id');
	ecolumnIDAttr.value = `editcolumn${transaction['id']}`;
	div0.setAttributeNode(ecolumnIDAttr);
	
	var ebuttonIDAttr = document.createAttribute('id');
	ebuttonIDAttr.value = `editbutton${transaction['id']}`;
	editButton.setAttributeNode(ebuttonIDAttr);
	
	var ebuttonClassAttr = document.createAttribute('class');
	ebuttonClassAttr.value = `btn bdrbtn btn-xs`;
	editButton.setAttributeNode(ebuttonClassAttr);
	
	var editClickAttr = document.createAttribute('onClick');
	editClickAttr.value = `editTran(${transaction['id']})`;
	editButton.setAttributeNode(editClickAttr);
	
	//--------delete button------------//
	var deleteButton = document.createElement('button');
	deleteButton.innerHTML = "delete";

	var dbuttonIDAttr = document.createAttribute('id');
	dbuttonIDAttr.value = `deletebutton${transaction['id']}`;
	deleteButton.setAttributeNode(dbuttonIDAttr);
	
	var dbuttonClassAttr = document.createAttribute('class');
	dbuttonClassAttr.value = `btn bdrbtn btn-xs`;
	deleteButton.setAttributeNode(dbuttonClassAttr);
	
	var deleteClickAttr = document.createAttribute('onClick');
	deleteClickAttr.value = `deleteTran(${transaction['id']})`;
	deleteButton.setAttributeNode(deleteClickAttr);
	
	div0.append(editButton);
	div0.append(br);
	div0.append(deleteButton);
	td0.append(div0);	
	
	///////////////////date column////////////////	
	
	var td1 = document.createElement('td');
	var div1 = document.createElement('div');
	div1.innerHTML = transaction['trans_date'];
		
	var div1IdAttr = document.createAttribute('id');
	var typeID1 = `date${transaction['id']}`;	
	div1IdAttr.value = typeID1;
	div1.setAttributeNode(div1IdAttr);
	td1.append(div1);
		
	/////////////table elements/////////////
	
	///Description/Msg///			
	var td2 = document.createElement('td');
	var div2 = document.createElement('div');
	div2.innerHTML = transaction['trans_msg'];
	td2.append(div2);
		
	var div2IdAttr = document.createAttribute('id');
	var typeID2 = `msg${transaction['id']}`;
	div2IdAttr.value = typeID2;
	div2.setAttributeNode(div2IdAttr);
		
	///Amount///	
	
	var td3 = document.createElement('td');
	var div3 = document.createElement('div');
	div3.innerHTML = transaction['trans_amt'];
	td3.append(div3);
	
	var div3IdAttr = document.createAttribute('id');
	var typeID3 = `amt${transaction['id']}`;	
	div3IdAttr.value = typeID3;
	div3.setAttributeNode(div3IdAttr);

	///category////
	
	var tran_cat_val = transaction['trans_category'];
	
	var td4 = document.createElement('td');
	var div4 = document.createElement('div');
	div4.innerHTML = tran_cat_val;
	td4.append(div4);	
		
	var div4IdAttr = document.createAttribute('id');
	var typeID4 = `category${transaction['id']}`;
	div4IdAttr.value = typeID4;
	div4.setAttributeNode(div4IdAttr);
		
	var div4ClickAttr = document.createAttribute('onClick');
	var div4Function = `catCompare('${tran_cat_val}', column.CAT)`;
	div4ClickAttr.value = div4Function;
	div4.setAttributeNode(div4ClickAttr);

	///group///
	
	var tran_group_val = transaction['trans_group'];
	
	var td5 = document.createElement('td');
	var div5 = document.createElement('div');
	div5.innerHTML = tran_group_val;
	td5.append(div5);
	
	var div5IdAttr = document.createAttribute('id');
	var typeID5 = `group${transaction['id']}`;
	div5IdAttr.value = typeID5;
	div5.setAttributeNode(div5IdAttr);
	
	var div5ClickAttr = document.createAttribute('onClick');
	var div5Function = `catCView('${tran_group_val}', column.GRP')`;
	div5ClickAttr.value = div5Function;
	div5.setAttributeNode(div5ClickAttr);

	///////////////////////end table elements/////////////////////////
	
	tr1.append(td0);
	tr1.append(td1);
	tr1.append(td2);
	tr1.append(td3);
	tr1.append(td4);
	tr1.append(td5);	
	var transRows = document.querySelector(ctarget);
	transRows.append(tr1);
	
	let currentDate = new Date();
	//console.log(currentDate);		
}