import {Injectable} from '@angular/core';
import {Announcement} from '../models/announcement';
import {ANNOUNCEMENTS} from '../mocks/mock-announcement';
import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {apiUrls} from '../../api-urls';
import {CheckPaginationService} from './check-pagination.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly announcementsUrl: string;
  private readonly publishedAnnouncementsUrl: string;


  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(private http: HttpClient,
              private checkPaginationService: CheckPaginationService) {
    // this.announcemetnsUrl = 'http://localhost:8081/api/announcements';
    this.announcementsUrl = apiUrls.API_ANNOUNCEMENTS;
    this.publishedAnnouncementsUrl = apiUrls.API_PUBLISHED_ANNOUNCEMENTS;
  }

  getAnnouncements(page: number, pageSize: number): Observable<any> {
    // Get from mock
    //  return of(ANNOUNCEMENTS);
    // Get from backend

    let paramsString: string;
    paramsString = this.checkPaginationService.checkPagination(page, pageSize);

    return this.http.get(this.announcementsUrl + paramsString)
      .pipe(
        catchError(this.handleError<any>('getAnnouncements', []))
      );
  }
  getPublishedAnnouncements(page: number, pageSize: number): Observable<any> {
    let paramsString: string;
    paramsString = this.checkPaginationService.checkPagination(page, pageSize);
    console.log(this.publishedAnnouncementsUrl + paramsString);
    return this.http.get(this.publishedAnnouncementsUrl + paramsString)
      .pipe(
        catchError(this.handleError<any>('getPublishAnnouncements', []))
      );
  }
  getAnnouncement(id: number): Observable<Announcement> {
    // Get from mock

    // return of(ANNOUNCEMENTS.find(announcement => announcement.announcementId === id));
    // Return from backend

    return this.http.get(this.announcementsUrl + id)
      .pipe(
        catchError(this.handleError<any>('getAnnouncements', []))
      );
  }

  createAnnouncement(title, description, userId): Observable<Announcement> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post(this.announcementsUrl, JSON.stringify({title, description, userId}), {headers})
      .pipe(
        catchError(this.handleError<any>('createAnnouncement', []))
      );
  }

  /*
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  /*
  Handle Http operation that failed.
  Let the app continue.
  @param operation - name of the operation that failed
  @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
