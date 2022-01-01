from django.test import LiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import unittest
#from proj5FinTracker.models import BankTransaction, User

class VisitFinPageTest(unittest.TestCase):
    
    
    # @classmethod
    # def setUpTestData(cls):    
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
        print("begin set up")
        self.browser = webdriver.Firefox()
        self.browser.get('http://127.0.0.1:8000/')
        #self.browser.get(self.live_server_url)
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
        #l_user = User.objects.create(username="testname2")
        #l_user.set_password("testpassword")
        #print(l_user.username)
        login_button = self.browser.find_element(By.ID, 'tlogin')
        login_button.send_keys(Keys.ENTER)
        print("end registrating")       
    
        time.sleep(1)
        try:    
            print("about to login")
            self.login()
            print("supposedly logged in")
            
        except:
                
            self.login()
        #local_user = User.objects.get(username="testname")
        #local_user2 = User.objects.get(username="testname2")
        #print(local_user.username)
        #print(local_user2.username)
        # BankTransaction.objects.create(
            # trans_date="2021-12-12",
            # trans_amt="10.00",
            # trans_msg="10 tdollars",
            # trans_category="tcat",
            # trans_group="tgroup",
            # trans_owner=local_user)
        # example = BankTransaction.objects.get(trans_group="tgroup")
        # print(example.trans_msg)
        # time.sleep(1)
        
        
        
    def login(self): 
        usernamebox = self.browser.find_element(By.NAME, 'username')
        passwordbox = self.browser.find_element(By.NAME, 'password')
        usernamebox.send_keys('testname')
        passwordbox.send_keys('testpassword')
        print("have da boxes")
        time.sleep(1)
        submit_login = self.browser.find_element(By.ID,'submit-login')
        submit_login.send_keys(Keys.ENTER)
        print("da enter depressed")
        time.sleep(1)
        
        

    def tearDown(self):
        self.browser.quit()
        #self.template
        
    # def test_user_is_logged_in(self):
            
        # self.assertIn('Fantastic Fin-Tracker', self.browser.title, "mismatch title indicates wrong page")
        # try:
            # list_item1 = self.browser.find_element(By.ID, 'tlogout').text
        # except:
            # list_item1 = None
            # print('failed')
            
        # self.assertEqual(list_item1, "Logout")
        # #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
        
        
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
        time.sleep(5)
        add_transaction_button.send_keys(Keys.ENTER)
        time.sleep(5)
        
        
        trans_table = self.browser.find_element(By.ID, 'target')
        #transactions = BankTransaction.objects.all() #remove
        trannor = trans_table.find_elements(By.TAG_NAME, 'tr')
        #self.assertIn('edit\ndelete\n2021-12-22\n10 test dollars\n10.00\ntest cat\ntest group', [transaction.text for transaction in transactions])
        nummy = 0
        time.sleep(30)
        # print("tranny@transactions")
        # for tranny in transactions:
            # print(f"number {nummy} is {tranny.trans_msg}")
            # nummy = nummy + 1
        print("trannell@trannor")
        for trannel in trannor:
            print(f"number {nummy} is {trannel}")
            nummy = nummy + 1
        
        pass    
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
if __name__ == '__main__':
  unittest.main()



