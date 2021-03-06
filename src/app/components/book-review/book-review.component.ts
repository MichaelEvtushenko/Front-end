import {Component, Input, OnInit} from '@angular/core';
import {Page} from '../../models/page';
import {User} from '../../models/user';
import {BookReview} from '../../models/book-review';
import {BookReviewService} from '../../service/book-review.service';
import {AccountService} from '../../service/account.service';
import {flatMap, map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-book-review',
  templateUrl: './book-review.component.html',
  styleUrls: ['./book-review.component.css']
})
export class BookReviewComponent implements OnInit {
  defaultPhotoPath = '../../../assets/images/default_avatar.jpg';
  pageSize = 3;
  page: number;
  loading: boolean;

  @Input() bookId: number;
  reviews: BookReview[];
  authors: { [reviewId: number]: User; } = { };
  showCommentsFlag: boolean[];
  ableToExpand: boolean;

  constructor( private bookReviewService: BookReviewService,
               private accountService: AccountService
  ) { }

  ngOnInit() {
    this.page = 1;
    this.reviews = [];
    this.authors = [];
    this.ableToExpand = true;
    this.loading = true;
    this.getReviews();
  }

  getReviews(): void {
    this.prepareComments(this.reviews.length + this.pageSize);
    const tmpReviews: BookReview[] = [];
    const addedReviews: { [reviewId: number]: boolean; } = { };
    this.bookReviewService.getBookReview(this.bookId, this.page, this.pageSize).pipe(
      map((respPage: Page<BookReview>) => {
        return respPage.array;
      }),
      flatMap((reviewList: BookReview[]) => {
        if (reviewList.length < this.pageSize) {
          this.ableToExpand = false;
          this.loading = false;
        }
        return reviewList;
      }),
      switchMap((review: BookReview) => {
        tmpReviews.push(review);
        return this.accountService.getUserById(review.userId);
      }),
      map((author: User) => {
        const reviews = tmpReviews.filter(value => value.userId === author.userId);
        for (const review of reviews) {
          if (addedReviews[review.bookReviewId] == null) {
            addedReviews[review.bookReviewId] = true;
            this.authors[author.userId] = author;
            this.reviews.push(review);
            this.loading = false;
          }
        }
      }),
    ).subscribe();
  }
  expandReviews(): void {
    this.page += 1;
    this.getReviews();
  }

  prepareComments(count: number): void {
    this.showCommentsFlag = [];
    for (let i = 0; i < count; i++) {
      this.showCommentsFlag.push(false);
    }
  }
  showComments(ind: number): void {
    this.showCommentsFlag[ind] = true;
  }
  hideComments(ind: number): void {
    this.showCommentsFlag[ind] = false;
  }
}
