document.addEventListener('DOMContentLoaded', function() {
	
	getAllData();	
			
});//end addEventListener


function getAllData(period) {
	
	// Get all transactions for current user
	fetch('jsvmonth', {
		method: 'POST',
		body: JSON.stringify({
			jsdate: 0,
			jstype: jperiod.ALL
		})			
	})
	.then(response => response.json())
	.then(transactions => {	
		calculateDict(transactions);
		console.log(`transection: ${transactions[1].trans_category}`);
	});
	
}

function calculateDict(transactions) {
	AllIncomeMap = new Object();
	AllExpensesMap = new Object();
	
	expensesByCatMap = new Object();
	incomeByCatMap = new Object();
	
	expensesByDateMap = new Object();
	incomeByDateMap = new Object();
	
	
	/**********************
	Group monthly expenses by
		group
		cat
		all	
	************************/
	tCount = 0;
	while (tran = transactions[tCount++]) {
		tGroup = tran['trans_group'];
		tcat = tran['trans_category'];
		tdate = tran['trans_date'];
		tAmount = parseFloat(tran['trans_amt']);
		// Acumulate amounts for cats/groups
		if (tAmount < 0) {
			
			if(expensesByDateMap[tdate])
			{
				expensesByDateMap[tdate] += Math.abs(tAmount);
				++expensesByDateMap['count'];
				console.log(`1: count: ${expensesByDateMap[tdate]} amt: expensesByDateMap[tdate]`);
			}
			else {
				expensesByDateMap[tdate] = Math.abs(tAmount);
				expensesByDateMap['count'] = 1;
				console.log(`2: count: ${expensesByDateMap[tdate]} amt: expensesByDateMap[tdate]`);
			}
			
			if(expensesByCatMap[tcat]) {
				expensesByCatMap[tcat] += Math.abs(tAmount);
				++expensesByCatMap['count'];
				var sabs = Math.abs(tAmount);
				console.log(`tcat: ${tcat} tamount: ${tAmount} ${sabs}`);
				console.log(`3: count: ${expensesByCatMap[tcat]} amt: expensesByDateMap['count']`);
			}
			else {
				expensesByCatMap[tcat] = Math.abs(tAmount);
				expensesByCatMap['count'] = 1;
				console.log(`4: count: ${expensesByCatMap[tcat]} amt: expensesByDateMap['count']`);
			}
		}
		else {
			if (incomeByCatMap[tcat]) {
				incomeByCatMap[tcat] += tAmount;
				++incomeByCatMap['count'];
				console.log(`5: count: ${incomeByCatMap[tcat]} amt: incomeDateMap['count']`);
			}
			else {
				incomeByCatMap[tcat] = tAmount;
				incomeByCatMap['count'] = 1;
			}
			
			if(incomeByDateMap[tdate])
			{
				incomeByDateMap[tdate] += Math.abs(tAmount);
				++incomeByDateMap['count'];
				console.log(`7: count: ${incomeByDateMap[tdate]} amt: incomeDateMap['count']`);
			}
			else {
				incomeByDateMap[tdate] = Math.abs(tAmount);
				incomeByDateMap['count'] = 1;
			}
		//console.log(`incomeby date ${tdate}: count: ${expensesByDateMap['count']} amt ${expensesByDateMap[tdate]} + amt: ${tAmount}`)
		}		
	}
	//displayGraph(expensesByCatMap);
	
	/**********************
	Group monthly income by
		cat
		all	
	************************/
	
	/**********************
	line graph expenses	
	************************/

	/**********************
	line graph income
	************************/
	
}

function displayGraph(dataMap) {
	
}