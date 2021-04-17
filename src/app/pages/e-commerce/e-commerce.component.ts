import { Component } from '@angular/core';
import { NbSearchService, NbThemeService } from '@nebular/theme';
import { UserActive, UserActivityData } from '../../@core/data/user-activity';
import { takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'ngx-ecommerce',
  templateUrl: './e-commerce.component.html',
})
export class ECommerceComponent {
  private alive = true;

  userActivity: UserActive[] = [];
  type = 'month';
  types = ['week', 'month', 'year'];
  currentTheme: string;
  statuses:any;
  search = 'default';

  constructor(private themeService: NbThemeService,
              public httpService: HttpClient,
              public searchService: NbSearchService,
              private userActivityService: UserActivityData) {
                this.searchService.onSearchSubmit()
                .subscribe((data: any) => {
                  console.log(data.term);
                  this.search = data.term;
                })
    this.getTweets();
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

    this.getUserActivity(this.type);
  }

  getUserActivity(period: string) {
    this.userActivityService.getUserActivityData(period)
      .pipe(takeWhile(() => this.alive))
      .subscribe(userActivityData => {
        this.userActivity = userActivityData;
      });
  }
  getTweets(){
    let company = "Nestle";
    let tag = "greenwashing";
    this.httpService.get(`http://localhost:8000/api/me?tag=${tag}&company=${company}`).subscribe((data) => {
      let uglyJson:any = data;
      this.statuses = uglyJson.statuses;
    });
  }
}
