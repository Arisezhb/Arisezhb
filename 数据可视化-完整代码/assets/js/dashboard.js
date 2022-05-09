window.onload = function() {
  let btn = document.querySelector('.btn')
  let batch = document.querySelector('#batch')
  let lis = batch.querySelectorAll('li')
  // 获取概览信息
  axios({ url: '/student/overview' }).then(res => {
    let data = res.data.data
    document.querySelector('.total').innerText = data.total
    document.querySelector('.avgSalary').innerText = data.avgSalary
    document.querySelector('.avgAge').innerText = data.avgAge
    document.querySelector('.proportion').innerText = data.proportion
  })

  // 获取所有学员信息，转换为不同的图表源数据
  axios({
    url: '/student/list'
  }).then(res => {
    let data = res.data.data
    console.log(data)

    // 饼图数据
    let pie = []
    // 折线数据
    let names = [],
      salarys = [],
      trueSalarys = []
    // 地图经纬度数据
    let chinaGeoCoordMap = {}
    let chinaDatas = []
    // 遍历数据，判断pie中是否已经拥有某个省的数据，如果有就将对应的数据+1，如果没有，就添加一个新对象
    data.forEach(function(value) {
      // 0 生成经纬度数据
      chinaGeoCoordMap[value.province] = [value.jing, value.wei]
      chinaDatas.push([{ name: value.province, value: 0 }])

      // 1.生成饼图数据：[{name:'省份',value:人数}]
      // 查询当前遍历到的数据在pie中是否已经存在
      let result = pie.filter(function(item) {
        return item.name == value.province
      })[0]

      if (result) {
        // 说明已经存在过
        result.value += 1
      } else {
        pie.push({ name: value.province, value: 1 })
      }

      // 2.生成折线图数据
      names.push(value.name)
      salarys.push(value.salary)
      trueSalarys.push(value.truesalary)
    })

    // 绘制饼图
    pieChart(pie)
    // 绘制折线图
    lineChart(names, salarys, trueSalarys)

    // 绘制地图
    mapChart(chinaGeoCoordMap, chinaDatas)
  })

  // 查询组的成绩，传入第几次
  // 次数从1开始
  function getScore(batch = 1) {
    axios({
      url: '/score/batch',
      params: { batch }
    }).then(res => {
      console.log(res)
      barChart(res.data.data)
    })
  }
  getScore()

  // 单击三个点，弹出选项
  btn.addEventListener('click', function() {
    // console.log(window.getComputedStyle(batch).display)
    if (batch.style.display == '' || batch.style.display == 'none') {
      batch.style.display = 'block'
    } else {
      batch.style.display = 'none'
    }
  })
  // 单击获取某一次的成绩
  lis.forEach(function(ele, index) {
    ele.addEventListener('click', function() {
      getScore(index + 1)
      // batch.style.display = 'none'
    })
  })

  // 生成一个简单的饼图
  function pieChart(data) {
    // 1.echarts.init方法创建一个图表对象
    // echarts.init(dom元素)：dom元素就是渲染图表的容器

    let mychart = echarts.init(document.querySelector('.pie'))
    // 2.配置option选项
    let option = {
      title: {
        text: '73期小伙伴',
        left: 'left'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
        {
          name: '学员分布',
          type: 'pie',
          radius: [20, 100],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 10
          },
          data
        }
      ]
    }
    // 3.通过实例的setOption方法根据指定的option绘制图表
    mychart.setOption(option)
  }

  // 生成折线图
  function lineChart(names, salarys, trueSalarys) {
    let mychart = echarts.init(document.querySelector('.line'))
    let option = {
      title: {
        text: '薪资salary'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        // 图例的值必须和series中的数据系列的name属性完全一致
        data: ['期望薪资', '实际薪资']
      },
      dataZoom: [{ type: 'slider', start: 0, end: 100 }],
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          color: 'red'
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '期望薪资',
          data: salarys,
          type: 'line',
          smooth: true
        },
        {
          name: '实际薪资',
          data: trueSalarys,
          type: 'line',
          smooth: true
        }
      ]
    }
    mychart.setOption(option)
  }

  // 生成柱状图
  // function barChart({ group, avgscore, gt60, gt80, lt60 }) {
  function barChart(data) {
    let mychart = echarts.init(document.querySelector('.barChart'))
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '13%',
        containLabel: true
      },
      legend: {
        data: ['平均分', '低于60分人数', '60-80分人数', '高于80分人数']
      },
      xAxis: [
        {
          type: 'category',
          data: data.group,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        // 索引为0的轴
        {
          type: 'value',
          min: 0, // 最小值
          max: 100, // 最大值
          interval: 10, // 刻度的间隔
          axisLabel: {
            formatter: '{value} 分'
          }
        },
        // 索引为1的轴
        {
          type: 'value',
          min: 0,
          max: 10,
          interval: 1,
          axisLabel: {
            formatter: '{value} 人'
          }
        }
      ],

      series: [
        {
          name: '平均分',
          type: 'bar',
          // 指定对应的轴
          yAxisIndex: 0,
          barWidth: 20,
          tooltip: {
            valueFormatter: function(value) {
              return value + ' 分'
            }
          },
          data: data.avgScore
        },
        {
          name: '低于60分人数',
          type: 'bar',
          barWidth: 20,
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function(value) {
              return value + ' 人'
            }
          },
          data: data.lt60
        },
        {
          name: '60-80分人数',
          type: 'bar',
          barWidth: 20,
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function(value) {
              return value + ' 人'
            }
          },
          data: data.gt60
        },

        {
          name: '高于80分人数',
          type: 'bar',
          barWidth: 20,
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function(value) {
              return value + ' 人'
            }
          },
          data: data.gt80
        }
      ]
    }

    mychart.setOption(option)
  }

  // 生成地图
  // ----------------------- 地图 ------------------------------
  function mapChart(chinaGeoCoordMap, chinaDatas) {
    let myChart = echarts.init(document.querySelector('.map'))

    // var chinaGeoCoordMap = {}
    // var chinaDatas = []
    var convertData = function(data) {
      var res = []
      for (var i = 0; i < data.length; i++) {
        var dataItem = data[i]
        var fromCoord = chinaGeoCoordMap[dataItem[0].name]
        var toCoord = [113.265105, 23.156338]
        if (fromCoord && toCoord) {
          res.push([
            {
              coord: fromCoord,
              value: dataItem[0].value
            },
            {
              coord: toCoord
            }
          ])
        }
      }
      return res
    }
    var series = []
    ;[['广东省', chinaDatas]].forEach(function(item, i) {
      console.log(item)
      series.push(
        {
          type: 'lines',
          zlevel: 2,
          effect: {
            show: true,
            period: 4, //箭头指向速度，值越小速度越快
            trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
            symbol: 'arrow', //箭头图标
            symbolSize: 5 //图标大小
          },
          lineStyle: {
            normal: {
              width: 1, //尾迹线条宽度
              opacity: 1, //尾迹线条透明度
              curveness: 0.3 //尾迹线条曲直度
            }
          },
          data: convertData(item[1])
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            //涟漪特效
            period: 4, //动画时间，值越小速度越快
            brushType: 'stroke', //波纹绘制方式 stroke, fill
            scale: 4 //波纹圆环最大限制，值越大波纹越大
          },
          label: {
            normal: {
              show: true,
              position: 'right', //显示位置
              offset: [5, 0], //偏移设置
              formatter: function(params) {
                //圆环显示文字
                return params.data.name
              },
              fontSize: 13
            },
            emphasis: {
              show: true
            }
          },
          symbol: 'circle',
          symbolSize: function(val) {
            return 5 + val[2] * 5 //圆环大小
          },
          itemStyle: {
            normal: {
              show: false,
              color: '#f00'
            }
          },
          data: item[1].map(function(dataItem) {
            return {
              name: dataItem[0].name,
              value: chinaGeoCoordMap[dataItem[0].name].concat([
                dataItem[0].value
              ])
            }
          })
        },
        //被攻击点
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            period: 4,
            brushType: 'stroke',
            scale: 4
          },
          label: {
            normal: {
              show: true,
              position: 'right',
              //offset:[5, 0],
              color: '#0f0',
              formatter: '{b,c}',
              textStyle: {
                color: '#0f0'
              }
            },
            emphasis: {
              show: true,
              color: '#f60'
            }
          },
          symbol: 'pin',
          symbolSize: 50,
          data: [
            {
              name: item[0],
              value: chinaGeoCoordMap[item[0]].concat([10])
            }
          ]
        }
      )
    })

    //
    let option = {
      // 标题
      title: {
        // left: 'center',
        text: '来广路线 From',
        textStyle: {
          color: '#6d767e'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(166, 200, 76, 0.82)',
        borderColor: '#FFFFCC',
        showDelay: 0,
        hideDelay: 0,
        enterable: true,
        transitionDuration: 0,
        extraCssText: 'z-index:100',
        formatter: function(params, ticket, callback) {
          //根据业务自己拓展要显示的内容
          var res = ''
          var name = params.name
          var value = params.value[params.seriesIndex + 1]
          res =
            "<span style='color:#fff;'>" + name + '</span><br/>数据：' + value
          return res
        }
      },
      backgroundColor: '#fff',
      visualMap: {
        // 图例值控制（官方叫做视觉映射组件）
        min: 0,
        max: 1,
        calculable: true,
        show: false,
        color: ['#f44336', '#fc9700', '#ffde00', '#ffde00', '#00eaff'],
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: 'china',
        zoom: 1.2,
        label: {
          emphasis: {
            show: false
          }
        },
        roam: true, //是否允许缩放
        itemStyle: {
          normal: {
            color: 'rgba(51, 69, 89, .5)', //地图背景色
            borderColor: '#516a89', //省市边界线00fcff 516a89
            borderWidth: 1
          },
          emphasis: {
            color: 'rgba(37, 43, 61, .5)' //悬浮背景
          }
        }
      },
      series: series
    }

    myChart.setOption(option)
  }
}
