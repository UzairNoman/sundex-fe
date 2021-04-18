import { Component, OnDestroy } from '@angular/core';
import { ProgressInfo, StatsProgressBarData } from '../../../@core/data/stats-progress-bar';
import { takeWhile } from 'rxjs/operators';
import { StateService } from '../../../@core/utils';

@Component({
  selector: 'ngx-progress-section',
  styleUrls: ['./progress-section.component.scss'],
  templateUrl: './progress-section.component.html',
})
export class ECommerceProgressSectionComponent implements OnDestroy {

  private alive = true;

  progressInfoData: ProgressInfo[];

  constructor(private statsProgressBarService: StatsProgressBarData,public stateService : StateService) {
    this.stateService.trafficSubj.subscribe(data => {
      console.log(data);
      this.progressInfoData = data;
    })
    // this.statsProgressBarService.getProgressInfoData()
    //   .pipe(takeWhile(() => this.alive))
    //   .subscribe((data) => {

    //     this.progressInfoData = data;
    //   });
  }

  ngOnDestroy() {
    this.alive = true;
  }
}
