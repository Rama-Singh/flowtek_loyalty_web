    import { Injectable, OnInit  } from '@angular/core';
    import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
    import { Location } from '@angular/common';
    import {DialogComponent} from './../dialog/dialog.component';
    import { catchError, retry } from 'rxjs/operators';
    import { throwError } from 'rxjs';
    import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
    import { Crypto } from '../_Pipes/Crypto.pipe';
    import { DatePikerFormat } from '../_Pipes/DatePikerFormat.pipe';
    import { PushNotificationsService} from 'ng-push';
    import * as XLSX from 'xlsx';
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    import * as FileSaver from 'file-saver';
    
     
    
    @Injectable({ providedIn: 'root' })
    export class DatabaseService implements OnInit {

        // Live URL
        myurl = 'https://apps.abacusdesk.com/flowtekpipes/dd_api/';
        uploadUrl = "https://apps.abacusdesk.com/flowtekpipes/dd_api/app/uploads/";


        // Testing URL
        // myurl = 'https://devcrm.abacusdesk.com/dishagypsum/dd_api/';
        // uploadUrl = "https://devcrm.abacusdesk.com/dishagypsum/dd_api/app/uploads/";
        
   

        can_active = '';
        datauser: any = {};
        loading: any;
        customer_name: any;
        franchise_name: any;
        franchise_id;
        franchise_location;
        challans : any = [];
        currentUrl:any='';
        previousUrl:any='';
        filters : any={};
        // public _pushNotificationService: PushNotificationsService
        constructor(public location: Location, public http: HttpClient,public dialog: DialogComponent,private router: Router,public route: ActivatedRoute) {
            this.currentUrl = this.router.url;
            router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {        
                    this.previousUrl = this.currentUrl;
                    this.currentUrl = event.url;
                    console.log(this.datauser);
                    
                };
            });
        }
        
        ngOnInit(){
            // this._pushNotificationService.requestPermission();
        }
        
        set_filters(data)
        {
            this.filters = data;
        }
        
        get_filters()
        {
            return this.filters;
        }
        
        private extractData(res: Response)
        {
            const body = res;
            return body || {};
        }
        auth_rqust(request_data: any, fn: any)
        {
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            return this.http.post(this.myurl + fn , request_data, {headers: headers});
        }
        
        post_rqst(request_data: any, fn: any):any
        {
            if( !this.chek_seission() )
            return false;
            // this.noificaton();
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            headers = headers.set('Token', 'Bearer ' + this.datauser.token);
            return this.http.post(this.myurl + fn, JSON.stringify(request_data), {headers: headers});
        }
        
        get_rqst(request_data: any, fn: any):any {
            if( !this.chek_seission() )
            return false;
            // this.noificaton();
            
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            headers = headers.set('Token', 'Bearer ' + this.datauser.token);
            return this.http.get(this.myurl + fn, {headers: headers})
        }
        
        
        
        
        login_get_rqst(request_data: any, fn: any):any {
            
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            return this.http.get(this.myurl + fn, {headers: headers})
        }
        
        
        insert_rqst(request_data: any, fn: any):any {
            if( !this.chek_seission() )
            return false;
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            headers = headers.set('Token', 'Bearer ' + this.datauser.token);
            return this.http.post(this.myurl + fn, JSON.stringify(request_data), {headers: headers});
        }
        
        header = new HttpHeaders();
        
        fileData(request_data:any,fn:any):any
        {
            console.log( request_data );
            this.header.append('Content-Type', undefined);
            return this.http.post(this.myurl + fn, request_data , {headers: this.header})
        }
        
        
        public share_data:any;
        set_fn(val:any)
        {
            this.share_data = val;
        }
        
        get_fn(){
            return this.share_data;
        }    
        
        chek_seission()
        {
            this.datauser = JSON.parse(localStorage.getItem('users')) || {};
            if(this.datauser.id){
                return true;
            }
            else
            {
                this.dialog.alert("info","Session Logged Out","You'r session logged out ! Please Login agian");
                this.router.navigate([''] , { queryParams: { returnUrl: this.router.url }});
                return false;
            }
        }
        
        crypto(val, mode:any = true)
        {
            if(val) return new Crypto().transform( val, mode);
            else return '';
        }
        
        pickerFormat(val, format:any = 'Y-M-D')
        {
            if(val) return new DatePikerFormat().transform( val, format);
        }
        
        goBack() {
            window.history.back();
        }
        
        noificaton_rqst():any {
            let headers = new HttpHeaders().set('Content-Type', 'application/json');
            headers = headers.set('Token', 'Bearer ' + this.datauser.token);
            return this.http.post(this.myurl + 'stockdata/getNotification', JSON.stringify({'login_id': this.datauser.id}), {headers: headers})
        }
        
        notifications:any = [];
        all_notifications:any = [];
        noificaton(){
            this.noificaton_rqst().subscribe(d => { 
                console.log(d);
                this.all_notifications =  d.notifications;
                if( d.notify.length > 0 && !this.offNotifiy){
                    this.offFlag = false;
                    this.notifications = d.notify;
                    this.sendNotify(0);
                }
            }); 
        }
        
        offFlag:any = false;
        offNotifiy:any = false;
        sendNotify( index )
        {
            if(this.offFlag)return;
            var e = this.notifications[ index ];
            console.log(index);
            
            console.log(e);
            if(!e)return;
            
            const title = e.title;
            let options = {
                body : e.message,
                icon : 'favicon.ico'
            }
            
            // this._pushNotificationService.create(title, options).subscribe((notif) => {
            //     if (notif.event.type === 'show') {
            //         console.log('onshow');
            //         setTimeout(() => {
            //             notif.notification.close();
            //             this.sendNotify(++index);
            //             console.log(index);
            
            //         }, 3000);
            //     }
            //     if (notif.event.type === 'click') {
            //         console.log('click');
            //         this.offFlag = true;
            //         notif.notification.close();
            
            //     }
            //     if (notif.event.type === 'close') {
            //         console.log('close');
            //     }
            // },
            // (err) => {
            //     console.log(err);
            // });
        }
        
        
        
        
        
        
        
        numeric_Number(event: any) {
            const pattern = /[0-9\+\-\ ]/;
            let inputChar = String.fromCharCode(event.charCode);
            if (event.keyCode != 8 && !pattern.test(inputChar)) {
                event.preventDefault();
            }
        }
        
        public exportAsExcelFile(json: any[], excelFileName: string): void {
            
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
            console.log('worksheet',worksheet);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, excelFileName);
        }
        
        private saveAsExcelFile(buffer: any, fileName: string): void {
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
        }
    }
    
    
    
    
    