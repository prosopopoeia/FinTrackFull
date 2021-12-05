10/20
Note: this is orignally from a school project. Using Javascript to avoid reloading pages is pretty nice, but definitely presents design problems. This project has outsized a single page. Next step adding tests to facilitate refactoring code into cohesive modular units. 

FinTrack v1.0 (FT1)

One of the big incentives to take this course and learn Django and Javascript is to harness the power and flexibility of full stack programming. 
What better way to spin out useful apps for everyday life. This application is in that spirit. It is a Financial Tracker. It simply records, tracks,
and then displays back to the user, useful views of the user's finanaces. 

Users can view historical transaction data by Month, Year, or over the entire lifetime of the applications use. Users can view see the information both
in a table and in a pie or bar chart. Users may add, delete, update, or view any transaction. Users can specify a period to view transactions (delineated by month/year).

One of the challenges of a application such as this is retrieving data from financial instituions. A bit of research shows that banks offer a number of different ways users
can access their financial data. Some, but by no means all, institutions offer API's with which users can download the data. This would be the preferred access. However, many 
smaller instituitions rely on more universal solutions such a comma separated lists (CSV). The CSV seems to be the lowest common denominator. It is because of the format's ubiquity
that it was chosen as the primary method of automated data entry rather than creating some sort of mock API similar to the Project 3 (Mail). Of course, entries can be added one by 
one but this is a very tedious chore. A sample CSV file is included in the project to be used for testing.


Distintivity and Complexity Requirements


1. Complexity and distinctiveness. 

	It would be difficult to avoid all overlap with previous assignments when creating a application of this nature. However, a number of distinct 
	features are presented in this application. To enumerate a few:
		
		- Graphics 
			The program features graphical components to help users to visual the data. These components are adaptations of a graphing library 
			provided by Google Charts (https://developers.google.com/chart/). These components were fairly easy to incorporate and provide a way to
			quickly evaluate the data presented. Users may toggle between a pie chart and a bar graph. The graphs and chart each had to accomodate a variety of views. It was necessary to make the visuals flexible enough to handle the 
			size of the data set used to populate the graphic. For instance, a view in which the user can look at all bank transactions over the 
			lifetime of their transactions had to be capable of displaying categories such that they were distiguishable from neighboring elements.
			For this purpose, a bar graph that scales based on the number of transactions in the data set is provided (though the option to view 
			the data via a pie chart is still available).
			
		- Parsing
			Text parsing using Python's regular expression library was employed to split apart the bank-statement like documents to extract the 
			relevant financial data. In addition, a utility to upload documents is provides another distinction from previous projects.
			
		- Document Utility
			Functionality to upload document for parsing.
			
		- Data Crunching
			Django's built-in filters and functions were used more extensively. Calculating and presenting it to the user was done.

2. 	Files - Below are files created for this project in addition to files which were generated by the Django which contain significant
	modifications.
	
		proj5FinTracker/
			forms.py
				contains Django forms:
					InputBankStatementForm - allow user to upload a document
					FindByDateForm - text box to input a date which is used to find a range of transactions
					TransactionForm - group of text boxes used to gather information on transactions for adding to the database
				
			models.py	
				BankTransaction - model to hold a financial transaction from a bank
				User - model to hold user information
			
			urls.py
				url mapping
			
			views.py
				different views to handle a range of functionality
			
		proj5FinTracker/templates/proj5FinTracker
			html pages
				index.html - home page
				layout.html - template to hold common elements
				login.html/register.html - authentication/regristraion pages
				singlePageTransactions.html - main container for the application
			
		proj5FinTracker/static/proj5FinTracker
			input.js - JS code to upload documents and call pdf parsing functions
			sstrans.js - JS code to support single page application - main functionality in this files
				
3. How to install/run
	Windows:
	clone repository to a local folder
	open command line in newly created folder
	make migrations - enter the following commands:
		python manage.py makemigrations
		python manage.py migrate
	start server
		python manage.py runserver
	navigate to http://127.0.0.1:8000 and register as a user
		
				
		
		

	
 
		
