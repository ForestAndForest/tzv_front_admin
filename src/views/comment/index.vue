<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <n-button v-permission="'AddFrontUser'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建新用户
      </n-button>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="api.read"
      :scroll-x="1200"
    >
      <MeQueryItem :label-width="50" label="用户名">
        <n-input
          v-model:value="queryItems.username"
          clearable
          placeholder="请输入用户名"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="邮箱">
        <n-input
          v-model:value="queryItems.email"
          clearable
          placeholder="请输入邮箱"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="状态">
        <n-select
          v-model:value="queryItems.enable"
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem :label-width="70" label="用户类型">
        <n-select
          v-model:value="queryItems.type"
          :options=userType
          clearable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px" :show-cancel="false" :show-ok="false" :show-footer="false">
      <n-form label-align="left" label-placement="left" :label-width="80">
        <n-form-item label="用户名">
        <n-text>{{modalForm.username}}</n-text>
        </n-form-item>
<!--        昵称-->
        <n-form-item label="昵称">
          <n-text>{{modalForm.nickname}}</n-text>
        </n-form-item>
        <n-form-item label="性别">
          <n-text v-if="modalForm.gender">{{genders.find(item => item.value === modalForm.gender).label}}</n-text>
          <n-text v-else>保密</n-text>
        </n-form-item>
        <n-form-item label="生日">
          <n-text v-if="modalForm.birthday">{{formatDateTime(modalForm.birthday)}}</n-text>
          <n-text v-else>未设置</n-text>
        </n-form-item>
        <n-form-item label="邮箱">
          <n-text>{{modalForm.email}}</n-text>
        </n-form-item>
        <n-form-item label="积分">
          <n-text>{{modalForm.score}}</n-text>
        </n-form-item>
        <n-form-item label="状态">
          <n-text>{{modalForm.enable ? '启用' : '停用'}}</n-text>
        </n-form-item>
        <n-form-item label="用户类型">
          <n-tag
            :type="modalForm.type !== 0 ? 'error' : 'default'"
            clearable
          >{{ userType.find(item => item.value === modalForm.type).label }}</n-tag>
        </n-form-item>
        <n-form-item label="注册时间">
          <n-text>{{formatDateTime(modalForm.createdAt)}}</n-text>
        </n-form-item>
        <n-form-item label="更新时间">
          <n-text>{{formatDateTime(modalForm.updatedAt)}}</n-text>
        </n-form-item>
      </n-form>
    </MeModal>

  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import { formatDateTime } from '@/utils'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { CommonPage } from '@/components/index.js'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const genders = [
  { label: '男', value: true },
  { label: '女', value: false },
]

const userType = [
  {
    label: '普通用户',
    value: 0
  },
  {
    label: 'VIP用户',
    value: 1
  }
]

const roles = ref([])
api.getAllRoles().then(({ data = [] }) => (roles.value = data))

const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: ({ avatar }) =>
      h(NAvatar, {
        size: 'medium',
        src: avatar
      })
  },
  { title: '用户名', key: 'username', width: 150, ellipsis: { tooltip: true } },
  {
    title: '用户类型',
    key: 'role',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => h(NTag, { type: row.type !== 0 ? 'error' : 'default' }, () =>userType.find(item => item.value === row.type).label)
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
    render: ({ gender }) => genders.find((item) => gender === item.value)?.label ?? '保密'
  },
  { title: '邮箱', key: 'email', width: 200, ellipsis: { tooltip: true } },
  {
    title: '注册时间',
    key: 'createDate',
    width: 220,
    render(row) {
      return h('span', formatDateTime(row['createdAt']))
    }
  },
  {
    title: '状态',
    key: 'enable',
    width: 120,
    render: (row) =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          onUpdateValue: () => handleEnable(row)
        },
        {
          checked: () => '启用',
          unchecked: () => '停用'
        }
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleOpen({ action: 'view', title: '查看详细', row })
          },
          {
            default: () => '查看详情',
            icon: () => h('i', { class: 'i-fe:edit text-14' })
          }
        ),
      ]
    }
  }
]

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.updateStatus({ id: row.id, enable: !row.enable })
    row.enableLoading = false
    $message.success('操作成功')
    row.enable = !row.enable
    // $table.value?.handleSearch()
  } catch (error) {
    row.enableLoading = false
  }
}

function handleOpenRolesSet(row) {
  const roleIds = row.roles.map((item) => item.id)
  handleOpen({
    action: 'setRole',
    title: '分配角色',
    row: { id: row.id, username: row.username, roleIds },
    onOk: onSave
  })
}

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleOpen,
  handleSave
} = useCrud({
  name: '用户',
  initForm: { enable: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch()
})

function onSave() {
  if (modalAction.value === 'setRole') {
    return handleSave({
      api: () => api.update(modalForm.value),
      cb: () => $message.success('分配成功')
    })
  } else if (modalAction.value === 'reset') {
    return handleSave({
      api: () => api.resetPwd(modalForm.value.id, modalForm.value),
      cb: () => $message.success('密码重置成功')
    })
  }
  handleSave()
}
</script>
