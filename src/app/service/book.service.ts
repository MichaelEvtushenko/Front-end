import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable, of} from 'rxjs';
import {LogService} from './logging/log.service';
import {Book} from '../models/book';
import {catchError} from 'rxjs/operators';
import {BookFilteringParam} from '../models/book-filtering-param';
import {Author} from '../models/author';
import {Genre} from '../models/genre';
import {StringFormatterService} from './string-formatter.service';
import {placeholdersToParams} from "@angular/compiler/src/render3/view/i18n/util";

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly booksUrl: string;
  private readonly bookDownloadUrl: string;
  private readonly bookInfoUrl: string;
  private readonly bookCreateUrl: string;

  constructor(private http: HttpClient,
              private stringFormatterService: StringFormatterService,
              private logger: LogService) {
    this.booksUrl = environment.API_BOOKS;
    this.bookInfoUrl = environment.API_BOOK_INFO;
    this.bookCreateUrl = environment.API_BOOK_CREATE;
    this.bookDownloadUrl = environment.API_BOOK_DOWNLOAD;
  }

  getBooks(filteringParams: Map<BookFilteringParam, object>, page: number, pageSize: number): Observable<any> {
    let params = new HttpParams();
    let paramsString = '';
    if (filteringParams.get(BookFilteringParam.Title) != null) {
      const title = filteringParams.get(BookFilteringParam.Title) as unknown as string;
      params = params.set('title', title);
    }
    if (filteringParams.get(BookFilteringParam.Author) != null) {
      const author = filteringParams.get(BookFilteringParam.Author) as unknown as Author;
      params = params.set('authorId', author.authorId.toString());
    }
    if (filteringParams.get(BookFilteringParam.Genre) != null) {
      const genre = filteringParams.get(BookFilteringParam.Genre) as unknown as Genre;
      params = params.set('genreId', genre.genreId.toString());
    }
    if (filteringParams.get(BookFilteringParam.AnnouncementDate) != null) {
      const announcementDate = filteringParams.get(BookFilteringParam.AnnouncementDate) as unknown as Date;
      params = params.set('date', this.stringFormatterService.formatDate(announcementDate));
    }
    if (page != null) {
      params = params.set('page', page.toString());
    }
    if (pageSize != null) {
      params = params.set('pageSize', pageSize.toString());
    }
    if (params.keys().length > 0) {
      paramsString = '?' + params.toString();
    }
    return this.http.get(this.booksUrl + paramsString)
      .pipe(
        catchError(this.handleError<any>('getBooks', []))
      );
  }

  getBookSubtitle(book: Book): string {
    const authors = this.getBookAuthorsString(book, 1);
    return 'by ' + (authors == '' ? 'unknown' : authors);
  }

  getBookGenresString(book: Book, count: number): string {
    return this.stringFormatterService.arrayPrettyFormat(book.genres.map(genre => genre.name), count);
  }

  getBookAuthorsString(book: Book, count: number): string {
    return this.stringFormatterService.arrayPrettyFormat(book.authors.map(author => author.fullName), count);
  }

  getBookBySlug(slug: string): Observable<any> {
    return this.http.get(this.bookInfoUrl + '/' + slug).pipe(catchError(this.handleError<any>('getBookBySlug', [])));
  }

  getBookById(id: number): Observable<any> {
    return this.http.get(this.bookInfoUrl + '/id/' + id).pipe(catchError(this.handleError<any>('getBookById', [])));
  }

  suggestBook(book) {
    return this.http.post(this.bookCreateUrl, book).pipe(catchError(this.handleError<any>('suggestBook', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
