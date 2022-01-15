from django.test import LiveServerTestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
import time
import unittest
from datetime import date
from proj5FinTracker.models import BankTransaction, User



class VisitFinPageTest(StaticLiveServerTestCase): #unittest.TestCase):
    fixtures = ["fixtures.json"]
    
    def setUp(self):
        self.MAX_WAIT = 10    
        print("begin set up")
        self.browser = webdriver.Firefox()        
        self.browser.get(self.live_server_url)
        print("end set up - starting registration")        
        login_button = self.browser.find_element(By.ID, 'tlogin')
        login_button.send_keys(Keys.ENTER)
        self.login()
        
    def login(self):
        lstart_time = time.time()
        while True:            
            try:
                usernamebox = self.browser.find_element(By.NAME, 'username')                
                passwordbox = self.browser.find_element(By.NAME, 'password')
                print(usernamebox.text)
                print(passwordbox.text)
                usernamebox.send_keys('testname')
                passwordbox.send_keys('testpassword')
                submit_login = self.browser.find_element(By.ID,'submit-login')
                print(submit_login.text)
                submit_login.send_keys(Keys.ENTER)
                print("submitted")
                break
            except (AssertionError, WebDriverException) as e:
                print(f"horrorerror: {e}")
                if (time.time() - lstart_time) > self.MAX_WAIT:
                    raise e
                time.sleep(0.5)
                
    def tearDown(self):
        self.browser.quit()

    ##Needs to be repaired##
    # def test_search_by_month(self):
        # time.sleep(1)
        # searchbox = self.browser.find_element(By.ID, 'bydate')
        # searchbutton = self.browser.find_element(By.ID, 'search-bymonth-button')
        
        # print('before searchbox')
        # #searchbox.send_keys('12/12/2021')
        # searchbox.click()
        
        # m = self.browser.find_elements_by_xpath("//table/tbody/tr/td")
        # #iterate over list
        # time.sleep(1)
        # print(m)
        # print(m[0])
        # time.sleep(1)
        # for i in m:
            # #verify required date then click
            # print(i)
            # if i.text == '3':
                # i.click()
            # break
        # #get selected date
        # s = searchbox.get_attribute('value')
        # print("Date entered is: ")
        # print(s)    
        # time.sleep(1)
        # searchbutton.send_keys(Keys.ENTER)
        # time.sleep(2.5)
        # trans_table = self.browser.find_element(By.ID, 'target')        
        # transactions = trans_table.find_elements(By.TAG_NAME, 'tr')        
        # self.assertIn(f'2021-12-18', [transaction.text for transaction in transactions])
        
    # def test_bank_transaction_fixture_isvalid(self):
        # bt = BankTransaction.objects.get(pk=1)
        # self.assertEqual(bt.trans_msg, "bones")
        # print(f"bt: {bt.trans_msg}")
                
    # def test_user_is_logged_in(self):
        # self.assertIn('Fantastic Fin-Tracker', self.browser.title, "mismatch title indicates wrong page")
    
    # def test_delete_entry(self):
        # time.sleep(1)
        
        # trans_table = self.browser.find_element(By.ID, 'target')        
        # transactions = trans_table.find_elements(By.TAG_NAME, 'tr')    
        # self.assertIn("bones", transactions[0].text)
        
        # time.sleep(1)
        # deleteButton = self.browser.find_element(By.ID, 'deletebutton1')
        # deleteButton.send_keys(Keys.ENTER)
        # time.sleep(1)
        # obj = self.browser.switch_to.alert
        # obj.accept()
        # time.sleep(1)
        # transactions2 = trans_table.find_elements(By.TAG_NAME, 'tr') 
        # self.assertNotIn("bones", transactions2[0].text)
       
    
    # def test_add_new_transaction(self):
        # #refactor out of here
        # tyr = date.today().year
        # if date.today().month < 10:
            # tmo = f"0{date.today().month}"
        # else:
            # tmo = str(date.today().month)
        # if date.today().day < 10:
            # tdy = f"0{date.today().day}"
        # else:
            # tdy = str(date.today().day)
        # tdate = f"{tyr}-{tmo}-{tdy}"
        # #^refactor^
        
        # #print(f'lexample: {tyr}')        
        # lstart_time = time.time()
        # while True:
            # try:
                # add_trans_button = self.browser.find_element(By.ID, 'add-trans-button')
                # add_trans_button.send_keys(Keys.ENTER)
                # add_transaction_amt = self.browser.find_element(By.ID, 'amt')
                # add_transaction_msg = self.browser.find_element(By.ID, 'msg')
                # add_transaction_cat = self.browser.find_element(By.ID, 'cat')
                # add_transaction_grp = self.browser.find_element(By.ID, 'grp')
                # add_transaction_button = self.browser.find_element(By.ID, 'add-btn')
                
                # add_transaction_amt.send_keys("10")
                # add_transaction_msg.send_keys("10 test dollars")
                # add_transaction_cat.send_keys("test cat")
                # add_transaction_grp.send_keys("test group")
                # add_transaction_button.click()#send_keys(Keys.ENTER)
        
                # break
            # except (AssertionError, WebDriverException) as e:
                # print(f"another error: {lstart_time} :: \n{e}: ")
                # if (time.time() - lstart_time) > self.MAX_WAIT:
                    # raise e
                # time.sleep(0.5)
        # # get displayed transactions
        # trans_table = self.browser.find_element(By.ID, 'target')        
        # transactions = trans_table.find_elements(By.TAG_NAME, 'tr')        
        # self.assertIn(f'edit\ndelete\n2022-01-01\ntestmsg1\n10.00\ntestcat1\ntestgroup1', [transaction.text for transaction in transactions])
            
#=============ASSORTED OPERATIONS:

#print([transaction.text for transaction in transactions2])

        # while True:
            # start_time = time.time()
            # try:
                # usernamebox = self.browser.find_element(By.NAME, 'username')
                # emailbox = self.browser.find_element(By.NAME, 'email')
                # passwordbox = self.browser.find_element(By.NAME, 'password')
                # confirmationbox = self.browser.find_element(By.NAME, 'confirmation')
                # submit = self.browser.find_element(By.NAME, 'submit-user')
                # usernamebox.send_keys('testname')
                # emailbox.send_keys('email@email.com')
                # passwordbox.send_keys('testpassword')
                # confirmationbox.send_keys('testpassword')
                # submit.send_keys(Keys.ENTER)
                # break
            # except (AssertionError, WebDriverException) as e:
                # if (time.time() - start_time) > self.MAX_WAIT:
                    # raise e
                # time.sleep(0.5)




        #self.browser.get('http://127.0.0.1:8000/')
        # assumed register user logs into account
        #usernamebox = self.browser.find_element_by_name('username')
        # usernamebox = self.browser.find_element(By.NAME, 'username')
        # passwordbox = self.browser.find_element(By.NAME, 'password')
        # usernamebox.send_keys('prosopopoeia')
        # passwordbox.send_keys('friendx')
        # loginbutton = self.browser.find_element(By.ID,'loginButton')
        # loginbutton.send_keys(Keys.ENTER)        
        #self.browser.refresh()
#if __name__ == '__main__':
#  unittest.main()



