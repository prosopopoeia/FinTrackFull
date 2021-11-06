import json
import enum
from django.contrib.auth import authenticate, login, logout
from django.core.files import File
from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.db import IntegrityError
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from datetime import datetime, date
from json import dumps

from .models import User, BankTransaction
from .forms import InputBankStatementForm, FindByDateForm, TransactionForm, FindByRangeForm, CompareForm

from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFParser
import re

from io import StringIO

def index(request):
    if request.user.is_authenticated:
        return render(request, "proj5FinTracker/singlePageTransactions.html")

    else:
        return HttpResponseRedirect(reverse("vlogin"))
       
    
def vlogin(request):
    if request.method == "POST":
        uname = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=uname, password=password)
    
        if user is not None:
            login(request, user)
            request.session["current_user"] = uname
            return HttpResponseRedirect(reverse("vmonth"))
        else:
            return render(request, "proj5FinTracker/login.html", {
                "message" : "Please, you have not logged in to your use account."
            })
    else:
        return render(request, "proj5FinTracker/login.html", {
                "message" : "Please, you have not logged in to your use account."
            })


def vlogout(request):
    logout(request)
    return HttpResponseRedirect(reverse("vlogin"))


def vregister(request):
    if request.method == "POST":
        uname = request.POST["username"]
        email = request.POST["email"]
        
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "proj5FinTracker/register.html", {
                "message" : "Passwords must match!"
            })
        
        try:
            user = User.objects.create_user(uname, email, password)
            user.save()
        except IntegrityError:
            return render(request, "proj5FinTracker/register.html", {
                "message" : "Username taken"
            })
        login(request, user)
        request.session["current_user"] = uname
        return HttpResponseRedirect(reverse("vmonth"))
    else:
        return render(request, "proj5FinTracker/register.html")


#-------depracated---------#   
# @csrf_exempt
# def vupdateEntry(request):
    # data = json.loads(request.body)
    # vdesc = data['ddescription']
    # c_user = get_user(request)
    
    # tmp_amt = data['damt']
    # tmp = 'success'
    # formatted_amt = tmp_amt.replace(",","")    
    # try:
        # BankTransaction.objects.create(
                    # trans_date=data['ddate'],
                    # trans_owner=c_user,
                    # trans_amt = float(formatted_amt),
                    # trans_msg = vdesc,
                    # trans_category = data['dcat'],
                    # trans_group = data['dgroup']
                    # )
    # except:
        # tmp = 'fail'
    # return JsonResponse({"msg1": data['ddate'],
                        # "msg2": data['damt'],
                        # "msg3": tmp,
                        # "msg4": vdesc})
                        
 
def get_text_month(month_ord):
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return months[month_ord - 1]    
    
    
def get_month_ordinal(month_str):
    
    months =   ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"]
    return (months.index(month_str) + 1)

 
class Period(enum.Enum):
   Day = 1
   Month = 2
   Year = 3 
   All = 4
    

@login_required
def vmonth(request):
    return byDateProcessing(request, Period.Month.value) 


@login_required
def vyear(request):
    return byDateProcessing(request, Period.Year.value)
          
          
@login_required
def byDateProcessing(request, period):
    try:
        this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
        
    #grab transactions for month & user
    FBDF = FindByDateForm()
    tform = TransactionForm()   
    
    return render(request, "proj5FinTracker/singlePageTransactions.html", {
        'search_form' : FBDF,
        'trans_form' : tform,
        'dperiod' : period      
    })


#-------called from month.js---------#                        
@login_required
@csrf_exempt
def jsvmonth(request):
    data = json.loads(request.body)
    vdate = data["jsdate"]
    if vdate == 0: 
        vyr = date.today().year
        vmo = date.today().month
    else:
        vyr = int(vdate[0:4])
        vmo = int(vdate[5:7])
        vdy = int(vdate[8:10])        

    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
    
    if data["jstype"] == Period.Month.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr, trans_date__month=vmo)
    elif data["jstype"] == Period.Year.value:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=vyr)
    else:
        transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

### View a range of transactions of a user-supplied period 
def vrange(request):
    fbrform = FindByRangeForm()
    return render(request, "proj5FinTracker/range.html", {
        'rangeform' : fbrform
    })

def vcompare(request):
    cmpform = CompareForm()
    return render(request, "proj5FinTracker/compare.html", {
        'compareform' : cmpform
    })

@login_required
@csrf_exempt
def jsvrange(request):
    #return JsonResponse({"message": "success"}, status=201) 
    data = json.loads(request.body)
    vbegindate = data["begindate"]
    venddate = data["enddate"]
    
    begyr = int(vbegindate[0:4])
    begmo = int(vbegindate[5:7])
    begdy = int(vbegindate[8:10])        
    
    endyr = int(venddate[0:4])
    endmo = int(venddate[5:7])
    enddy = int(venddate[8:10])
    
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
        
    transactions = BankTransaction.objects.order_by("-trans_date").filter(
        trans_owner=this_user,
        trans_date__range=[vbegindate,venddate])
        # trans_date__month__gte=begmo, 
        # trans_date__year__gte=begyr, 
        # trans_date__day__gte=begdy, 
        # trans_date__month__lte=endmo, 
        # trans_date__year__lte=endyr, 
        # trans_date__day__lte=enddy)
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

@login_required
@csrf_exempt
def jsvcat(request):    
    data = json.loads(request.body)
    category = data["jscat"]
    group = data["jsgrp"]
    mo_yr = data["jsdate"].strip()
    jperiod = data["jsperiod"];
    indy = mo_yr.index(' ')
    if jperiod == Period.Month.value:
        month = get_month_ordinal(mo_yr[0:indy])
    if jperiod == Period.Year.value:
        year = re.search("\d\d\d\d", mo_yr).group()
    else:
        year = mo_yr[indy:]
     
    try:
       this_user = get_user(request)
    except:
        return HttpResponseRedirect(reverse("vlogin"))
    
    if group == 0:
        if jperiod == Period.Year.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_category=category)
        elif jperiod == Period.Month.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_category=category)
        else:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_category=category)
    else:
        if jperiod == Period.Year.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__year=year, trans_group=group)    
        elif jperiod == Period.Month.value:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_date__month=month, trans_date__year=year, trans_group=group)    
        else:
            transactions = BankTransaction.objects.order_by("-trans_date").filter(trans_owner=this_user, trans_group=group)
    
    return JsonResponse([transact.serialize() for transact in transactions], safe=False)

@login_required
@csrf_exempt
def jsvsave(request):
    data = json.loads(request.body)
    current_user = get_user(request)
    ############ conversion point ##############    
    BankTransaction.objects.create(
        trans_date = data['trans_date'],
        trans_amt = data['trans_amt'],
        trans_msg = data['trans_msg'],
        trans_category = data['trans_category'],
        trans_owner = current_user,
        trans_group = data['trans_group'])
    return JsonResponse({"message": "success"}, status=302) 
    

@csrf_exempt
def jsvdelete(request): 
    data = json.loads(request.body)
    tranID = data['jid']
    try:
        transactionToDelete = BankTransaction.objects.get(id=tranID)
        transactionToDelete.delete()
        msg = 'success'
    except:
        msg = 'fail'
            
    return JsonResponse({"message": msg, "vid": tranID}, status=201) 


@csrf_exempt
def edittransaction(request):
    data = json.loads(request.body)
    vid = data['jid']
    
    tranny = BankTransaction.objects.get(id=vid)
    dotran = data['jdate']
    vyr = int(dotran[0:4])
    vmo = int(dotran[5:7])
    vdy = int(dotran[8:10])
    
    vreload_necessary = False
    if  (tranny.trans_amt == data['jamt']) or (tranny.trans_msg == data['jmsg']):
        vreload_necessary = True
############ conversion point ##############            
    tranny.trans_date = date(vyr, vmo, vdy)
    tranny.trans_msg = data['jmsg']
    tranny.trans_amt = data['jamt']
    tranny.trans_category = data['jcat']
    tranny.trans_group = data['jgrp']
    
    try:
        tranny.save()
        vmsg = tranny
    except:
        vmsg = 'fail'
    
    return JsonResponse({"reload_necessary" : vreload_necessary}, status=201)

#-------called from input.html-------------#   

def vinput(request):
    ibsForm = InputBankStatementForm()
    return render(request, "proj5FinTracker/input.html", {
        'tform' : ibsForm,
    })

                     
@csrf_exempt
def vupload(request):    
    #####################################################################
    ## IMPORTANT: REMOVE ANY BLANK LINES FROM CSV OR IT WILL DIE HERE! ##
    ## even just put transactions in erase.txt                         ##
    #####################################################################
    ###parse PDF document###
    bf_str = StringIO()
    bf_open = request.FILES['file_name']
    
    if ('PDF' in bf_open.name.upper()): 
        bf_parser = PDFParser(bf_open)
        bf_doc = PDFDocument(bf_parser)
        bf_mgr = PDFResourceManager()
        bf_converter = TextConverter(bf_mgr, bf_str, laparams=LAParams())
        bf_interpreter = PDFPageInterpreter(bf_mgr, bf_converter)
        for bf_page in PDFPage.create_pages(bf_doc):
            bf_interpreter.process_page(bf_page)        
        transactions_needing_classification = parse_pdf_text(bf_str.getvalue(), request)      
    else:
        transactions_needing_classification = parse_csv(bf_open, request)        
    
    dmp = dumps(transactions_needing_classification)
    ibsForm = InputBankStatementForm()
    return render(request, "proj5FinTracker/input.html", {
        'tform' : ibsForm,
        'dmp': dmp,
        #uncomment for diagnostic info
        #'msg5' : count,
        #'msg3': dmp,
        #'msg6': transactions_needing_classification
    })
        
def get_user(request):
    return User.objects.get(username = request.session["current_user"])
  
 
# ##### The following has been supplanted by CSV processing 
# def parse_pdf_text(pdf_text, request):
    
    # transaction_pattern = '\d\d/\d\d\s+[\d,]+\.\d{2}\s+.+?\w\w\s+\d{6}\s+?'
    # pdf_text = pdf_text.replace("'","")
    
    # ###SAVINGS Section###
    # savings_index = pdf_text.find('SAVINGS ACCOUNT')
    # checking_index = pdf_text.find('POWER CHECKING')
    # savings_string = pdf_text[savings_index:checking_index]
    
    # start_index = savings_string.find('DEPOSITS/CREDITS')
    # end_index = savings_string.find('WITHDRAWALS/DEBITS')
    
    # scredit_block = savings_string[start_index:end_index]    
    # scredit_result = process_transactions(scredit_block, transaction_pattern)
        
    # sdebit_block = savings_string[end_index:checking_index]
    
    # sdebit_result = process_transactions(sdebit_block, transaction_pattern)    
         
    # ###CHECKING SECTION###
    
    # #s_end = pdf_text.find('POWER CHECKING')
    # checking_string = pdf_text[checking_index:]
    # deposit_index = checking_string.find('DEPOSITS/CREDITS')
    # atmwithdrawal_index = checking_string.find('ATM WITHDRAWALS/DEBIT PURCHASES')
    # withdrawal_index = checking_string.find('WITHDRAWALS/DEBITS')
    # end_statement_index = checking_string.find('* * * REWARDS:')
    
    # ##credit section
    # ccredit_block = checking_string[deposit_index:atmwithdrawal_index]
    # ccredit_result = process_transactions(ccredit_block, transaction_pattern)
    
    # ##ATM withdrawal section
    # cdebit_block1 = checking_string[atmwithdrawal_index:withdrawal_index]
    # cATMDebit_result = process_transactions(cdebit_block1, transaction_pattern)
    
    # ##withdrawal section
    # cdebit_block2 = checking_string[withdrawal_index:end_statement_index]
    # c_withdrawal_result = process_transactions(cdebit_block2, transaction_pattern)

    # result = [scredit_result, ccredit_result, sdebit_result, cATMDebit_result, c_withdrawal_result]
    # #finds first date at head, format: mm/dd/yy to mm/dd/yy
    # statement_date_match = re.search('\d\d/\d\d/\d\d\sto\s\d\d/\d\d/\d\d',pdf_text)  
    # statement_date = statement_date_match.group(0)
    # statement_year = '20' + statement_date[6:8]
    # if statement_date[6:8] != statement_date[18:]:
        # is_year_end = True
    # else:
        # is_year_end = False
    # uncategorized_entries = record_transactions(result, request, statement_year, is_year_end)
    
    # return uncategorized_entries


# def record_transactions(doc_collection, request, year, is_year_end):
    
    # c_user = get_user(request)
    # incomplete_transactions = []
    # credit_count = 0
    # for doc in doc_collection:
        # credit_count += 1
        # for i in range(0, len(doc)):
            # adj_year = 0
            # try:                        #match amount: 1,909,000.32 0.03
                # amt_desc_pair = re.split(r'(\d*,?\d*,?\d+\.\d\d)', doc[i + 1])
                # skipXfers = amt_desc_pair[2].find("XFER")
                # if skipXfers != -1:
                    # continue
                
                
                # stripped_date = doc[i].strip() #looks like: MM/DD
                
                # #if this is a dec/jan statement, adjust year if january               
                # if is_year_end and stripped_date[1] == '1': 
                    # adj_year = int(year) + 1
                    # tdate = str(adj_year)
                # else:
                    # #adj_year = int(year)###########################################
                    # tdate  = year
                # tdate += '-'
                # tdate += stripped_date
                # tdate = tdate.replace('/','-')
                
                # # month = int(stripped_date[:2])
                # # day = int(stripped_date[3:])
                                
            # except:
                # #doesn't have the pattern of an entry, skip to the next
                # continue
             
            # try:
                # #see if this a new category
                
                # bt = BankTransaction.objects.filter(
                    # trans_owner=c_user,
                    # trans_msg = amt_desc_pair[2].strip()
                    # )                
                # #have seen this before, get the category and make the new entry
                # # --- get amount, turn to float, determine if pos or neg
                # tmp_amt = amt_desc_pair[1].replace(",","") #get rid of commas ','
                # transaction_amount = float(tmp_amt)
                # if credit_count > 2:
                    # transaction_amount *= -1
                
                # #eliminate duplicates:
                # duplicate = False
                # for btransaction in bt:
                    # if transaction_amount == btransaction.trans_amt:
                        # duplicate = True
                        # break
                        
                # if duplicate:
                    # continue
                # else:
                    # BankTransaction.objects.create(
                        # trans_date=tdate,
                        # trans_owner=c_user,
                        # trans_amt = transaction_amount,
                        # trans_msg = amt_desc_pair[2],
                        # trans_category = bt[0].trans_category,
                        # trans_group = bt[0].trans_group
                        # )
                    
            # except:
                # #this transaction needs to be categorized by user                
                # try:
                    # if credit_count > 2: #determine if a credit or debit
                        # transaction_amount = '-' + amt_desc_pair[1]
                    # else:
                        # transaction_amount = amt_desc_pair[1]
                    # trans_str = tdate + ' ' + transaction_amount + ' ' + amt_desc_pair[2]
                    # commonEntry = amt_desc_pair[2].find("SOOP")
                    # if commonEntry != -1:
                        # BankTransaction.objects.create(
                            # trans_date=tdate,
                            # trans_owner=c_user,
                            # trans_amt = transaction_amount,
                            # trans_msg = amt_desc_pair[2],
                            # trans_category = "grocery",
                            # trans_group = "household"
                        # )
                    # elif amt_desc_pair[2].find("TACO") != -1:
                        # BankTransaction.objects.create(
                            # trans_date=tdate,
                            # trans_owner=c_user,
                            # trans_amt = transaction_amount,
                            # trans_msg = amt_desc_pair[2],
                            # trans_category = "food",
                            # trans_group = "restaurant"
                        # )
                    # elif amt_desc_pair[2].find("GROCER") != -1:
                        # BankTransaction.objects.create(
                            # trans_date=tdate,
                            # trans_owner=c_user,
                            # trans_amt = transaction_amount,
                            # trans_msg = amt_desc_pair[2],
                            # trans_category = "grocery",
                            # trans_group = "household"
                        # )
                    # else:
                        # incomplete_transactions.append(trans_str.strip())
                # except:
                    # msg = 'index error 2'
        
        
    # return incomplete_transactions

def parse_csv(csv_file, request):
    ######################################
    #CSV Headings: Transaction Date,Check Number,Description,Debit Amount,Credit Amount
    ##################OR##################
    #CC Heading: Status,Date,Description,Debit,Credit,Member Name
    ######################################
    
    csv_str = str(csv_file.read())
            #csv_strip = csv_str.strip()
    csv_mod = re.sub('[\']', '', csv_str)
    csv_list = csv_mod.split('\\r\\n')
    #return csv_list #UNCOMMENT TO DEBUG
    #["Status,Date,Description,Debit,Credit,Member Name", "Cleared,12/30/2019, HIHO SERVICE AUTO REPAIR ENGLEWOOD CO ,180.45,,RONNI C MONSTER", "Cleared,12/28/2019, FANCY TIGER CRAFTS DENVER CO ,50.20,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #1027 SHERIDAN CO ,27.99,,RONNI C MONSTER", "Cleared,12/27/2019, COSTCO WHSE #0468 LONE TREE CO ,92.91,,JASON Z ISAACS"] 
    incomplete_transactions = []
    c_user = get_user(request)
    firstEntry = True
    idate = 0
    idesc = 0
    idebit = 0
    icredit = 0
    
    isBank = True
    for csv_entry in csv_list:
        # first row will be headings, get the order of the columns
        if firstEntry:
            firstEntry = False
            elem_count = 0
            
            # figure out which element is which in csv by using headings 
            # done by getting column number of each element
            heading_elems = csv_entry.split(',')
            for elems in heading_elems:
                #determine if we have a bank csv...
                #if elems.upper().find("STATUS") == -1:
                #    isBank = False                     
                if elems.upper().find("DATE") != -1:
                    idate = elem_count
                    #return idate               #UNCOMMENT TO DEBUG
                if elems.upper().find("DESC") != -1:
                    idesc = elem_count
                    #return idesc
                if elems.upper().find("DEBIT") != -1:
                    idebit = elem_count
                    #return idebit
                if elems.upper().find("CREDIT") != -1:
                    icredit = elem_count 
                    #return icredit
                elem_count += 1
            continue
        #return "have header"
        csv_elements = csv_entry.split(',')       
        split_date = csv_elements[idate].split('/')       
        
        try: 
            # put date in format that works for Django date objects...
            tdate = split_date[2] + '-' + split_date[0] + '-' + split_date[1]
            #return tdate
            tdesc = re.sub('^\d\d/\d\d', '', csv_elements[idesc]) # replace date digits with ""
            #return tdesc
            if tdesc.upper().find("XFER") != -1:
                continue
                        
            tdebit = 0
            if csv_elements[idebit] != '0':
                tdebit = float(csv_elements[idebit]) * -1
                #return tdebit
            else:             
                tcredit = float(csv_elements[icredit])                            
                #return tcredit
        except:
            continue
                
        try: 
            #return "in try"
            #do we have transaction with the same desc...
           
            duplicate = False
            #return "after dupe dec"
            bto = BankTransaction.objects.filter(
                    trans_owner=c_user,
                    trans_msg=tdesc.strip(),
                    # trans_amt=tdebit
                    ) 
            # if this is a duplicate, continue to the next
            #return "have bto"
            for matching_trans in bto:
                #return str(matching_trans.trans_date)
                #return tdate
                if str(tdate) == str(matching_trans.trans_date):# and (bto.trans_amt == tdebit or bto.trans_amt == tcredit):
                    duplicate = True
                    break
            if duplicate == True:
                continue            
            #return bto.trans_msg
            #we have everything we need to save the transaction
            tcat = bto.first().trans_category
            #return bto.first().trans_msg
            tgroup = bto.first().trans_group
            
            
            if tdebit == 0:
                ramt = tcredit                
            else: 
                ramt = tdebit
            BankTransaction.objects.create(
                        trans_date=tdate,
                        trans_owner=c_user,
                        trans_amt = ramt,
                        trans_msg = tdesc.strip(),
                        trans_category = tcat,
                        trans_group = tgroup
                        )
                        
        except:
            #...or does the transaction need to be classified
            trans_str = tdate + ' ' + "{:.2f}".format(tdebit if (tdebit != 0) else tcredit) + ' ' + tdesc
            incomplete_transactions.append(trans_str.strip())
                        
    return incomplete_transactions
         
      
def process_transactions(bank_string, transaction_pattern):   
    #data comes in as one long string which is split on date to format below    
    #'200.00 AUTO XFER CREDIT DDA TRNSFR 0000 *****************80071',
    #'387.01 DENVER PUBLIC SC PR PAYMENT ', '510.00 ONLINE XFER CR', etc. 
    
    transactions = re.split(r'(\d+/\d\d\s+)', bank_string)    
    return transactions[1:]
    
   
   
    