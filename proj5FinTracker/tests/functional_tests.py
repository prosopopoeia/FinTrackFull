from selenium import webdriver
import unittest

class VisitFinPageTest(unittest.TestCase):
    
    def setUp(self):
        self.browser = webdriver.Firefox()

    def tearDown(self):
        self.browser.quit()
        
    def test_expected_Page_Retrieved(self):
        self.browser.get('http://127.0.0.1:8000/')
        self.assertIn('Fantastic Fin-Tracker', self.browser.title)
        self.fail('incorrect title, actual title is: ' + self.browser.title)

if __name__ == '__main__':
    unittest.main()
#User logs into site


