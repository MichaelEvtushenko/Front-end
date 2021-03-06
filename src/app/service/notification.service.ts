import { Injectable } from '@angular/core';
import { NOTIFICATIONS } from '../mocks/mock-notifications';
import {Notification} from '../models/notification';
import { Observable, of  } from 'rxjs';
import {apiUrls} from '../../api-urls';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ErrorHandlerService} from './error-handler.service';
import {AccountService} from './account.service';
import {catchError} from 'rxjs/operators';
import {Page} from '../models/page';
import {FullNotification} from "../models/full-notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly notificationsUrl: string;
  private readonly notificationsCountUrl: string;

  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
              private accountService: AccountService) {
    this.notificationsUrl = apiUrls.API_NOTIFICATION;
    this.notificationsCountUrl = apiUrls.API_NOTIFICATION_COUNT;
  }

  getNotifications(page: number, pageSize: number): Observable<Page<FullNotification>>  {
    let params = new HttpParams();
    let paramsString = '';
    const user = this.accountService.getCurrentUser();
    if (user != null && user.userId != null) {
      params = params.set('userId', user.userId.toString());
      if (page != null) {
        params = params.set('page', page.toString());
      }
      if (pageSize != null) {
        params = params.set('pageSize', pageSize.toString());
      }
      if (params.keys().length > 0) {
        paramsString = '?' + params.toString();
      }
      return this.http.get(this.notificationsUrl + paramsString)
        .pipe(
          catchError(this.errorHandlerService.handleError<any>('getNotifications', []))
      );
    } else {
      // Get from mock
      // return of(NOTIFICATIONS);
      return null;
    }
  }

  getNotificationsCount():Observable<any> {
    let params = new HttpParams();
    let paramsString = '';
    const user = this.accountService.getCurrentUser();
    if (user != null && user.userId != null) {
      params = params.set('userId', user.userId.toString());
      if (params.keys().length > 0) {
        paramsString = '?' + params.toString();
      }
      return this.http.get(this.notificationsCountUrl + paramsString)
        .pipe(
          catchError(this.errorHandlerService.handleError<any>('getNotificationsCount', []))
      );
    } else {
      // Get from mock
      // return of(NOTIFICATIONS);
      return null;
    }

  }
}
