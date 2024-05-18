/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  read: (params = {}) => request.get('/api/post', { params }),
  updateStatus: (data) => request.patch(`/api/user/update/status/${data.id}`, data),

  //以下api未使用请勿轻易删除
  create: (data) => request.post('/user', data),
  delete: (id) => request.delete(`/user/${id}`),
  resetPwd: (id, data) => request.patch(`/user/password/reset/${id}`, data),
  getAllRoles: () => request.get('/role?enable=1'),
}
