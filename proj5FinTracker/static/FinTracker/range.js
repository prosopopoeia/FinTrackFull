document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});
/////HERE IS CALL TO INITIAL LOADING	
	//google.setOnLoadCallback(getTransactionsInRange);
	
	// form to get range
	var findbyDateForm = document.querySelector('#search-range-form');
	
///////	//////////set up search function here////////////////////
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
	
	
	
});//end addEventListener

//*********Global Vars***************************************************************//
/*
var catOrDate;
var globalDisplayedDate;


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
*/
//*********Global Vars END***********************************************************//


function getTransactionsInRange() {
	console.log("ranger");
	event.preventDefault();
	//get date, .toString() it...
	
	var begdate = document.querySelector('#bybeginrange');
	let bpdate = begdate.value.toString();
	
	var enddate = document.querySelector('#byendrange');
	let epdate = enddate.value.toString();
	clearAllCharts();
	console.log(begdate.value);
	console.log(bpdate);
	console.log(enddate.value);
	console.log(epdate);
	fetch('jsvrange', {
		method: 'POST',
		body: JSON.stringify({
			begindate: bpdate,
			enddate: epdate			
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		transactions.forEach(displayTrans);		
		createChart(transactions, chartType.PIE);
		console.log("loadTable: transactions: ");
		//console.log(transactions);
		var datespan = document.querySelector('#date-span');
		datespan.style.display = 'block';
	
		var leftPanel = document.querySelector('#leftPanel');
		leftPanel.style.display = 'block';
		
		var trantable = document.querySelector('#tran-table');
		trantable.style.display = 'block';
		
		var detable = document.querySelector('#detail-table1');
		detable.style.display = 'block';
		
		var affs = document.querySelector('#aggregates');
		affs.style.display = 'block';
		
	});
	
}
