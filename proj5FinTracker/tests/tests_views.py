from django.test import Client, TestCase#, RequestFactory
import json
#import proj5FinTracker.views
from django.core.files import File
from proj5FinTracker.models import BankTransaction, User
from django.contrib.auth import authenticate, login, logout, get_user_model
#from django.contrib.auth.models import User
from django.urls import reverse


class MostBasicTest(TestCase):
      
    def test_try_pass_assert(self):
        self.assertEqual(1 + 2, 3)
        
class inputStatementTests(TestCase):    

    @classmethod
    def UserFactory(numb, name):
        #User = get_user_model() #get custom User rather than django.contrib...User
        #print('created user:')
        
        gen_user = User.objects.create(username=name, password='password')
        
        #print(gen_user.username)
        return gen_user
        
        
    def setUp(self):
        self.gen_user = self.UserFactory('banjo')
        #print(self.gen_user.username)
        BankTransaction.objects.create(
                trans_date="2020-10-12",
                trans_amt="100.00",
                trans_msg="transnational transaction",
                trans_category="tulette",
                trans_group="gorsha",
                trans_owner=self.gen_user)
            
        
        BankTransaction.objects.create(
            trans_date="2020-10-01",
            trans_amt="10.00",
            trans_msg="transnational transaction II",
            trans_category="joil-span",
            trans_group="crinshaw",
            trans_owner=self.gen_user)
        
        #print(BankTransaction.objects.filter(trans_owner=self.gen_user).first().trans_amt)
        
    # TODO need tear down
    def test_table_vmonth_redirects(self):   
        """ test 1"""        
        #login = self.client.login(username='propy', password='4321')
        response = self.client.post(reverse('vmonth'))
        #self.assertEqual(str(response.context['username']), 'proppy')
        self.assertEqual(response.status_code, 302)
        #self.assertTemplateUsed(response, 'proj5FinTracker/singlePageTransactions.html')
        
    def test_index(self):
        response = self.client.get(reverse('vimonth'))
        self.assertEqual(response.status_code, 302)    
        
    def test_index_redirects2(self):
        response = self.client.get('/')
        #print(response.content)
        self.assertEqual(response.status_code, 302)
        
    def test_check_template_input(self):
        response = self.client.get('/vinput')
        self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    
    
    def test_can_upload_document(self):
        pass
        #util_client = Client()
        #util_client.login(username=self.gen_user.username, password='password')
        #util_client.FILES = {'file_name': 'mocks\\b_est.txt'}
        #print(util_client.FILES['file_name'])
        #print(util_client.POST)
        #print(self.gen_user.username)      
        #response = self.client.post('/vupload', util_client.FILES)
        #print(response)        
        #self.assertTemplateUsed(response, 'proj5FinTracker/input.html')    

    def test_range_form_returned(self):
        response = self.client.get('/vrange')
        #print(response.content)
        self.assertContains(response, 'bybeginrange')
        self.assertContains(response, 'byendrange')
    
    def test_vrange_template(self):
        response = self.client.get('/vrange')
        self.assertTemplateUsed('proj5FinTracker/compare.html')
        
##############################################################################
##                              JSV TESTS                                   ##
##############################################################################
    #def test_login(self):
        #test_client = Client()
        #response = test_client.get('/vlogin', follow=True)
        #print(self.gen_user.username)
        #print(self.gen_user.password)
        #response = test_client.post('/vlogin', {'username': self.gen_user.username, 'password': 'password'})
        #print(response.content)
        #pass
    
    def test_jsvperiod_month(self):
        huh = BankTransaction.objects.create(
                trans_date="2020-10-1",
                trans_amt="100.00",
                trans_msg="transnational transaction",
                trans_category="torte-le",
                trans_group="jimp-su",
                trans_owner=self.gen_user)
        print(huh)
        #print(BankTransaction.objects.first().trans_category)
        #print(BankTransaction.objects.filter(trans_date__day=1).first().trans_category)
        #self.client.login(username=self.gen_user.username, password='password')
        print(self.gen_user.username)      
        test_date = "2020-10-1"
        jdata = {"jsdate": "2020-10-01"}
        #response = self.client.post(reverse('jsvperiod'), json.dumps(jdata))
        #    data={"jsdate": test_date})
        response = self.client.post('/jsvperiod', kwargs=json.dumps(jdata), follow=True)
            #kwargs={"jsdate": test_date,
            #"jstype": "1"})
        #repo = response.json()
        #print(repo)
        print(response.redirect_chain)
        print(jdata)
        dumped = json.dumps(jdata)
        print(dumped)
        loaded = json.loads(dumped)
        print(loaded)
        #self.assertEqual(response.status_code, 302)
        self.assertEqual(response.status_code, 200)
        #pass
        
    def test_check_status(self): 
        #c = self.client(content_type=application/json)
        response = self.client.post('/jsvsave', 
                    
                  {"trans_date": "02-02-2020",
                  "trans_amt": "100.00",
                  "trans_msg": "transnational transaction",
                  "trans_category": "oaken-wood",
                  "trans_group": "furnishings"},
                  content_type="application/json",
                  current_user="props")
        self.assertEqual(response.status_code, 302)
    

##############################################################################
##                              UNIMPLEMENTED                               ##
##############################################################################    
        
    #def test_update(self):
     #   response = self.client.post('/vupdateEntry',
      #      data=json.dumps({
            
            
            
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
        
    
        