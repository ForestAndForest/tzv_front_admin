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
      <n-button v-permission="'AddNews'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        增加新闻
      </n-button>
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
          placeholder="请输入标题关键字"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="作者">
        <n-input
          v-model:value="queryItems.author"
          clearable
          placeholder="请输入作者名字关键字"
          type="text"
        />
      </MeQueryItem>

      <MeQueryItem :label-width="50" label="状态">
        <n-select v-model:value="queryItems.status" :options="statusOptions" clearable />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        :disabled="modalAction === 'view'"
        :label-width="80"
        :model="modalForm"
        label-align="left"
        label-placement="left"
      >
        <n-form-item v-if="modalAction !== 'add'" label="序号" path="id">
          <n-input-number v-model:value="modalForm.id" :disabled="true" :show-button="false" />
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input v-model:value="modalForm.title" :disabled="modalAction === 'view'" />
        </n-form-item>
        <n-form-item label="来源" path="author">
          <n-input v-model:value="modalForm.author" :disabled="modalAction === 'view'" />
        </n-form-item>
        <n-form-item label="封面" path="imageUrl">
          <n-upload
            v-model:file-list="fileList"
            :custom-request="customRequest"
            :max="1"
            list-type="image-card"
          >
            <n-upload-dragger>
              <div class="h-120 w-120 f-c-c flex-col">
                <i class="i-mdi:upload text-36"></i>
                <n-text class="text-11 color-gray">点击或者拖动文件到该区域来上传</n-text>
              </div>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input
            v-model:value="modalForm.content"
            :disabled="modalAction === 'view'"
            type="textarea"
          />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="modalForm.status" :options="statusOptions" :default-value="0"></n-select>
        </n-form-item>
        <n-form-item label="发布日期" path="createdAt">
          <n-date-picker v-model:value="modalForm.createdAt" type="datetime" :default-value="new Date().getTime()"></n-date-picker>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NTag } from 'naive-ui'
import { formatDateTime } from '@/utils'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { CommonPage } from '@/components/index.js'
import gApi from '@/api'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
// const fileList = ref([])

const fileList = ref([])

onMounted(() => {
  $table.value?.handleSearch()
})

const statusOptions = [
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
  { label: '下架', value: 2 },
]

const roles = ref([])
api.getAllRoles().then(({ data = [] }) => (roles.value = data))

const columns = [
  { title: '序号', key: 'id', width: 80, ellipsis: { tooltip: true } },
  {
    title: '封面',
    key: 'imageUrl',
    width: 120,
    render: ({ imageUrl }) =>
      h(NAvatar, {
        size: 'medium',
        src: imageUrl,
      }),
  },
  { title: '标题', key: 'title', width: 220, ellipsis: { tooltip: true } },
  { title: '来源', key: 'author', width: 150, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createDate',
    width: 220,
    render(row) {
      return h('span', formatDateTime(row['createdAt']))
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) =>
      h(
        NTag,
        { type: row.status === 0 ? 'default' : row.status === 1 ? 'primary' : 'warning' },
        () => statusOptions.find((item) => row.status === item.value).label
      ),
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
            onClick: () => handleOpen({ action: 'edit', title: '编辑', row }),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-fe:edit text-14' }),
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          }
        ),
      ]
    },
  },
]

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '动态',
  initForm: { enable: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

watch(modalForm, (newValue) => {
  fileList.value =
    newValue.imageUrl !== undefined
      ? [
          {
            id: new Date().getTime(),
            name: 'imageUrl',
            status: 'finished',
            thumbnailUrl: newValue.imageUrl,
          },
        ]
      : []
})

async function customRequest({ file, onFinish }) {
  try {
    $message.loading('上传中..')
    const formData = new FormData()
    formData.append('file', file.file)
    const imageUrl = (await gApi.uploadImage(formData)).data
    modalForm.value.imageUrl = imageUrl
    fileList.value = [
      {
        id: new Date().getTime(),
        name: 'imageUrl',
        status: 'finished',
        thumbnailUrl: imageUrl,
      },
    ]
    onFinish()
    $message.destroy()
    $message.success('上传成功')
  } catch (e) {
    $message.error('上传失败' + e)
  }
}
</script>
