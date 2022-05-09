window.onload = function() {
  let tbody = document.querySelector('tbody')
  // 添加新学员
  let btnAddStu = document.querySelector('.btnAddStu')
  let btnAddStudent = document.querySelector('.btnAddStudent')
  // 新增用户模态框
  let addModal = document.querySelector('#addModal')
  let addModalLabel = document.querySelector('#addModalLabel')
  // 新增用户-省下拉列表
  let addProvinceSelect = addModal.querySelector('[name="province"]')
  // 新增用户-市下拉列表
  let addCitySelect = addModal.querySelector('[name="city"]')
  // 新增用户-区县下拉列表
  let addCountySelect = addModal.querySelector('[name="county"]')
  let id // 当前编辑学员时的学员id
  // 数据渲染
  function init() {
    axios({
      method: 'get',
      url: '/student/list'
      // headers可以实现自定义的请求头的配置，设置了自定义的请求头
      // Authorization：如果没有意外，都叫这个键名
      // headers: { Authorization: localStorage.getItem('mytoken_73') }
    }).then(res => {
      // console.log(res)
      if (res.data.code == 0) {
        let str = ''
        res.data.data.forEach(function(value, index) {
          str += `<tr>
                    <th scope="row">${index + 1}</th>
                    <td>${value.name}</td>
                    <td>${value.age}</td>
                    <td>${value.sex}</td>
                    <td>${value.group}</td>
                    <td>${value.phone}</td>
                    <td>${value.salary}</td>
                    <td>${value.truesalary}</td>
                    <td>${value.province + value.city + value.county}</td>
                    <td>
                      <button type="button" data-id='${
                        value.id
                      }' class="btn btn-primary btn-sm btnedit">修改</button>
                      <button type="button" data-id='${
                        value.id
                      }' class="btn btn-danger btn-sm btndel">删除</button>
                    </td>
                  </tr>`
        })
        tbody.innerHTML = str
      }
    })
  }
  init()

  // 实现数据的验证
  function test() {
    return {
      fields: {
        name: {
          validators: {
            // 指定自定义的验证规则
            notEmpty: {
              message: '姓名不能为空'
            },
            stringLength: {
              min: 2,
              max: 10,
              message: '姓名长度2~10位'
            }
          }
        },
        age: {
          validators: {
            notEmpty: {
              message: '年龄不能为空'
            },
            greaterThan: {
              // 大于指定的值
              value: 18,
              message: '年龄不能小于18岁'
            },
            lessThan: {
              // 小于指定的值
              value: 60,
              message: '年龄不能超过60岁'
            }
          }
        },
        sex: {
          validators: {
            choice: {
              min: 1,
              max: 1,
              message: '请选择性别'
            }
          }
        },
        group: {
          validators: {
            notEmpty: {
              message: '组号不能为空'
            },
            regexp: {
              regexp: /^\d{1,2}$/,
              message: '请选择有效的组号'
            }
          }
        },
        phone: {
          validators: {
            notEmpty: {
              message: '手机号不能为空'
            },
            regexp: {
              regexp: /^1\d{10}$/,
              message: '请填写有效的手机号'
            }
          }
        },
        salary: {
          validators: {
            notEmpty: {
              message: '实际薪资不能为空'
            },
            greaterThan: {
              value: 800,
              message: '期望薪资不能低于800'
            },
            lessThan: {
              value: 100000,
              message: '期望薪资不能高于100000'
            }
          }
        },
        truesalary: {
          validators: {
            notEmpty: {
              message: '实际薪资不能为空'
            },
            greaterThan: {
              value: 800,
              message: '实际薪资不能低于800'
            },
            lessThan: {
              value: 100000,
              message: '实际薪资不能高于100000'
            }
          }
        },
        province: {
          validators: {
            notEmpty: {
              message: '省份必填'
            }
          }
        },
        city: {
          validators: {
            notEmpty: {
              message: '市必填'
            }
          }
        },
        county: {
          validators: {
            notEmpty: {
              message: '县必填'
            }
          }
        }
      }
    }
  }

  // 默认加载所有省的数据
  axios({
    url: '/geo/province'
  }).then(res => {
    addCitySelect.innerHTML = `<option selected value="">--市--</option>`
    addCountySelect.innerHTML = '<option selected value="">--县--</option>'
    let str = `<option selected value="">--省--</option>`
    res.data.forEach(function(value) {
      str += `<option value="${value}">--${value}--</option>`
    })
    addProvinceSelect.innerHTML = str
  })
  // 实现省市区级联
  // 选择省，加载这个省的市
  // 监听用户是否选择的一个省：change
  addProvinceSelect.addEventListener('change', function() {
    let pname = this.value
    // 如果用户没有选择具体的省则不去发起axios请求，同时重置市的选项值
    addCitySelect.innerHTML = `<option selected value="">--市--</option>`
    addCountySelect.innerHTML = '<option selected value="">--县--</option>'
    if (pname == '') {
      return
    }
    // 根据用户所选择省加载它对应的所有市
    axios({
      url: '/geo/city',
      params: { pname }
    }).then(res => {
      let str = '<option selected value="">--市--</option>'
      res.data.forEach(function(value) {
        str += `<option value="${value}">--${value}--</option>`
      })
      addCitySelect.innerHTML = str
    })
  })

  // 选择市，加载这个市的区县
  addCitySelect.addEventListener('change', function() {
    let pname = addProvinceSelect.value
    let cname = addCitySelect.value
    addCountySelect.innerHTML = '<option selected value="">--县--</option>'
    if (cname == '') {
      return
    }
    axios({
      url: '/geo/county',
      params: { pname, cname }
    }).then(res => {
      let str = '<option selected value="">--县--</option>'
      res.data.forEach(function(value) {
        str += `<option selected value="${value}">--${value}--</option>`
      })
      addCountySelect.innerHTML = str
    })
  })

  // 弹出添加学员信息的模态框
  btnAddStu.addEventListener('click', function() {
    addModalLabel.innerHTML = '录入用户信息'
    btnAddStudent.innerText = '确认添加'
    $('#addModal').modal('show')
  })

  // 添加新学员   和  编辑学员信息
  $('.add-form')
    .bootstrapValidator(test())
    .on('success.form.bv', function(e) {
      e.preventDefault()
      let addForm = document.querySelector('.add-form')
      // 收集数据
      let formdata = new FormData(addForm)
      let data = {}
      formdata.forEach(function(value, key) {
        data[key] = value
      })
      // 判断当前操作到底是新增还是编辑
      if (id) {
        alert(1)
        // 添加id参数
        data.id = id
        // 发起axios请求
        axios({
          method: 'PUT',
          url: '/student/update',
          data
        }).then(res => {
          toastr.success('编辑成功')
          $('#addModal').modal('hide')
          init()
        })
        // 编辑完之后，将id重置为null
        id = null
      } else {
        // 发起axios请求
        axios({
          method: 'post',
          url: '/student/add',
          data
        }).then(res => {
          toastr.success('添加成功')
          $('#addModal').modal('hide')
          init()
        })
      }
    })

  // 实现学员信息的删除
  // 动态生成的元素的事件绑定需要使用委托
  tbody.addEventListener('click', function(e) {
    // contains：判断一个元素是否包含指定名称的样式
    if (e.target.classList.contains('btndel')) {
      // 实现当前用户的删除
      // let id = e.target.dataset.id
      let id = e.target.dataset['id']
      axios({
        method: 'delete',
        url: '/student/delete',
        params: { id }
      }).then(res => {
        toastr.success('删除成功')
        init()
      })
    }
  })

  // 修改业务1：展示默认数据
  // 单击列表中的 “编辑”按钮弹出模态框，同时展示当前用户的详情数据
  // 修改按钮是动态元素，所以事件绑定需要使用事件委托
  tbody.addEventListener('click', function(e) {
    if (e.target.classList.contains('btnedit')) {
      addModalLabel.innerHTML = '编辑用户信息'
      btnAddStudent.innerText = '确认编辑'
      // 填充默认数据，将id存储到全局变量
      id = e.target.dataset.id
      // 根据id查询对应的数据
      axios({
        url: '/student/one',
        params: { id }
      }).then(res => {
        let data = res.data.data
        console.log(data)

        // 填充数据
        addModal.querySelector('[name="name"]').value = data.name
        addModal.querySelector('[name="age"]').value = data.age
        addModal.querySelector('[name="group"]').value = data.group
        // 性别：使用三元表达式，主要是根据数据判断到底为那一个单行按钮添加checked
        data.sex == '男'
          ? (addModal.querySelectorAll('[name="sex"]')[0].checked = true)
          : (addModal.querySelectorAll('[name="sex"]')[1].checked = true)
        addModal.querySelector('[name="phone"]').value = data.phone
        addModal.querySelector('[name="salary"]').value = data.salary
        addModal.querySelector('[name="truesalary"]').value = data.truesalary

        // 省的数据一开始就加载好了，所以可以直接使用value进行匹配，它让匹配value值的选项显示
        addProvinceSelect.value = data.province
        // 城市数据的来源是基于省下拉列表的切换，所以一开始是没有城市的数据，意味着不能直接使用value值进行匹配，所以才赋值内容
        addCitySelect.innerHTML = `<option selected value="${data.city}">--${data.city}--</option>`
        addCountySelect.innerHTML = `<option selected value="${data.county}">--${data.county}--</option>`

        // 弹出模态框
        $('#addModal').modal('show')
      })
    }
  })

  // 修改业务2：实现修改功能
  // 单击模态框中的  “确定”按钮，收集数据，发起axios请求，实现修改功能
  // 见 录入
}
