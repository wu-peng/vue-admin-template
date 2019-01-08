import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/list',
    method: 'post',
    params: query
  })
}

export function fetchUser(id) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: { id: id }
  })
}

export function addUser(user) {
  var params = new URLSearchParams()
  params.append('nickname', user.nickname)
  params.append('status', user.status)
  params.append('is_open_cloud_ctrl', user.is_open_cloud_ctrl)
  return request({
    url: '/user/add',
    method: 'post',
    data: params
  })
}

export function updateUser(user) {
  var params = new URLSearchParams()
  params.append('id', user.id)
  params.append('nickname', user.nickname)
  params.append('status', user.status)
  params.append('is_open_cloud_ctrl', user.is_open_cloud_ctrl)
  return request({
    url: '/user/update',
    method: 'post',
    data: params
  })
}

export function delUser(id) {
  var params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/user/del',
    method: 'post',
    data: params
  })
}

export function delUsers(ids) {
  var params = new URLSearchParams()
  params.append('ids', ids)
  return request({
    url: '/user/del',
    method: 'post',
    data: params
  })
}

export function myjs(id) {
  var params = new URLSearchParams()
  params.append('id', id)
  return request({
    url: '/user/myjs',
    method: 'post',
    data: params
  })
}

export function savejs(json) {
  var params = new URLSearchParams()
  params.append('json', json)
  return request({
    url: '/user/savejs',
    method: 'post',
    data: params
  })
}
