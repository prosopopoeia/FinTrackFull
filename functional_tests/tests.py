from django.test import LiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import unittest

class VisitFinPageTest(LiveServerTestCase): #unittest.TestCase):
    
    def setUp(self):
        print("begin set up")
        self.browser = webdriver.Firefox()
        #self.browser.get('http://127.0.0.1:8000/')
        self.browser.get(self.live_server_url)
        print("end set up - starting registration")
        register_button = self.browser.find_element(By.ID, 'reg')
        register_button.send_keys(Keys.ENTER)
        time.sleep(1)
            
        usernamebox = self.browser.find_element(By.NAME, 'username')
        emailbox = self.browser.find_element(By.NAME, 'email')
        passwordbox = self.browser.find_element(By.NAME, 'password')
        confirmationbox = self.browser.find_element(By.NAME, 'confirmation')
        submit = self.browser.find_element(By.NAME, 'submit-user')
        usernamebox.send_keys('testname')
        emailbox.send_keys('email@email.com')
        passwordbox.send_keys('testpassword')
        confirmationbox.send_keys('testpassword')
        submit.send_keys(Keys.ENTER)
        login_button = self.browser.find_element(By.ID, 'tlogin')
        login_button.send_keys(Keys.ENTER)
        print("end registrating")       
    
        time.sleep(5)
        try:    
            print("about to login")
            self.login()
            print("supposedly logged in")
            
        except:
                
            self.login()
        
        time.sleep(5)
        
        
        
    def login(self): 
        usernamebox = self.browser.find_element(By.NAME, 'username')
        passwordbox = self.browser.find_element(By.NAME, 'password')
        usernamebox.send_keys('testname')
        passwordbox.send_keys('testpassword')
        print("have da boxes")
        time.sleep(5)
        submit_login = self.browser.find_element(By.ID,'submit-login')
        submit_login.send_keys(Keys.ENTER)
        print("da enter depressed")
        time.sleep(5)
        
        

    def tearDown(self):
        self.browser.quit()
        #self.template
        
    def test_user_is_logged_in(self):
            
        self.assertIn('Fantastic Fin-Tracker', self.browser.title, "mismatch title indicates wrong page")
        try:
            list_item1 = self.browser.find_element(By.ID, 'tlogout').text
        except:
            list_item1 = None
            print('failed')
            
        self.assertEqual(list_item1, "Logout")
        #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
        
        
    def test_default_page_operations(self):
        
        time.sleep(1)
        #user adds transaction
        #!!!1 - hits 'Add transaction' to make input text boxes appear
        add_trans_button = self.browser.find_element(By.ID, 'add-trans-button')
        add_trans_button.send_keys(Keys.ENTER)
        time.sleep(1)
        add_transaction_amt = self.browser.find_element(By.ID, 'amt')
        add_transaction_msg = self.browser.find_element(By.ID, 'msg')
        add_transaction_cat = self.browser.find_element(By.ID, 'cat')
        add_transaction_grp = self.browser.find_element(By.ID, 'grp')
        add_transaction_button = self.browser.find_element(By.ID, 'add-btn')
        
        add_transaction_amt.send_keys("10")
        add_transaction_msg.send_keys("10 test dollars")
        add_transaction_cat.send_keys("test cat")
        add_transaction_grp.send_keys("test group")
        
        add_transaction_button.send_keys(Keys.ENTER)
        time.sleep(1)
        
        trans_table = self.browser.find_element(By.ID, 'target')
        transactions = trans_table.find_elements(By.TAG_NAME, 'tr')
        self.assertIn('edit\ndelete\n2021-12-22\n10 test dollars\n10.00\ntest cat\ntest group', [transaction.text for transaction in transactions])
        # #for tranny in transactions:
        # #    print(f"number {nummy} is {tranny}")
            
#=============ASSORTED OPERATIONS:

        #self.browser.get('http://127.0.0.1:8000/')
        # assumed register user logs into account
        #usernamebox = self.browser.find_element_by_name('username')
        # usernamebox = self.browser.find_element(By.NAME, 'username')
        # passwordbox = self.browser.find_element(By.NAME, 'password')
        # usernamebox.send_keys('prosopopoeia')
        # passwordbox.send_keys('friendx')
        # loginbutton = self.browser.find_element(By.ID,'loginButton')
        # loginbutton.send_keys(Keys.ENTER)        
#if __name__ == '__main__':
#  unittest.main()



