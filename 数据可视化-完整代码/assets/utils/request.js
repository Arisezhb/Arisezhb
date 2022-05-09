// 全局的axios配置
// 1.配置基准路径
axios.defaults.baseURL = 'http://www.itcbc.com:8000'

// 添加全局的请求头的设置，用于传递token
// axios.defaults.headers.common['Authorization'] = localStorage.getItem(
//   'mytoken_73'
// )

// 在请求拦截器中添加token的传递--当前axios的每个请求都会经过
// 添加请求拦截器 -- 加工器
axios.interceptors.request.use(
  // config：请求报文,报文行和报文体以及其它必要的信息 --- 相当于你写的论文及相关资料
  function(config) {
    // console.log(config)
    // return

    // 在发送请求之前做些什么:如果有token则通过请求头的方式传递
    let token = localStorage.getItem('mytoken_73')
    if (token) {
      // config.headers请求报文头，请求拦截器在这里就是对报文头添加了新的属性，后期可以实现状态保持
      config.headers.Authorization = token
    }

    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加一个响应拦截器，对所有请求的服务器响应进行统一的处理
// 添加响应拦截器
axios.interceptors.response.use(
  function(response) {
    // 响应成功了，有可能真正的成功了，也有可能服务器响应了，但是请求实际上失败了
    // console.log('ok')

    // 对响应数据做点什么
    return response
  },
  function(error) {
    // 响应错误了，出错了
    if (error.response.status == 401 || error.response.status == 403) {
      toastr.warning(error.response.data.message)
      window.parent.location.href = './login.html'
    }

    // 对响应错误做点什么
    return Promise.reject(error)
  }
)
