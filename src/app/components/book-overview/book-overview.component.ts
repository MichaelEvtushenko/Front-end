import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookService} from '../../service/book.service';
import {ActivatedRoute} from '@angular/router';
import {Book} from '../../models/book';
import {BookOverview} from '../../models/book-overview';
import {flatMap} from 'rxjs/operators';
import {BookOverviewService} from '../../service/book-overview.service';
import {BookPresentationService} from '../../service/presentation-services/book-presentation.service';
import {UsersBooksService} from '../../service/users-books-service';
import {UserBook} from '../../models/users-book';
import {Store} from '@ngrx/store';
import {of, Subscription} from 'rxjs';
import {State} from '../../state/app.state';
import {UserState} from '../../state/user';

@Component({
  selector: 'app-book-overview',
  templateUrl: './book-overview.component.html',
  styleUrls: ['./book-overview.component.css']
})
export class BookOverviewComponent implements OnInit, OnDestroy {

  book: Book;
  bookOverview: BookOverview;
  userBook: UserBook;
  genres: string;
  authors: string;
  loaded: boolean;
  addBookDisabled: boolean;

  isLogged: boolean;
  loggedUserId: number;
  isLoggedSubscription: Subscription;

  constructor(private bookService: BookService,
              private bookPresentationService: BookPresentationService,
              private bookOverviewService: BookOverviewService,
              private usersBooksService: UsersBooksService,
              private route: ActivatedRoute,
              private store: Store<State>) {}

  ngOnInit() {
    this.addBookDisabled = false;
    this.getBookOverview();
  }

  ngOnDestroy(): void {
    if (this.isLoggedSubscription) {
      this.isLoggedSubscription.unsubscribe();
    }
  }


  getBookOverview(): void {
    this.loaded = false;
    const slug = this.route.snapshot.paramMap.get('slug');
    this.isLoggedSubscription = this.store.select('user').pipe(
      flatMap((reducer: UserState) => {
        this.isLogged = reducer.login;
        this.loggedUserId = reducer.id;
        return this.bookService.getBookBySlug(slug);
      }),
      flatMap((resBook: Book) => {
        this.book = resBook;
        this.authors = this.bookPresentationService.getBookAuthorsString(this.book, this.book.authors.length);
        this.genres = this.bookPresentationService.getBookGenresString(this.book, this.book.genres.length);
        return this.bookOverviewService.getPublishedBookOverview(this.book.bookId);
      }),
      flatMap((resOverview: BookOverview) => {
        this.bookOverview = resOverview;
        this.loaded = true;
        if (this.loggedUserId == null) {
          const res: UserBook = { userBookId: -1, favoriteMark: null, bookId: null, creationTime: null, readMark: null, userId: null };
          return of(res);
        }
        return this.usersBooksService.getUserBook(this.book.bookId, this.loggedUserId);
      }))
      .subscribe((userBook: UserBook) => {
      if (userBook.userBookId !== -1 && this.isLogged) {
        this.userBook = userBook;
      }
      });
  }
  addToRead(): void {
    this.addBookDisabled = true;
    this.usersBooksService.addUsersBook(this.book, this.loggedUserId)
      .subscribe((newUsersBook: UserBook) => {
        this.addBookDisabled = false;
        this.userBook = newUsersBook;
      });
  }
  removeFromRead(): void {
    this.usersBooksService.deleteUsersBook(this.userBook.userBookId)
      .subscribe(() => {
        this.userBook = null;
      });
  }
}
