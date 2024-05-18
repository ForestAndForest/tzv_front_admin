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
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="api.read"
      :scroll-x="1200"
    >
      <MeQueryItem :label-width="50" label="标题">
        <n-input
          v-model:value="queryItems.title"
          clearable
          placeholder="请输入标题关键字搜索"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="作者">
        <n-input
          v-model:value="queryItems.nickname"
          clearable
          placeholder="请输入作者昵称关键字搜索"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="状态">
        <n-select
          v-model:value="queryItems.status"
          :options=statusOptions
          clearable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px" :show-cancel="false" :show-ok="false" :show-footer="false">
      <n-form label-align="left" label-placement="left" :label-width="80">
        <n-form-item label="标题">
          <n-input v-model:value="modalForm.title" clearable placeholder="请输入标题" />
        </n-form-item>
      </n-form>
    </MeModal>

  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
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

const statusOptions = [
  {
    label: '已发布',
    value: 1
  },
  {
    label: '已删除',
    value: 2
  },
  {
    label: '审核中',
    value: 3
  },
  {
    label: '审核失败',
    value: 4
  }
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
    title: '标题',
    key: 'title',
    width: 250,
    ellipsis: { tooltip: true }
  },
  { title: '作者', key: 'authorName', width: 150, ellipsis: { tooltip: true } },
  {
    title: '发布时间',
    key: 'createDate',
    width: 220,
    render(row) {
      return h('span', formatDateTime(row['createdAt']))
    }
  },
  { title: '浏览量', key: 'views', width: 150, ellipsis: { tooltip: true } },
  { title: '点赞数', key: 'likes', width: 150, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'enable',
    width: 120,
    render: (row) =>
      h(
        NTag,
        {
          // 1: 已发布 2:已删除 3:审核中 4:审核失败
          type: row.status === 1 ? 'success' : row.status === 2 ? 'default' : row.status === 3 ? 'primary' : 'error'
        },
        {
          default: () => statusOptions.find((item) => item.value === row.status).label
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
