import { Component } from '@angular/core';
import { NbSearchService, NbThemeService } from '@nebular/theme';
import { UserActive, UserActivityData } from '../../@core/data/user-activity';
import { map, takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { StateService } from '../../@core/utils';
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
  barData:any = [10, 52, 200, 43, 68, 85, 69,97,45,85,95, 49, 153, 92,54,45,34];
  companyData=['Nestle','Airbus','Siemens','Maersk'];
  companyObj= {};
  curatedStuff = {label:[], newObj : [{name: "", value:""}]};
  themeSubscription: any;
  pieOptions:any;
  spiderOptions:any;
  currentAssignment;
  public change = new Subject<string>();
  sgdLabels: any = ['SDG1','SDG2','SDG3','SDG4','SDG5','SDG6','SDG7','SDG8','SDG9','SDG10','SDG11','SDG12','SDG13','SDG14','SDG15','SDG16','SDG17'];

  constructor(private themeService: NbThemeService,
              public httpService: HttpClient,
              public stateService : StateService,
              public searchService: NbSearchService,
              private theme: NbThemeService,
              private userActivityService: UserActivityData) {
                this.companyData.forEach(company => {
                  let lowcompany = company.toLowerCase();
                  this.getCSV(lowcompany).subscribe(data => {
                    this.companyObj[lowcompany] = {data, filteredData : this.curateData(data.SDG),companyname: company};
                    this.spiderOptions.series[0].data.push({name:company,value:this.companyObj[lowcompany].data.SDG});
                    

                    console.log(this.companyObj);
                  })
                });
                this.searchService.onSearchSubmit()
                .subscribe((data: any) => {
                  console.log(data.term);
                  this.search = data.term;
                  console.log(this.companyObj[this.search.toLowerCase()].data.greenwashCount);
                  let searchedGW = this.companyObj[this.search.toLowerCase()].data.greenwashCount;
                  this.change.next(this.search);
                  this.getTweets([this.search]);
                  let rows = this.companyObj[this.search.toLowerCase()].data.excelRows.length;
                  let per = (searchedGW/rows) * 100;
                  this.stateService.trafficSubj.next([
                    {title: "SDGs Found", value: this.companyObj[this.search.toLowerCase()].filteredData.newObj.length, activeProgress: 17, description: "How many SDGs are present in report"},
                    {title: "Greenwashing", value: searchedGW, activeProgress: per, description: "More than last year (70%)"}

                  ])
                  // if(this.search != 'default')
                  //   this.getCSV();
                })
    this.getTweets(["Nestle","greenwashing"]);
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

    this.getUserActivity(this.type);

  
    

    this.change.subscribe(searchText =>{
      console.log(searchText,this.companyObj[searchText]);
      this.currentAssignment = this.companyObj[searchText.toLowerCase()];
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
        const colors: any = config.variables;
        const echarts: any = config.variables.echarts;
        console.log(this.companyObj);
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
            bottom: '6%',
            containLabel: true,
          },
          xAxis: [
            {
              name: 'SDGs',
              nameLocation: 'middle',
              nameGap: 20,
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
              data: this.currentAssignment.data.SDG,
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
            data: this.currentAssignment.filteredData.label,
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
              data: this.currentAssignment.filteredData.newObj,
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
  

  
  
      });
    })
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;
      console.log(this.companyObj);
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
            name: 'SDG Goals',
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
          data: this.curatedStuff.label,
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
            data: this.curatedStuff.newObj,
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
        color: [colors.danger, colors.warning,"#345564","#975564","#895588"],
        tooltip: {},
        legend: {
          data: this.companyData,
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
            { name: 'SDG1', max: 20 },
            { name: 'SDG2', max: 20 },
            { name: 'SDG3', max: 20 },
            { name: 'SDG4', max: 20 },
            { name: 'SDG5', max: 20 },
            { name: 'SDG6', max: 20 },
            { name: 'SDG7', max: 20 },
            { name: 'SDG8', max: 20 },
            { name: 'SDG9', max: 20 },
            { name: 'SDG10', max: 20 },
            { name: 'SDG11', max: 20 },
            { name: 'SDG12', max: 20 },
            { name: 'SDG13', max: 20 },
            { name: 'SDG14', max: 20 },
            { name: 'SDG15', max: 20 },
            { name: 'SDG16', max: 20 },
            { name: 'SDG17', max: 20 },
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
            data: [],
          },
        ],
      };


    });



  }
  curateData(apiData){
    let newObj = [];
    let label = this.sgdLabels;
    label.forEach((element,index) => {
      if(apiData[index]){
        let simple = {name : label[index], value: apiData[index]};
        newObj[index] = simple;
      }
    });
    console.log(label)
    return {label,newObj}
  }
  getCSV(company?){
    let csvFile = company ?? this.search.toLowerCase();
    return this.httpService.get(`assets/data/${csvFile}.csv`, {responseType: 'text'})
    .pipe(map(data => {
      console.log(data);
      let csvToRowArray = data.split("\n");
      let userArray = [];
        for (let index = 1; index < csvToRowArray.length - 1; index++) {
          let row = csvToRowArray[index].split(",");
          let Newrow = {"label": row[0],"greenwash": row[1]}
          userArray.push(Newrow);
        }
        console.log(userArray);
        let SDG = new Array(17).fill(0);
        let greenwashCount= 0;
        userArray.forEach(element => {
          if(element.label == "own"){
            //SDG[17] += 1;
          }
          else{
            SDG[+(element.label)-1] += 1;
          } 
          if(+element.greenwash)
            greenwashCount +=1;    
          
        });
        this.barOptions.series[0].data = SDG;
        //this.spiderOptions.series[0].data[0].value = SDG;
        //this.pieOptions.series[0].data = this.companyObj[this.search].SDG;        
        return {excelRows : userArray, SDG : SDG,greenwashCount}
        
        
    }));
  }
  getUserActivity(period: string) {
    this.userActivityService.getUserActivityData(period)
      .pipe(takeWhile(() => this.alive))
      .subscribe(userActivityData => {
        this.userActivity = userActivityData;
      });
  }
  // getTweets(company= "Nestle",tag="greenwashing"){
  //   this.httpService.get(`http://localhost:8000/api/me?tag=${tag}&company=${company}`).subscribe((data) => {
  //     let uglyJson:any = data;
  //     this.statuses = uglyJson.statuses;
  //   });
  // }
  getTweets(arrayTags){
    let str = "";
    let arrayLen = arrayTags.length;
    arrayTags.forEach((element,index) => {
      str = str + "arg" + index + "=" + element;
      if(index + 1 != arrayLen){
        str = str + "&";
      }
    });
    this.httpService.get(`http://localhost:8000/api/me?${str}`).subscribe((data) => {
      let uglyJson:any = data;
      this.statuses = uglyJson.statuses;
    });
  }
}
