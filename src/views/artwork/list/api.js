/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: (data) => request.post('/artwork', data),
  read: (params = {}) => request.get('/artwork/page', { params }),
  update: (data) => request.put('/artwork', data),
  updateStatus: (data) => request.patch(`/api/user/update/status/${data.id}`, data),
  delete: (id) => request.delete(`/artwork/${id}`),

  getAllRoles: () => request.get('/role?enable=1'),
}
