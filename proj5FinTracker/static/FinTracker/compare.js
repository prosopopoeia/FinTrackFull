document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});
	/////HERE IS CALL TO INITIAL LOADING	
	//google.setOnLoadCallback(getTransactionsInRange);
	
	// form to get range
	var yearCompare = document.querySelector('#compare-form');
	yearCompare.addEventListener('submit', showCompare);

	//var yearCompare2 = document.querySelector('#compare-button');
	//yearCompare2.addEventListener('click', comp);
	
});//end addEventListener	
	

function compareCatData(pdate = 0, ucategory = "unknown", period = jperiod.MONTH) {
	//get number of trasactions for given category
	console.log("called compareCatData");
	var returnCount = 0;
	fetch('/jsvgetcount', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jscat: ucategory,
			jstype: period
		})
	})
	.then(response => response.json())
	.then(result => {
		console.log(`about to return from then: ${result['agcount']}`);
		cspot = document.querySelector('#term1');
		cspot.innerHTML = result['agcount'];
	});
	//console.log("end of compare catData")	
}

async function showCompare(event) {
	event.preventDefault();
	var v1 = document.querySelector('#value1')
	var v2 = document.querySelector('#value2')
	
	let strVal1 = v1.value.toString();
	let strVal2 = v2.value.toString();		
	
	compareYear();
	compareCatData(strVal1.concat("/11/11"), "grocery", jperiod.YEAR);	
}
	
function compareYear()	{
	
	console.log("compare year");
	var v1 = document.querySelector('#value1')
	var v2 = document.querySelector('#value2')
	
	let strVal1 = v1.value.toString();
	let strVal2 = v2.value.toString();
	
	console.log(strVal1.concat("/11/11"))
	console.log(strVal2)
	loadFlexTable(strVal1.concat("/11/11"),jperiod.YEAR, "#target");
	loadFlexTable(strVal2.concat("/11/11"),jperiod.YEAR, "#rTarget");
	//loadYear(strVal1);
	//loadYear("2021");
		//loadYear("2020");
		//loadYear("2019");
}



function loadFlexTable(pdate = 0, period = jperiod.MONTH, ctarget = "#target") {
	
	//console.log(`loadTable ctype before period: ${period}`);
			
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: pdate,
			jstype: period
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		//console.log("loadTable: transactions: ");
		//console.log(transactions[0]['trans_category']);
		
		var edate = document.querySelector('#edit-date')
		edate.addEventListener('click', () => sortByColumn(transactions, column.DATE, pdate, period));
		
		var eamt = document.querySelector('#edit-amount')
		eamt.addEventListener('click', () => sortByColumn(transactions, column.AMT, pdate, period));
		
		var ecat = document.querySelector('#edit-category')
		ecat.addEventListener('click', () => sortByColumn(transactions, column.CAT, pdate, period));

		//console.log(transactions);
		var transRows = document.querySelector(ctarget);
	    transRows.innerHTML = "";		
		for (let tran of transactions) {
			//console.log(tran['trans_category'])
			displayCTrans(tran, ctarget)
		}			
	});		
}

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
	var transRows = document.querySelector(ctarget);
	transRows.append(tr1);
	
	let currentDate = new Date();
	//console.log(currentDate);		
}

///////	//////////set up search function here////////////////////
	/*
	
	findbyDateForm.addEventListener('submit', getTransactionsInRange);	
	
	
	var navyearItem = document.querySelector('#navyear');
	let yearFuncAttr = document.createAttribute('onClick');
	yearFuncAttr.value = `loadYear()`;
	navyearItem.setAttributeNode(yearFuncAttr); 
	
	var epochItem = document.querySelector('#navepoch');
	epochItem.addEventListener('click', loadEpoch);
	
	var navmonth = document.querySelector('#navmonth');
	var nmclass = document.createAttribute('class');
	nmclass.value = `active`;
	navmonth.setAttributeNode(nmclass);	
	
	var datespan = document.querySelector('#date-span');
	datespan.style.display = 'none';
	
	var leftPanel = document.querySelector('#leftPanel');
	leftPanel.style.display = 'none';
	
	var trantable = document.querySelector('#tran-table');
	trantable.style.display = 'none';
	
	var detable = document.querySelector('#detail-table1');
	detable.style.display = 'none';
	
	var affs = document.querySelector('#aggregates');
	affs.style.display = 'none';
	
	var chartViewBtn = document.querySelector("#chart-view-btn");
	chartViewBtn.addEventListener('click', changeChart);
	chartViewBtn.innerHTML = "Bar Graph";
	//console.log(`load chrtview: ${chartViewBtn.innerHTML}`);
	let currentDate = new Date();
	//console.log(currentDate);
	//createDateMenu();
	catOrDate = cod.DATE;
	*/
	
	


