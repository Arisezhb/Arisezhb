// 数据渲染
let tbody = document.querySelector('tbody')
// 发请求 拿数据  分析数据  遍历拼接 赋值
axios({
  url: '/score/list'
}).then(res => {
  let str = ''
  // 数据是一个对象，所以使用for...in进行遍历
  let data = res.data.data
  for (let key in data) {
    str += `<tr data-id='${key}'>
              <th scope="row">${key}</th>
              <td>${data[key].name}</td>
              <td class="score" data-batch='1'>${data[key].score[0]}</td>
              <td class="score" data-batch='2'>${data[key].score[1]}</td>
              <td class="score" data-batch='3'>${data[key].score[2]}</td>
              <td class="score" data-batch='4'>${data[key].score[3]}</td>
              <td class="score" data-batch='5'>${data[key].score[4]}</td>
            </tr>`
  }
  tbody.innerHTML = str
})

// 单击表格实现成绩的更新或录入--在表格td中添加一个用于用户交互的输入框
// 如果当前td中有成绩，就是更新
// 如果没有成绩就是录入
// 操作:
// 1.如果直接失焦就是取消当前操作
// 2.如果是按下enter键就是确认当前操作
// 表格是动态渲染的，所以td的事件绑定应该使用事件委托
tbody.addEventListener('click', function(e) {
  if (e.target.className == 'score') {
    let td = e.target // 当前所单击的td
    // 为了实现后期失焦之后还原td的数据，将td的值先存储
    let current = td.innerText
    if (!td.querySelector('input')) {
      // 创建一个输入框
      let scoreInput = document.createElement('input')
      // 为当前所创建的输入框赋值，值就是当前td的内容
      scoreInput.value = current
      // 设置输入框的样式
      scoreInput.classList.add('inp')
      // 将td的内容清除
      td.innerText = ''
      // 添加到当前td中
      td.appendChild(scoreInput)
      // 让输入框聚焦
      // scoreInput.focus() // 让输入聚焦
      scoreInput.select() // 让内容选中

      // 添加输入框的失焦事件
      scoreInput.addEventListener('blur', function() {
        // 删除td中的子元素
        // remove删除元素本身
        // removeChild删除子元素
        // innerHTML = ''
        td.innerText = current
        // scoreInput.remove()
      })

      scoreInput.addEventListener('keyup', function(e) {
        // 如果按下enter键，则进行成绩录入操作
        if (e.which == 13) {
          let stu_id = td.parentNode.dataset.id
          let batch = td.dataset.batch
          let score = scoreInput.value
          // axios请求
          axios({
            method: 'post',
            url: '/score/entry',
            data: {
              stu_id, // 学员id
              batch, // 第几次成绩
              score // 当前分类
            }
          }).then(res => {
            toastr.success('成绩修改或录入成功')
            td.innerHTML = ''
            // scoreInput.remove()
            td.innerText = score
          })
        }
      })
    }
  }
})
