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
    
    
    #@classmethod
    #def setUpTestData(cls): 
        
        # todays_date = str(date.today().year) + "-" + str(date.today().month) + "-01"
        # valid_month = cls.get_valid_month(cls)       
        # date_from_this_year = str(date.today().year) + "-" + str(valid_month) + "-01"
        # #ID 1
        # BankTransaction.objects.create(
            # trans_date=todays_date,
            # trans_amt="10.00",
            # trans_msg="todays transaction",
            # trans_category="todays category",
            # trans_group="todays group",
            # trans_owner=cls.gen_user)
        # #ID 2
        # BankTransaction.objects.create(
            # trans_date=date_from_this_year,
            # trans_amt="10.00",
            # trans_msg="this years transaction",
            # trans_category="this years category",
            # trans_group="this years group",
            # trans_owner=cls.gen_user)
        # #ID 3
        # BankTransaction.objects.create(
            # trans_date="2020-10-12",
            # trans_amt="100.00",
            # trans_msg="transnational transaction",
            # trans_category="tulette",
            # trans_group="gorsha",
            # trans_owner=cls.gen_user)
        # #ID 4        
        # BankTransaction.objects.create(
            # trans_date="2020-09-12",
            # trans_amt="110.00",
            # trans_msg="t2",
            # trans_category="t3",
            # trans_group="t4",
            # trans_owner=cls.gen_user)
        # #ID 5        
        # BankTransaction.objects.create(
            # trans_date="2020-08-12",
            # trans_amt="130.00",
            # trans_msg="t7",
            # trans_category="t6",
            # trans_group="t5",
            # trans_owner=cls.gen_user)
        # #ID 6
        # BankTransaction.objects.create(
            # trans_date="2020-10-01",
            # trans_amt="10.00",
            # trans_msg="transnational transaction II",
            # trans_category="joil-span",
            # trans_group="crinshaw",
            # trans_owner=cls.gen_user)
            
        # cls.transaction_count = BankTransaction.objects.count()
            
    def setUp(self):
        self.MAX_WAIT = 10    
        print("begin set up")
        self.browser = webdriver.Firefox()
        #self.browser.get('http://127.0.0.1:8000/')
        self.browser.get(self.live_server_url)
        print("end set up - starting registration")
        register_button = self.browser.find_element(By.ID, 'reg')
        register_button.send_keys(Keys.ENTER)
       
        while True:
            start_time = time.time()
            try:
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
                break
            except (AssertionError, WebDriverException) as e:
                if (time.time() - start_time) > self.MAX_WAIT:
                    raise e
                time.sleep(0.5)
        # try:
            # # wait few seconds before looking for element
            # loci = WebDriverWait(self.browser, 5).until(
                # EC.presence_of_element_located((By.NAME, 'username'))
            # )
        # finally:
            # # else quit
            # self.browser.quit()        
        # usernamebox = self.browser.find_element(By.NAME, 'username')
        # emailbox = self.browser.find_element(By.NAME, 'email')
        # passwordbox = self.browser.find_element(By.NAME, 'password')
        # confirmationbox = self.browser.find_element(By.NAME, 'confirmation')
        # submit = self.browser.find_element(By.NAME, 'submit-user')
        
        l_user = User.objects.create(username="testname2")
        l_user.set_password("testpassword")
        print(l_user.username)
        login_button = self.browser.find_element(By.ID, 'tlogin')
        login_button.send_keys(Keys.ENTER)
        print("end registrating")       
    
        #time.sleep(1)
        self.login() 
            
        local_user = User.objects.get(username="testname")
        local_user2 = User.objects.get(username="testname2")
        print(local_user.username)
        print(local_user2.username)
        BankTransaction.objects.create(
            trans_date="2021-12-12",
            trans_amt="10.00",
            trans_msg="10 tdollars",
            trans_category="tcat",
            trans_group="tgroup",
            trans_owner=local_user)
        example = BankTransaction.objects.get(trans_group="tgroup")
        print(example.trans_msg)
        #time.sleep(1)
        
        
    # def wait_for_element(elem):
        # start_time = time.time()
        
    def login(self): 
        while True:
            lstart_time = time.time()
            try:
                usernamebox = self.browser.find_element(By.NAME, 'username')                
                passwordbox = self.browser.find_element(By.NAME, 'password')
                usernamebox.send_keys('testname')
                passwordbox.send_keys('testpassword')
                submit_login = self.browser.find_element(By.ID,'submit-login')
                submit_login.send_keys(Keys.ENTER)
        
                break
            except (AssertionError, WebDriverException) as e:
                if (time.time() - lstart_time) > self.MAX_WAIT:
                    raise e
                time.sleep(0.5)
                
    def tearDown(self):
        self.browser.quit()
                
    # def test_user_is_logged_in(self):
            
        self.assertIn('Fantastic Fin-Tracker', self.browser.title, "mismatch title indicates wrong page")
        # try:
            # list_item1 = self.browser.find_element(By.ID, 'tlogout').text
        # except:
            # list_item1 = None
            # print('failed')
            
        # self.assertEqual(list_item1, "Logout")
        # #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
        
        
    def test_add_new_transaction(self):
        tyr = date.today().year
        if date.today().month < 10:
            tmo = f"0{date.today().month}"
        else:
            tmo = str(date.today().month)
        if date.today().day < 10:
            tdy = f"0{date.today().day}"
        else:
            tdy = str(date.today().day)
        tdate = f"{tyr}-{tmo}-{tdy}"
        print(tdate)
        #user adds transaction
        #hits 'Add transaction' to make input text boxes appear
        while True:
            lstart_time = time.time()
            try:
                add_trans_button = self.browser.find_element(By.ID, 'add-trans-button')
                add_trans_button.send_keys(Keys.ENTER)
                add_transaction_amt = self.browser.find_element(By.ID, 'amt')
                add_transaction_msg = self.browser.find_element(By.ID, 'msg')
                add_transaction_cat = self.browser.find_element(By.ID, 'cat')
                add_transaction_grp = self.browser.find_element(By.ID, 'grp')
                add_transaction_button = self.browser.find_element(By.ID, 'add-btn')
                
                add_transaction_amt.send_keys("10")
                add_transaction_msg.send_keys("10 test dollars")
                add_transaction_cat.send_keys("test cat")
                add_transaction_grp.send_keys("test group")
                add_transaction_button.click()#send_keys(Keys.ENTER)
        
                break
            except (AssertionError, WebDriverException) as e:
                if (time.time() - lstart_time) > self.MAX_WAIT:
                    raise e
                time.sleep(0.5)
        # get displayed transactions
        trans_table = self.browser.find_element(By.ID, 'target')        
        transactions = trans_table.find_elements(By.TAG_NAME, 'tr')
        
        self.assertIn(f'edit\ndelete\n{tdate}\n10 test dollars\n10.00\ntest cat\ntest group', [transaction.text for transaction in transactions])
            
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
        #self.browser.refresh()
#if __name__ == '__main__':
#  unittest.main()



