document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});	
	google.setOnLoadCallback(loadTable);
		
	var findbyDateForm = document.querySelector('#search-bymonth-form');
	findbyDateForm.addEventListener('submit', findTransactionsByDate);
	
	var addTransDiv = document.querySelector("#add-trans");
	addTransDiv.style.display = 'none';
	
////console.log("domcontent loading");
	
	var addTransactionButton = document.querySelector('#add-trans-button');	
	addTransactionButton.addEventListener('click', () => showAddTransaction());
	
	var addTransactionForm = document.querySelector('#add-trans-form')
	addTransactionForm.addEventListener('submit', addTransaction);
	
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
	
	var chartViewBtn = document.querySelector("#chart-view-btn");
	chartViewBtn.addEventListener('click', changeChart);
	chartViewBtn.innerHTML = "Bar Graph";
	//console.log(`load chrtview: ${chartViewBtn.innerHTML}`);
	let currentDate = new Date();
	console.log(currentDate);
	
	createDateMenu();
	catOrDate = cod.DATE;
	
	
	
});//end addEventListener
