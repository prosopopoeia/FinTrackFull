document.addEventListener('DOMContentLoaded', function() {
	
	//formDiv.style.display = 'none';
	console.log("load input page");
	
		
	var inputForm = document.querySelector('#input-form-button');
	inputForm.addEventListener('submit',scanDocument());
	
			
});//end addEventListener

function scanDocument() {
	
	var index = 0;
	var dmpvar = document.querySelector('#unfound'); //a transaction that matches nothing in db -> need to categorize
	/* if (!!dmpvar) {		
		console.log (`if path of dmpvar: ${dmpvar}`);
	} */
	var transacts = JSON.parse(dmpvar.value);
	console.log(transacts);
	if (typeof transacts != 'undefined')
	{		
		while (transacts[index]) {
			console.log(`transacts,top: ${transacts[index]}`);
			var afterDateAmtPattern = /([^\s\.\d-,\(\)/]+.+|7ELEVEN|7-ELEVEN)/; 
			var datePattern = /\d{4}-\d{2}-\d{2}/;				//  -- 0000-00-00
			var amtPattern = /-?[\d+,?]*\d+\.\d{2}/;			//  -- 000.00
			var tdate = transacts[index].match(datePattern);
			var tamt = transacts[index].match(amtPattern);			
			var desc = transacts[index].match(afterDateAmtPattern);			
			var ocat = getCategory(transacts[index++]);
			//console.log(`date: ${tdate}`);
			console.log(`ddescription: ${afterDateAmtPattern}`);
			console.log(`desc: ${desc}`);
			fetch('jsvsave', { //vupdateEntry', {
				method: 'POST',
				body:	JSON.stringify({
					trans_date : tdate[0],
					trans_amt : tamt[0],
					trans_msg : desc[0],
					trans_category : ocat[0],
					trans_group: ocat[1]
				})
			})
			.then(response => response.json())
			.then(result => {
				console.log("in then from fetch");
				console.log(result['msg4']);
				console.log('msg4 above');
				//console.log(result.msg);
			})
			.catch(error => {
				console.log('tError:', error);  
			});	
		}//end while
	}
}

function getCategory(entry) {

  console.log(`get cat: ${entry}`);
  var cat = prompt("Please provide the category of this entry:\n" + entry);
  var group = prompt("group for \n" + entry);  
  return [cat, group];
}