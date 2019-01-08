import request from '@/utils/request'

export function login(username, password) {
  var params = new URLSearchParams()
  params.append('username', username)
  params.append('pwd', password)
  return request({
    url: '/user/login',
    method: 'post',
    data: params
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'post'
  })
}

export function logout(token) {
  return request({
    url: '/user/logout',
    method: 'post',
    params: { token }
  })
}
