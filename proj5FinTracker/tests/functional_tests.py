from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import unittest

class VisitFinPageTest(unittest.TestCase):
    
    def setUp(self):
        self.browser = webdriver.Firefox()

    def tearDown(self):
        self.browser.quit()
        
    def test_expected_Page_Retrieved(self):
        self.browser.get('http://127.0.0.1:8000/')
        
        #user visits page and sees login 
        self.assertIn('Fantastic Fin-Tracker', self.browser.title)
        list_item1 = self.browser.find_element(By.TAG_NAME, 'li').text
        self.assertEqual(list_item1, "Month View")
        
        # assumed register user logs into account
        #usernamebox = self.browser.find_element_by_name('username')
        usernamebox = self.browser.find_element(By.NAME, 'username')
        passwordbox = self.browser.find_element(By.NAME, 'password')
        usernamebox.send_keys('prosopopoeia')
        passwordbox.send_keys('friendx')
        loginbutton = self.browser.find_element(By.ID,'loginButton')
        loginbutton.send_keys(Keys.ENTER)
        time.sleep(1)
        
        
        

if __name__ == '__main__':
    unittest.main()
#User logs into site


