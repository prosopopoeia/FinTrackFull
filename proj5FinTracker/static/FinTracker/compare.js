document.addEventListener('DOMContentLoaded', function() {
	
	//////////////////////////////////////////
	// load data and initialize display     //
	//////////////////////////////////////////	
	
	google.charts.load('current', {'packages':['corechart']});
	/////HERE IS CALL TO INITIAL LOADING	
	//google.setOnLoadCallback(getTransactionsInRange);
	
	// form to get range
	var yearCompare = document.querySelector('#by-year');
	yearCompare.addEventListener('click', compareYear);	
	
});//end addEventListener	
	
function compareYear()	{
		loadYear("2021");
		loadYear("2020");
		loadYear("2019");
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
	
	


