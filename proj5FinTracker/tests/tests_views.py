from django.test import RequestFactory, TestCase
import json
#import proj5FinTracker.views
from proj5FinTracker.models import BankTransaction
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.models import User
from django.urls import reverse

class MostBasicTest(TestCase):
      
    def test_try_pass_assert(self):
        self.assertEqual(1 + 2, 3)
        
class inputStatementTests(TestCase):    

    #run once for class
    @classmethod
    def setUpTestData(cls):
        User = get_user_model() #get custom User rather than django.contrib...User
        main_user = User.objects.create(username='proppy')
        secondary_user = User.objects.create(username='props', password='1234')############################
        
        #secondary_user.save()
        
        BankTransaction.objects.create(
            trans_date="2020-12-12",
            trans_amt="100.00",
            trans_msg="transnational transaction",
            trans_category="tulette",
            trans_group="gorsha",
            trans_owner=main_user)
            
        BankTransaction.objects.create(
            trans_date="2020-11-12",
            trans_amt="10.00",
            trans_msg="transnational transaction II",
            trans_category="joil-span",
            trans_group="crinshaw",
            trans_owner=main_user)
        
    # run once for every test method###################################################
    def setUp(self):
        pass#session = self.client.session
        #session['current_user'] = 'prosopopoeia'        
        #session.save()
        
    def test_index(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)    
        
    def test_check_template(self):
        response = self.client.get('/vinput')
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
        
    def test_check_status(self):        
        self.client.login(username='prosopopoeia', password='friendx')
                
        #self.assertEqual(self.client.session['current_user'],'prosopopoeia')
        response = self.client.post('/jsvsave', 
            data=json.dumps({                  
                  "trans_date": "02-02-2020",
                  "trans_amt": "100.00",
                  "trans_msg": "transnational transaction",
                  "trans_category": "oaken-wood",
                  "trans_group": "furnishings"}),
                  content_type="application/json",
                  current_user="prosopopoeia")
        self.assertEqual(response.status_code, 302)
       
    def test_update(self):
        response = self.client.post('/vupdateEntry',
            data=json.dumps({
    # def test_login(self):
        # response = self.client.post('/vlogin',
            # username = 'props',
            # password = '1234')
        # print(response)
        # pass#self.assertEqual(response.status_code, 201)
            
    
    # def test_response_content(self):
        # response = self.client.get('/vupdateEntry')
        # msg = response.json()        
        # self.assertEqual(msg['msg'],"cecil 2")
        
    # def test_entry_is_returned(self):
        # testFile = open('proj5FinTracker/d9.pdf', 'r', encoding='utf-8', errors='ignore')
        # response = self.client.post('/vupload', data={'file_name': testFile})
        # self.assertContains(response,'CREDIT')
        # #self.assertIs(response.status_code, 300)
        
    
        