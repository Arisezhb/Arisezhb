window.onload = function() {
  // 实现左侧导航项单击之后的样式切换
  let allA = document.querySelectorAll('.nav li li a')
  let init = document.querySelector('.init')
  let logout = document.querySelector('.logout')

  allA.forEach(function(ele, index) {
    ele.addEventListener('click', function() {
      // 干掉之前有active样式的a元素的active样式
      document.querySelector('.nav li li a.active').classList.remove('active')
      // 为当前被单击的元素添加active样式
      this.classList.add('active')
    })
  })

  // 初始化数据
  init.addEventListener('click', function() {
    axios({
      url: '/init/data'
    }).then(res => {
      console.log(res)
    })
  })

  // 退出：清除token,回到登陆页
  logout.addEventListener('click', function() {
    localStorage.removeItem('mytoken_73')
    location.href = './index.html'
  })
}
