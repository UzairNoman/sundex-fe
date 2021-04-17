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
  barOptions: any;
  barData:any = [10, 52, 200, 334, 390, 330, 220,210,45,100,334, 390, 330, 220,210,45,34];

  themeSubscription: any;
  pieOptions:any;
  spiderOptions:any;

  constructor(private themeService: NbThemeService,
              public httpService: HttpClient,
              public searchService: NbSearchService,
              private theme: NbThemeService,
              private userActivityService: UserActivityData) {
                this.searchService.onSearchSubmit()
                .subscribe((data: any) => {
                  console.log(data.term);
                  this.search = data.term;
                  if(this.search != 'default')
                    this.getCSV();
                })
    this.getTweets();
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

    this.getUserActivity(this.type);

  
    

    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;

      this.barOptions = {
        backgroundColor: echarts.bg,
        color: [colors.primaryLight],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            name: 'SGD Goals',
            nameLocation: 'middle',
            type: 'category',
            data: ['1', '2', '3', '4', '5', '6', '7','8','9','10','11', '12', '13', '14', '15','16','17'],
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            splitLine: {
              lineStyle: {
                color: echarts.splitLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
        ],
        series: [
          {
            name: 'Score',
            type: 'bar',
            barCategoryGap: '5%',
            //barWidth: '30%',
            data: this.barData,
          },
        ],
      };


      this.pieOptions = {
        backgroundColor: echarts.bg,
        color: [colors.warningLight, colors.infoLight, colors.dangerLight, colors.successLight, colors.primaryLight],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['SGD1','SGD2','SGD3','SGD4','SGD5'],
          textStyle: {
            color: echarts.textColor,
          },
        },
        series: [
          {
            name: 'Countries',
            type: 'pie',
            radius: '80%',
            center: ['50%', '50%'],
            data: [
              { value: 335, name: 'SGD1' },
              { value: 310, name: 'SGD2' },
              { value: 234, name: 'SGD3' },
              { value: 135, name: 'SGD4' },
              { value: 1548, name: 'SGD5' },
            ],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: echarts.itemHoverShadowColor,
              },
            },
            label: {
              normal: {
                textStyle: {
                  color: echarts.textColor,
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
            },
          },
        ],
      };

      this.spiderOptions = {
        backgroundColor: echarts.bg,
        color: [colors.danger, colors.warning],
        tooltip: {},
        legend: {
          data: ['BMW', 'Nestle'],
          textStyle: {
            color: echarts.textColor,
          },
        },
        radar: {
          name: {
            textStyle: {
              color: echarts.textColor,
            },
          },
          indicator: [
            { name: 'SGD1', max: 6500 },
            { name: 'SGD2', max: 16000 },
            { name: 'SGD3', max: 30000 },
            { name: 'SGD4', max: 38000 },
            { name: 'SGD5', max: 52000 },
            { name: 'SGD6', max: 25000 },
            { name: 'SGD7', max: 25000 },
            { name: 'SGD8', max: 25000 },
          ],
          splitArea: {
            areaStyle: {
              color: 'transparent',
            },
          },
        },
        series: [
          {
            name: 'Budget vs Spending',
            type: 'radar',
            data: [
              {
                value: [4300, 10000, 28000, 35000, 50000, 19000,2000,5666],
                name: 'BMW',
              },
              {
                value: [5000, 14000, 28000, 31000, 42000, 21000,7888,6555],
                name: 'Nestle',
              },
            ],
          },
        ],
      };


    });



  }
  getCSV(){
    let csvFile = this.search.toLowerCase();
    this.httpService.get(`assets/data/${csvFile}.csv`, {responseType: 'text'})
    .subscribe(
        data => {
          console.log(data);
          let csvToRowArray = data.split("\n");
          let userArray = [];
            for (let index = 1; index < csvToRowArray.length - 1; index++) {
              let row = csvToRowArray[index].split(",");
              let Newrow = {"sentence" : row[0], "label": row[1],"greenwash": row[2].trim()}
              userArray.push(Newrow);
            }
            console.log(userArray);
            let sgd = new Array(17).fill(0);
            userArray.forEach(element => {
              sgd[element.label] += 1;
              
            });
            this.barData = sgd;
        },
        error => {
            console.log(error);
        }
    );
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
