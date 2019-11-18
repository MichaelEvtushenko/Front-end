import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {LogService} from './logging/log.service';
import {environment} from '../../environments/environment';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  readonly reviewUrl: string;

  constructor(private http: HttpClient,
              private logger: LogService) {
    this.reviewUrl = environment.API_REVIEW;
  }

  createReview(rating: number, description: string, bookId: number) {
    const userId = JSON.parse(localStorage.getItem('currentUser')).userId;
    return this.http.post(this.reviewUrl, {
      userId,
      bookId,
      rating,
      description
    }).pipe(catchError(this.handleError<any>('createReview', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
