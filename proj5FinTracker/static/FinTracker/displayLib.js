////////Display Library////////



//*********Global Vars***************************************************************//

var catOrDate;			  // the worst design choice in history - needs fix - TODO
var globalDisplayedDate;  // date currently being displayed
var globalDisplayedDate2; // used in comparision operations

// needs fix -TODO
const cod = {
	CATGRP:  0,
	DATE: 1	
}

const column = {
	CAT: 1,
	GRP: 2,
	AMT: 3,
	DATE: 4
};

const jperiod = {
	DAY:   1, 
	MONTH: 2, 
	YEAR:  3, 
	ALL:   4	 // user's epoch (i.e. all entries for user //
};

const chartType = {
	PIE: 1,
	BAR: 2
}

//*********Global Vars END***********************************************************//

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
    return months[month_ord - 1]   
}

					  ///////////////////////////////
///////////////////////PLACE IN COUPLED DISPLAY FILE//////////////////////
                      ///////////////////////////////					   
function createDateMenu(/*string*/ anchorDate = 0, thisPeriod = jperiod.MONTH) {
	console.log(`createDateMenu ${anchorDate}`);
	
	var navMenu = document.querySelector('#neighborMonth');
	navMenu.innerHTML = '';
	if (thisPeriod == jperiod.YEAR)	{
		
		var startYear = 2021;
		if(anchorDate) {
			console.log(`anchorDate: ${anchorDate}`);
			let strYear = anchorDate.substring(0,4);
			startYear = parseInt(strYear);			
		}
		else {
			let tempYear = new Date()
			startYear = tempYear.getFullYear();
			//console.log(`cyear: ${cYear}`);
			//console.log(typeof cYear);
		}		
		
		for (i = -2; i < 2; i++) {
			let yearLink = document.createElement('a');
			let dispYear = startYear + i;
			yearLink.innerHTML = `| ${dispYear}`;
			let dummyDate = dispYear.toString() + "-01-01";
			console.log(`dummDate: ${dummyDate} startYear: ${startYear}`);
			//console.log(`i = ${i}`);
			let yearFuncAttr = document.createAttribute('onClick');
			yearFuncAttr.value = `getDateData("${dummyDate}")`;
			//console.log(`dummydate: ${dummyDate}`);
			//yearFuncAttr.value = `loadYear("${dummyDate}")`;
			yearLink.setAttributeNode(yearFuncAttr); 
			navMenu.append(yearLink);
		}			
	}
	else {
		
		var cMonth =  (!anchorDate) ? new Date().getMonth() + 1 : anchorDate.substring(5,7);					
		let yrAdjust = 0;
		
		console.log(`CMonth is ${cMonth}`);
		var parsedMonth = parseInt(cMonth);
		console.log(`parsedMonth is ${parsedMonth}`);
		for (i = (cMonth - 3); i < (parsedMonth + 3); i++)		
		{
			//console.log(`i: ${i} ${parsedMonth + 3} `); 
			yrAdjust = 0;
			var mo = document.createElement('a');
			let dmonth = 1;
			if (i == 0 ) {
				dmonth = 12;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;
				//console.log(`hit 0, 13: ${i} mo: ${mo}`); 			
				yrAdjust = -1;
			}
			else if (i == -2) {
				dmonth = 10;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;
				yrAdjust = -1;
				//console.log(`hit -2: ${i} mo: ${mo.innerHTML}`);				
			}
			else if (i == -1) {
				dmonth = 11;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;
				//console.log(`hit -1: ${i} mo: ${mo}`); 
			}
			else if (i == 13) {
				dmonth = 1;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;
				yrAdjust = 1;
				//console.log(`hit 14: ${i} mo: ${mo}`); 
			}
			else if (i == 14) {
				dmonth = 2;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;  
				yrAdjust = 1;
				//console.log(`hit 14: ${i} mo: ${mo}`); 
			}
			else{
				dmonth = i;
				mo.innerHTML = ` | ${getTextMonth(dmonth)} `;
				//console.log(`hit else: ${i} mo: ${mo}`);
			}
			navMenu.append(mo);
			if (!anchorDate) {
				var dyear = new Date().getFullYear() + yrAdjust;
			}
			else {
				var dyear = parseInt(anchorDate.substring(0,4)) + yrAdjust;	
				//console.log(`dyear: ${dyear}`);
			}
			
			fulldmonth = (dmonth < 10) ? ("0" + dmonth) : dmonth.toString();
			//console.log(fulldmonth);
			let searchDate = '' + dyear + '-' + fulldmonth + '-01';
			//console.log(`searchDate: ${searchDate}`);
			
			//why does this work? shouldn't this occur before adding 'mo' to the NavMenu? (line 171)
			var dateFuncAttr = document.createAttribute('onClick');
			dateFuncAttr.value = `getDateData("${searchDate}")`;
			mo.setAttributeNode(dateFuncAttr);
					
			//console.log(`i is: ${i}, latest push: ${mo.innerHTML}, searchDate: ${searchDate} \n ${yrAdjust} \n ${new Date().getYear()}`);
		}	
	}
	//console.log('end build click>>month bar');
}
									 //////////	
//////////////////////////////////////GEN UTIL////////////
									 //////////
function inYearView() {
	
	var viewButton = document.querySelector('#navyear');
	var val = viewButton.getAttribute('class');	
	return !!val;
}

function inEpochView() {
	
	var viewButton = document.querySelector('#navepoch');
	var val = viewButton.getAttribute('class');	
	return !!val;
}



function loadYear(passedDate = 0) {
	
	if (inYearView())
		return 0;
	clearAllCharts();
	
	////////////////////////////////REMOVE////////////////////////
	var cvbtn = document.querySelector('#chart-view-btn');
	if (cvbtn)
		cvbtn.innerHTML = "Bar Graph";	
	var fullyr = passedDate;
	console.log(`fullyr : ${fullyr} passedDate : ${passedDate}`)
	if (!passedDate) {   			//passedDate format: xxxx-xx-xx
		let rgex = /\d\d\d\d/;
		var displayDate = document.querySelector('#date-span');
		var dd = displayDate.innerHTML;
		var yr = dd.substring(dd.search(rgex));
		fullyr = yr.concat("-11-11");
		console.log(`full year: ${fullyr}`);
	}
	createDateMenu(fullyr, jperiod.YEAR);
	setNavBar(document.querySelector('#navyear'));	
	loadTable(yr.concat("/11/11"),jperiod.YEAR);
	displayDate.innerHTML = yr;
	
	document.querySelector('#add-form-group').style.display = 'none';
	
/////console.log(`inner.value: ${displayDate.innerHTML.value}, diplayDate.ivalue: ${displayDate.value}`);
}

function loadEpoch() {	

	if (inEpochView())
		return 0;
	
	document.querySelector('#navyear').style.display = 'none';	
	clearAllCharts();
	var cvbtn = document.querySelector('#chart-view-btn');
	cvbtn.innerHTML = "Bar Graph";	
	setNavBar(document.querySelector('#navepoch'));
	//console.log(`loadepoch: set to BarGraph`);
	
	loadTable(0,jperiod.ALL);
	document.querySelector('#add-form-group').style.display = 'none';	
	document.querySelector('#findby-form').style.display = 'none';	
}

function loadTable(pdate = 0, period = jperiod.MONTH, ctype = chartType.PIE, creatingChart = true) {
	
	console.log(`loadTable ctype before ${ctype} period: ${period}`);
	globalDisplayedDate = pdate;
	if (isNaN(ctype))
		ctype = chartType.PIE;
		
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jstype: period
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		console.log("loadTable: transactions: ");
		
		var edate = document.querySelector('#edit-date')
		edate.addEventListener('click', () => sortByColumn(transactions, column.DATE, pdate, period));
		
		var eamt = document.querySelector('#edit-amount')
		eamt.addEventListener('click', () => sortByColumn(transactions, column.AMT, pdate, period));
		
		var ecat = document.querySelector('#edit-category')
		ecat.addEventListener('click', () => sortByColumn(transactions, column.CAT, pdate, period));

		//console.log(transactions);
		var transRows = document.querySelector('#target');
	    transRows.innerHTML = "";
		transactions.forEach(displayTrans);	
		if (creatingChart)
			createChart(transactions, ctype);
		var displayDate = document.querySelector('#date-span');
		if (displayDate && period == jperiod.YEAR) {			
			displayDate.innerHTML = `${pdate.slice(0,4)} transactions`;
		}
		else if (displayDate && period == jperiod.ALL) {
			displayDate.innerHTML = `All Transactions`;			
		}
		else if (displayDate)
			displayDataDate(pdate);
	});	
	//catOrDate = cod.DATE;
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'none';	
	var cfTable = document.querySelector('#bits');
	cfTable.style.display = 'none';		
}

function sortByColumn(transactions, sortBy, pdate, period) {
 	console.log(`sort by column, pdate: ${pdate}, period: ${period}`);
	//console.log(transactions);
	switch(sortBy) {
		case column.CAT:
			console.log(`CAT sort by: ${sortBy}`);
			transactions.sort(
				function(a, b) {return (a.trans_category > b.trans_category) - (a.trans_category < b.trans_category);
			});
			break;//return transactions;
			
		case column.GRP:
			console.log(`grp sort by: ${sortBy}`);
			transactions.sort(
				function(a, b) {return (a.trans_group > b.trans_group) - (a.trans_group < b.trans_group);
			});
			break;//return transactions;
			
		case column.AMT:
			console.log(`AMT sort by: ${sortBy}`);
			console.log(transactions);
			transactions.sort(
				function(a, b) {return (a.trans_amt - b.trans_amt);
			});
			console.log(transactions);
			break;//return transactions;
			
		case column.DATE:
			console.log(`DATE sort by: ${sortBy}`);
			transactions.sort(
				function(a, b) {return (a.trans_date > b.trans_date) - (a.trans_date < b.trans_date);
			});
			break;//return transactions;		
	}
	
	transTable = document.querySelector('#target');
	transTable.innerHTML = ""; 
	var new_tbody = document.createElement('tbody');
	var ntb_attr = document.createAttribute('id');
	ntb_attr.value = 'target';
	new_tbody.setAttributeNode(ntb_attr);
	tTable = document.querySelector('#tran-table');
	tTable.append(new_tbody);
	
	/*
	var trIDAttr = document.createAttribute('id');
	trIDAttr.value = `row${transaction['id']}`;
	tr1.setAttributeNode(trIDAttr);	
	*/
	
	//console.log(`Transnationalist0: ${transactions}`);
	for (var i = 0; i < transactions.length; i++) {
		displayTrans(transactions[i]); 
		//console.log(`Transnationalist1: ${transactions[i]['trans_amt']}`);		
		//console.log(`Transnationalist4: ${transactions[i].trans_category}`);
	}
	//createChart(transactions, ctype);
	var displayDate = document.querySelector('#date-span');
	if (period == jperiod.YEAR) {			
		displayDate.innerHTML = `${pdate.slice(0,4)} transactions`;
	}
	else if (period == jperiod.ALL) {
		displayDate.innerHTML = `All Transactions`;			
	}
	else
		displayDataDate(pdate);
}

function clearAllCharts() {
	//clear current views: table, summary table, pie chart
	transTable = document.querySelector('#target');
	transTable.innerHTML = "";	
	debitTable = document.querySelector('#debit-overview');
	if (debitTable)
		debitTable.innerHTML = "";
	debitPie = document.querySelector('#debit-pie');
	if (debitPie)
		debitPie.innerHTML = "";
	creditTable = document.querySelector('#credit-overview');
	if (creditTable)
		creditTable.innerHTML = "";
	creditPie = document.querySelector('#credit-pie');
	if (creditPie)
		creditPie.innerHTML = "";
}

function setNavBar(navitem) {
	document.querySelector('#navmonth').removeAttribute("class");
	document.querySelector('#navyear').removeAttribute("class");
		
	var nyclass = document.createAttribute('class');
	nyclass.value = `active`;
	navitem.setAttributeNode(nyclass);	
}

function showAddTransaction() {
	var addTransDiv = document.querySelector("#add-trans");
	var addTransButton  = document.querySelector('#add-trans-button');
	var saveTram = document.querySelector('#add-btn');
	var saveForm = document.querySelector('#add-trans-form');
	
	if(addTransDiv.style.display == 'none')
		addTransDiv.style.display = 'block';		
	else 
		addTransDiv.style.display = 'none';
}

function addTransaction(event) {
	event.preventDefault();
	fetch('jsvsave', {
		method: 'POST',
		body: JSON.stringify({
			trans_date: document.querySelector('#dte').value,
			trans_amt: document.querySelector('#amt').value,
			trans_msg: document.querySelector('#msg').value,
			trans_category: document.querySelector('#cat').value,
			trans_group: document.querySelector('#grp').value,
		})
	})
	.then(response => response.json())
	.then(msg => {
		//reset state of add transaction form
		showAddTransaction();
		//clear current transaction that are displayed
		var tableContents = document.querySelector('#target');		
		tableContents.innerHTML = '';
		
		tdate = document.querySelector('#dte').value;
		//console.log(`tdate in addTransaction function: ${tdate}`);
		
		//on return, display month view and pie chart regardless of previous view
		loadTable(tdate, jperiod.MONTH);
		var navmonth = document.querySelector('#navmonth');
		var nmclass = document.createAttribute('class');
		nmclass.value = `active`;
		navmonth.setAttributeNode(nmclass);	
		var chartViewBtn = document.querySelector("#chart-view-btn");
		chartViewBtn.innerHTML = "Bar Graph";
	});
}	

function displayDataDate (dateValue) {
	//get date from text box - we are doing a search by date
	console.log("displayDataDate");
	catOrDate = cod.DATE;
	if (!dateValue) {
		dateValue = document.querySelector("#bydate").value;
		//console.log("in first check");
	}
	//console.log(dateValue);
	var yyyy = 0;
	var mm = 0;
	//nothing passed in, nothing in text box, we are just doing a default date (today)
	if (!dateValue) {
		var today = new Date();
		mm = ((today.getMonth() + 1) < 10) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1; //January is 0 
		yyyy = today.getFullYear();
		//console.log("in 2nd check");
		//console.log(`mm: ${mm}, yyyy: ${yyyy}`);
		dateValue = "" + yyyy + "-" + mm;
	}
	else {
		mm = dateValue.slice(5,7);
		yyyy = dateValue.substr(0,4)
	}
	//console.log(`datevalue: ${dateValue}`);
	var ds = document.querySelector('#date-span');
	
	//console.log(`(displaydate function) month section ${mm}`);
	monthText = getTextMonth(mm);
	
	dsDate = (inYearView()) ? `All ${yyyy} transactions` : (inEpochView()) ? "Since the beginning of Time" : `${monthText} ${yyyy}`;
	console.log(`dsDate is: ${dsDate}`);
	ds.innerHTML = dsDate;
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.innerHTML = dsDate;
	grpHeading.style.display = 'block';
	console.log(`end: ${dateValue}`);
}

function findTransactionsByDate(event) {
	event.preventDefault();

	dateElem = document.querySelector('#bydate');
	var dateValue = dateElem.value;
	if (!dateValue) {
		dateValue = 0;
	}
	//console.log(`findTransByDate... date is: ${dateValue}`);
	
	//var tranCount = 0;
	getDateData(dateValue);	
	
}

//loadTable(pdate = 0, period = jperiod.MONTH, ctype = chartType.PIE) 

function getDateData(iDate) {
	displayDataDate(iDate);	
	
	var tem = typeof iDate;
	//console.log(`tem: ${iDate}`);
	if (tem == "number")
		iDate =  iDate.toString();
	//var tem = typeof iDate;
	//console.log(`tem: ${tem}`);
	
	//* set Global date *//
	globalDisplayedDate = iDate; 
	console.log(`global disp date: ${globalDisplayedDate}`);
	let currtype = (inYearView()) ? jperiod.YEAR : (inEpochView()) ? jperiod.ALL : jperiod.MONTH;
	console.log(`currtype is : ${currtype}, dateVaule is ${iDate}`);
	console.log("getDate data");
	loadTable(iDate, currtype);
	createDateMenu(iDate, currtype);
	/* fetch('jsvperiod', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: iDate,
			jstype: currtype			
		})
	})
	.then(response => response.json())
	.then(transactions => {
		var transRows = document.querySelector('#target');
		transRows.innerHTML = "";
		transactions.forEach(displayTrans)
		if (currtype == jperiod.MONTH) {
			createChart(transactions);
			createDateMenu(iDate, currtype);
		}
		else {
			createCatbyMonthChart(transactions, currtype);
			createDateMenu(iDate, currtype);
		}
		
		//clean 'percentage-of display (if needed)
		document.querySelector('#bits').style.display = 'none';
		//var grpHeading = document.querySelector('#cat-grp');
		console.log(`getDataeData: idate = ${iDate}`);
	});		 */
}

function putDateInTransactionPeriodTextBox(date) {
	
}

function deleteTran(tranID) {
	if (confirm('are you sure you want to delete transaction?'))
	{
		fetch('jsvdelete', {
			method: 'POST',
			body: JSON.stringify({
			jid: tranID			
			})
		})
		.then(response => response.json())
		.then(result => {
			
			var deletedRow = document.querySelector(`#row${tranID}`);
			deletedRow.remove();
			var tableContents = document.querySelector('#target');	
			tableContents.innerHTML = '';
			
			changeChart();			
		});		
	}	
}

function displayTrans(transaction) {
	
//	console.log(`displayTrans ${transaction} : ${transaction['trans_category']}`);
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
	var div4Function = `catView('${tran_cat_val}', column.CAT)`;
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
	var div5Function = `catView('${tran_group_val}', column.GRP)`;
	div5ClickAttr.value = div5Function;
	div5.setAttributeNode(div5ClickAttr);

	///////////////////////end table elements/////////////////////////
	
	tr1.append(td0);
	tr1.append(td1);
	tr1.append(td2);
	tr1.append(td3);
	tr1.append(td4);
	tr1.append(td5);	
	var transRows = document.querySelector('#target');
	transRows.append(tr1);
	
	let currentDate = new Date();
	//console.log(currentDate);		
}

function editTran(tranID) {
	console.log("editTran begin");
	document.querySelector(`#editbutton${tranID}`).style.display = 'none';

	var saveButton = document.createElement('button');
	saveButton.innerHTML = "save";
	
///////saveEdit ///////////////////////
	var sbuttonClickAttr = document.createAttribute('onClick');
	sbuttonClickAttr.value = `saveEdit(${tranID})`;
	saveButton.setAttributeNode(sbuttonClickAttr);
	
	var sbuttonClickAttr2 = document.createAttribute('id');
	sbuttonClickAttr2.value = `savebutton${tranID}`;
	saveButton.setAttributeNode(sbuttonClickAttr2);
	
	var sbuttonClickAttr3 = document.createAttribute('class');
	sbuttonClickAttr3.value = `btn btn-primary btn-block btn-xs`;
	saveButton.setAttributeNode(sbuttonClickAttr3);
	
///--create cancel button--//		
	var cancelButton = document.createElement('button');
	cancelButton.innerHTML = "cancel";
		
	var cbuttonClickAttr2 = document.createAttribute('id');
	cbuttonClickAttr2.value = `cancelbutton${tranID}`;
	cancelButton.setAttributeNode(cbuttonClickAttr2);
	
	var cbuttonClickAttr3 = document.createAttribute('class');
	cbuttonClickAttr3.value = `btn btn-primary btn-block btn-xs`;
	cancelButton.setAttributeNode(cbuttonClickAttr3);
	
	var cbuttonClickAttr4 = document.createAttribute('onClick');
	cbuttonClickAttr4.value = `returnToDisplayView(${tranID})`;
	cancelButton.setAttributeNode(cbuttonClickAttr4);	
	
//--display button in date column & remove 'click-to-edit' property--//
	var editColumn = document.querySelector(`#editcolumn${tranID}`);
	editColumn.append(saveButton);
	editColumn.append(cancelButton);		
	
//--get contents of each column/field in row--//
	var dateColumn = document.querySelector(`#date${tranID}`);
	var msgColumn = document.querySelector(`#msg${tranID}`);
	var amtColumn =  document.querySelector(`#amt${tranID}`);
	var catColumn =  document.querySelector(`#category${tranID}`);
	var groupColumn =  document.querySelector(`#group${tranID}`);
	var existingDate = dateColumn.innerHTML;
	var existingMsg = msgColumn.innerHTML;
	var existingAmt = amtColumn.innerHTML;
	var existingCat = catColumn.innerHTML;
	var existingGroup = groupColumn.innerHTML;
	
//--create text boxes to allow for editing--//
	var dateTextBox = document.createElement('textArea');
	var msgTextBox = document.createElement('textArea');
	var amtTextBox = document.createElement('textArea');
	var catTextBox = document.createElement('textArea');
	var groupTextBox = document.createElement('textArea');
	
	var dateTextBoxWidthAttr = document.createAttribute('cols');
	dateTextBoxWidthAttr.value = "20";
	
	var msgTextBoxWidthAttr = document.createAttribute('cols');
	msgTextBoxWidthAttr.value = "60";
	
	var amtTextBoxWidthAttr = document.createAttribute('cols');
	amtTextBoxWidthAttr.value = "6";
	amtTextBox.setAttributeNode(amtTextBoxWidthAttr);
	
	var catTextBoxWidthAttr = document.createAttribute('cols');
	catTextBoxWidthAttr.value = "8";
	catTextBox.setAttributeNode(catTextBoxWidthAttr);
	
	var groupTextBoxWidthAttr = document.createAttribute('cols');
	groupTextBoxWidthAttr.value = "8";
	groupTextBox.setAttributeNode(groupTextBoxWidthAttr);
		
	dateTextBox.innerHTML = existingDate;
	dateColumn.innerHTML = '';
	dateColumn.append(dateTextBox);
	
	msgTextBox.innerHTML = existingMsg;
	msgColumn.innerHTML = '';
	msgColumn.append(msgTextBox);
	
	amtTextBox.innerHTML = existingAmt;
	amtColumn.innerHTML = '';
	amtColumn.append(amtTextBox);
	
	var clearClickAttr = document.createAttribute('onClick');
	clearClickAttr.value = ``;
	catColumn.setAttributeNode(clearClickAttr);
	
	catTextBox.innerHTML = existingCat;
	catColumn.innerHTML = '';
	catColumn.append(catTextBox);
	
	var clearGroupClickAttr = document.createAttribute('onClick');
	clearGroupClickAttr.value = ``;
	groupColumn.setAttributeNode(clearGroupClickAttr);
	
	groupTextBox.innerHTML = existingGroup;
	groupColumn.innerHTML = '';
	groupColumn.append(groupTextBox);

	console.log("editTran end");
}

function saveEdit(tranID) {	
	console.log("saveEdit BEGIN");
	document.querySelector(`#editbutton${tranID}`).style.display = 'block';
	tdate = document.querySelector(`#date${tranID} > textarea`).value;
	tamt = document.querySelector(`#amt${tranID} > textarea`).value;
	tcat = document.querySelector(`#category${tranID} > textarea`).value;
	tgrp = document.querySelector(`#group${tranID} > textarea`).value;
	tmsg = document.querySelector(`#msg${tranID} > textarea`).value;
	
	fetch('edittransaction', {
		method: 'PUT',
		body: JSON.stringify({
			jdate: tdate,
			jid: tranID,			
			jamt: tamt,
			jcat: tcat,
			jgrp: tgrp,
			jmsg: tmsg
		}) 
	})
	.then(response => response.json())
	.then(result => {		
		if (result['reload_necessary']) { //reload if amount/category change to allow pie display to update
			const submitEvent = new SubmitEvent("submit");			
			changeChart();			
			console.log("saveEdit: reload path");
		}
		else {
			returnToDisplayView(tranID);
			console.log("saveEdit: no reload path");
		}
	});
	//console.log("saveEdit end");
}

function returnToDisplayView(tranID) {	
	//console.log("ret to display view");
	tdate = document.querySelector(`#date${tranID} > textarea`).value;
	tamt = document.querySelector(`#amt${tranID} > textarea`).value;
	tcat = document.querySelector(`#category${tranID} > textarea`).value;
	tgrp = document.querySelector(`#group${tranID} > textarea`).value;
	tmsg = document.querySelector(`#msg${tranID} > textarea`).value;
	
	document.querySelector(`#date${tranID}`).innerHTML = tdate;
	document.querySelector(`#amt${tranID}`).innerHTML = tamt;
	document.querySelector(`#msg${tranID}`).innerHTML = tmsg;
	
	var catCol = document.querySelector(`#category${tranID}`);
	catCol.innerHTML = tcat;
	var catColClickAttr = document.createAttribute('onClick');
	catColFunction = `catView('${tcat}')`;
	catColClickAttr.value = catColFunction;
	catCol.setAttributeNode(catColClickAttr);
	
	var grpCol = document.querySelector(`#group${tranID}`);
	grpCol .innerHTML = tgrp;
	var grpColClickAttr = document.createAttribute('onClick');
	grpColFunction = `catView('${tgrp}')`;
	grpColClickAttr.value = grpColFunction;
	grpCol.setAttributeNode(grpColClickAttr);
	
	editButton = document.querySelector(`#editbutton${tranID}`);
	
	var editClick = document.createAttribute('onClick');
	editClick.value = `editTran(${tranID})`;
	editButton.setAttributeNode(editClick);
	editButton.style.display = 'block'; 
		
	Sb = document.querySelector(`#savebutton${tranID}`);
	Cb = document.querySelector(`#cancelbutton${tranID}`);
	Sb.remove();
	Cb.remove()
}

function catView(data, COLUMN_TYPE, ctype = chartType.PIE ) {
	catOrDate = cod.CATGRP;
	console.log(`catView enter ColumnType: ${COLUMN_TYPE}`);
	//var catAmtTotal = 0;
	//var catCount = 0;
	var catData = 0, grpData = 0;
	var periodType = 0;
	//var viewButton = document.querySelector('#navyear');
	//var val = viewButton.getAttribute('class');	
	console.log(`global display date: ${globalDisplayedDate}`);
	//console.log(`innder html: ${document.querySelector('#date-span').innerHTML}`);
	//var useDate = "December " + globalDisplayedDate.substring(0,4);
	var catDateyr = globalDisplayedDate;//(document.querySelector('#date-span')) ? document.querySelector('#date-span').innerHTML : useDate;
	var grpHeading = document.querySelector('#cat-grp');
	grpHeading.style.display = 'block';
	var catType;	
	
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
	grpHeading.innerHTML = "Viewing: " + data +  " " + catType;
	console.log(`CATVIEW:: catData: ${data}  categoryDAta: ${catData}, grpdata: ${grpData} date: ${catDateyr}`);//.match(/\d\d\d\d/)}`);
	if (inYearView())
		periodType = jperiod.YEAR;
	else if (inEpochView())
		periodType = jperiod.ALL
	else
		periodType = jperiod.MONTH
	console.log(`sending: ${catData}, ${grpData}, date: ${catDateyr}, period, ${periodType}`);
	fetch('jsvcat', {
		method: 'POST',
		body: JSON.stringify({
			jscat: catData,
			jsgrp: grpData,
			jsdate: catDateyr,
			jsperiod: periodType
		})
	})
	.then(response => response.json())
	.then(transactions => {
		//console.log(transactions[catCount]['trans_amt']);
		//console.log(transactions);
		var edate = document.querySelector('#edit-date');		
		edate.addEventListener('click', () => sortByColumn(transactions, column.DATE, catDateyr, periodType));
		
		var eamt = document.querySelector('#edit-amount')
		eamt.addEventListener('click', () => sortByColumn(transactions, column.AMT, catDateyr, periodType));
		
		var ecat = document.querySelector('#edit-category')
		ecat.addEventListener('click', () => sortByColumn(transactions, column.CAT, catDateyr, periodType));

		var transRows = document.querySelector('#target');
		var amount = 0;
		transRows.innerHTML = "";
		transactions.forEach(displayTrans);	
		if (document.querySelector('#add-form-group'))
			document.querySelector('#add-form-group').style.display = 'none';	
		if (document.querySelector('#findby-form'))
			document.querySelector('#findby-form').style.display = 'none';	
		
		//console.log(`rezzy credtotal cat response: ${rezzy.credtotal}`);
		//console.log(`rezzy debotal cat response: ${rezzy.debtotal}`);
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
		console.log(`credtot: ${credtot} debtot ${debtot}`);
		
		//console.log(`transaction b4 leaving method: ${COLUMN_TYPE}`);
		var ags = {
			heading : data,
			credTotal : credtot,
			debTotal : debtot
		};
	    console.log(`heading ${ags.heading}, cred: ${ags.credTotal}, deb: ${ags.debTotal}`);
		if (credtot > 0 || debtot > 0)
		{
			if (COLUMN_TYPE == column.CAT)
				createCatbyMonthChart(transactions, periodType, ctype, ags, COLUMN_TYPE);
			else if (COLUMN_TYPE == column.GRP)
				createChart(transactions);		
				//createCatbyMonthChart(transactions, periodType, ctype, ags, COLUMN_TYPE);
			else
				createChart(transactions);		
		}
	});
	//console.log("catview end");
}


function createCatbyMonthChart(transactions, periodType=0, ctype = chartType.PIE, ags=0, COLUMN_TYPE = column.CAT) {
	catOrDate = cod.CATGRP;
	var creditMap = new Object();
	var debitMap = new Object();
	var dtotal = 0;
	var ctotal = 0;
	var tranCount = 0;
	//console.log(`trans count: ${transactions[tranCount	].trans_category}`)
	//build summary table
	if (periodType == jperiod.MONTH) {
		while (tran = transactions[tranCount++]) {		
			var tDate = tran['trans_date'];	
			//console.log(`tdate: ${tDate}`);
			var tAmount = parseFloat(tran['trans_amt']);		

			//credits
			if (tAmount > 0) {
				if (creditMap[tDate]) {			
					creditMap[tDate] += Math.abs(tAmount);
				}
				else {				
					creditMap[tDate] = Math.abs(tAmount);
				}	
				ctotal += Math.abs(tAmount);
			}
			//debits
			else {
				if (debitMap[tDate]) {
					debitMap[tDate] += Math.abs(tAmount);
				}
				else {
					debitMap[tDate] = Math.abs(tAmount);
				}
				dtotal += Math.abs(tAmount);
			}		
		}
	} 
	else {
		while (tran = transactions[tranCount++]) {		
			var iDate = tran['trans_date'];
			var tDate = getTextMonth(parseInt(iDate.substring(5,7))) + " " + iDate.substring(0,4);
			//tDate = tDate.substring(0,7);
			
			//console.log(`tdate: ${tDate}`);
			var tAmount = parseFloat(tran['trans_amt']);		
			//credits
			if (tAmount > 0) {
				if (creditMap[tDate]) {			
					creditMap[tDate] += Math.abs(tAmount);
				}
				else {				
					creditMap[tDate] = Math.abs(tAmount);
				}
				ctotal += Math.abs(tAmount);
			}
			//debits
			else {
				if (debitMap[tDate]) {
					debitMap[tDate] += Math.abs(tAmount);
				}
				else {
					debitMap[tDate] = Math.abs(tAmount);
				}
				dtotal += Math.abs(tAmount);
			}		
		}
	}
			
	populateCharts(debitMap, creditMap, dtotal, ctotal, ctype);
	var savingsDiv = document.querySelector('#amt-saved');
	savingsDiv.style.display = 'none';
	//console.log("via createbyCat");
	/*----------calcs----------*/
	catTotal = (dtotal != 0) ? dtotal : ctotal;		
	/*-------------------------*/
	
	createCatFactTable(catTotal, ags, (dtotal != 0));	
}

function createCatFactTable(catTotal, ags, isDebits) {
	
	console.log(`createCatFactTable: catTotal = ${catTotal}, debTotal = ${ags.debTotal}, credTotal = ${ags.credTotal} `);
		
	if (catTotal != ags.debTotal)
	{	
		var credTotal = ags.credTotal;	
		var cpercent = (catTotal/credTotal) * 100;
		cpercent = cpercent.toFixed(2);
		
		var debTotal = ags.debTotal;
		var dpercent = (catTotal/debTotal) * 100;
		dpercent = dpercent.toFixed(2);
		
		var cfTable = document.querySelector('#bits');
		cfTable.innerHTML = '';
		cfTable.style.display = 'block';
		
		var tr1= document.createElement('tr');		
		var td1 = document.createElement('td');
		var tPeriod = inYearView() ? "year" : inEpochView() ? "all-time" : "month";
		if (isDebits)
			td1.innerHTML = `Percentage of INCOME spent on ${ags.heading} for the ${tPeriod}: %${cpercent}`;
		else
			td1.innerHTML = `${ags.heading} percentage of income for [the] ${tPeriod}: %${cpercent}`;	
		
		var tr2= document.createElement('tr');		
		var td2 = document.createElement('td');
		
		if (isDebits)
			td2.innerHTML = `${ags.heading} as a percentage of SPENDING for the ${tPeriod}: %${dpercent}`;	
		
		tr1.append(td1);
		tr2.append(td2);
		
		cfTable.append(tr1);
		cfTable.append(tr2);	
	}
}

function createChart(transactions, ctype = chartType.PIE) {
	
	////TODO ADD GROUP FUNCTIONALITY////
	
	var creditMap = new Object();
	var debitMap = new Object();
	var dtotal = 0;
	var ctotal = 0;
	var tranCount = 0
	
	//build summary table
	while (tran = transactions[tranCount++]) {		
		tCategory = tran['trans_category'];			
		tAmount = parseFloat(tran['trans_amt']);				
		if (tCategory.toLowerCase() === "xfer") //transfer from one account to another TODO-> handled elsewhere?
			continue;
		//credits
		if (tAmount > 0) {
			if (creditMap[tCategory]) {			
				creditMap[tCategory] += Math.abs(tAmount);
			}
			else {				
				creditMap[tCategory] = Math.abs(tAmount);
			}
			ctotal += Math.abs(tAmount);
		}
		//debits
		else {
			if (debitMap[tCategory]) {
				debitMap[tCategory] += Math.abs(tAmount);
			}
			else {
				debitMap[tCategory] = Math.abs(tAmount);
			}
			dtotal += Math.abs(tAmount);
		}		
	}
	var savingsDiv = document.querySelector('#amt-saved');
	savingsDiv.style.display = 'block';
	//console.log("via createbydates");
	populateCharts(debitMap, creditMap, dtotal, ctotal, ctype);
}	

function populateCharts(debitMap, creditMap, dtotal, ctotal, ctype = chartType.PIE) {
	var debitRows = document.querySelector('#debit-overview');
	debitRows.innerHTML = "";
	var creditRows = document.querySelector('#credit-overview');
	creditRows.innerHTML = "";
		
	debov = document.querySelector('#debit-pie');
	debov.innerHTML = '';
	credov = document.querySelector('#credit-pie');
	credov.innerHTML = '';
	var tempo = Object.entries(debitMap).length;
	//console.log(`in populateCharts: ${tempo}`);
	
	if (Object.entries(debitMap).length > 0) {
		document.querySelector('#detail-table1').style.display = 'block';
		//console.log("debitBlcok");
		drawChart(debitMap, document.getElementById('debit-pie'), Object.entries(debitMap).length, ctype);
		document.querySelector('#tot-deb').innerHTML = dtotal.toFixed(2);
		populateSummaryTable(debitMap, debitRows);
	}
	else
		document.querySelector('#detail-table1').style.display = 'none';
	
	
	if (Object.entries(creditMap).length > 0) {
		document.querySelector('#detail-table2').style.display = 'block';
		//console.log("creditBlcok");
		drawChart(creditMap, document.getElementById('credit-pie'), Object.entries(creditMap).length, ctype);		
		document.querySelector('#tot-cred').innerHTML = ctotal.toFixed(2);
		populateSummaryTable(creditMap, creditRows);
	}
	else
		document.querySelector('#detail-table2').style.display = 'none';
		
	var savingsDiv = document.querySelector('#amt-saved');
	var totsaved = ctotal - dtotal;
	savingsDiv.innerHTML = `Total Savings: ${totsaved.toFixed(2)}`;
			//console.log(`ctot: ${ctotal}, dtot ${dtotal}, totes: ${totsaved}`);
}

function populateSummaryTable(tranMap, summaryElement) {
		
		//console.log(`populate Summary Table`);
		let finEntries = Object.entries(tranMap);
		let sortedFinEntries = finEntries.sort((a, b) => b[1] - a[1]);
				//console.log("tranMap");
				//console.log(tranMap);
				//console.log("sortedFinEntires");
				//console.log(sortedFinEntries);
		let entryCount = 0;
		for (const [key, value] of Object.entries(sortedFinEntries)) {		
			var tr1 = document.createElement('tr');		
			var td0 = document.createElement('td');
			var td1 = document.createElement('td');
			var div0 = document.createElement('div');
			var div1 = document.createElement('div');
			div0.innerHTML = value[0];
			div1.innerHTML = `$ ${value[1].toFixed(2)}`;
			
			var divClickAttr = document.createAttribute('onClick');
			var divClickFunction = `catView('${value[0]}', column.CAT)`;
			divClickAttr.value = divClickFunction;
			div0.setAttributeNode(divClickAttr);
					//console.log(`value[0] : ${value[0]}`);
			td0.append(div0);
			td1.append(div1);
			tr1.append(td0);
			tr1.append(td1);
			summaryElement.append(tr1);	
					//console.log(`key: ${key}, val: ${value}`);
		}	
}

// Draw the chart and set the chart values
function drawChart(tranMap, outerElement, tcount, ctype = chartType.PIE) {
	kk = Object.keys(tranMap);
			//console.log("drawChart call");
			//console.log(`map: ${kk}, tcount ${tcount}`);
	var chartData = buildList(tranMap);
	var data = google.visualization.arrayToDataTable(chartData);
	let scaledHeight = 800;
	if (ctype == chartType.PIE) {
		var chart = new google.visualization.PieChart(outerElement); 
				//console.log("pie");
	}
	else {//bar chart
		var chart = new google.visualization.BarChart(outerElement); 
				//console.log("bar");
		scaledHeight = 50 * tcount;	
	}
	var options = { 
		is3D: true, 
		'width':800, 
		'height':scaledHeight};
	chart.draw(data, options);
}  

function buildList(imap) {
	var tranMapKeys = Object.keys(imap);
	
	var returnList = [["Title", "Summary"]];////////////////////TBD////////////
	for (k of tranMapKeys) {		
		var kv = [k , imap[k]];
		returnList.push(kv);
	}	
	return returnList;
}

function changeChart() {
	var chartViewBtn = document.querySelector("#chart-view-btn");
	var stateIndicator = chartViewBtn.innerHTML;
	
	console.log(`start changeChart,stateIndicator: ${stateIndicator}`);
	let ctype = chartType.PIE;
	//Chart in Pie state if stateIndicator == bar graph
	if (stateIndicator == "Bar Graph") {
		chartViewBtn.innerHTML = "Pie Graph";
		ctype = chartType.BAR;		
		//console.log("barbranch");
	}
	else {		
		chartViewBtn.innerHTML = "Bar Graph";
		ctype = chartType.PIE;
		//console.log("piebranch");
	}
	
	var cat_grpDiv = document.querySelector('#cat-grp');
	//looks like: Viewing : [some category name] category
	var msg = cat_grpDiv.innerHTML;
	var bspindex = msg.lastIndexOf(" ");
	var fspindex = msg.indexOf(" ");
	var msgs = [msg.substring(fspindex,bspindex), msg.substring(bspindex)];
	//console.log(`msgs: ${msgs[0]}, ${msgs[1]} + button inner: ${chartViewBtn.innerHTML}`);
	clearAllCharts();
	//using cat_grp div to indicate if we are looking at a category view or by month view
	//this will tell us which function to use to populate our graphic
	console.log(`${catOrDate} below is type of display`);
	console.log(`${cat_grpDiv.style.display} :: ${cat_grpDiv.innerHTML}`);
	console.log(`catOrDate == ${catOrDate}`);
	if (catOrDate) {
		//not displayed -> in non-category view
		console.log("in catOrDate");
		if(inYearView()) {	
			console.log(`in non-category view && in yearview`);
			var displayDate = document.querySelector('#date-span');
			var dd = displayDate.innerHTML;
			let rgex = /\d\d\d\d/;
			dd = dd.substring(dd.search(rgex));
			var yr = dd.substring(dd.search(rgex), dd.search(" "));
			loadTable(yr.concat("/11/11"), jperiod.YEAR, ctype);			
		}
		else if (inEpochView()) {
			console.log(`in category view && in epochview`);
			loadTable(0, jperiod.ALL, ctype);
			console.log(`load Table from inEpochView ${ctype}`);
		}
		else {
			var dateOrDefaultToZero = 0;
			console.log("not epoch, not year");
			//see if a value is in transaction input text box (i.e. user-input)
			
			dateOrDefaultToZero = globalDisplayedDate;
			console.log(`global disp date: ${globalDisplayedDate}`);
			
			if (dateElem = document.querySelector('#bydate').value) {
				var tdate1 = dateElem;
				console.log(`in date view (I guess) -tdate1: ${tdate1} `);								
				dateOrDefaultToZero = dateElem.replace(/-/g, "/");				
				console.log(`dateOrDefaultToZero: ${dateOrDefaultToZero} ++ ${dateElem}`);
			}
			//else if (dateElem = cat_grpDiv.innerHTML) {
				//dateOrDefaultToZero = dateElem;
		//	}
				
			loadTable(dateOrDefaultToZero,jperiod.MONTH,ctype);
			//console.log(`loadtable ${ctype}`);
		}
		//console.log('in the cat_grpDiv branch');
	}
	else {
		console.log(`msg0: ${msgs[0]}, msg1: ${msgs[1].trim()} vs ${msgs[1]}`);
		catView(msgs[0], (msgs[1].trim() == "group" || msgs[1].trim() == "grouping") ? column.GRP : column.CAT, ctype);
		console.log(`catview ${ctype} - gets here if cat_grp has cat `);
	}
	console.log("endof changeChart");
	
}




