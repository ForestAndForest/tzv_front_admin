<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:52:40
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <n-button type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增文物
      </n-button>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="文物" :label-width="50">
        <n-input v-model:value="queryItems.name" type="text" placeholder="请输入文物名" clearable />
      </MeQueryItem>
      <MeQueryItem label="材质" :label-width="50">
        <n-select
          v-model:value="queryItems.material"
          placeholder="请选择材质"
          :options="materialList"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="价值" :label-width="50">
        <n-input v-model:value="queryItems.value" type="text" placeholder="请输入价值" clearable />
      </MeQueryItem>
    </MeCrud>
    <MeModal ref="modalRef" width="520px">
      <n-scrollbar style="max-height: 380px" content-style="padding-right: 20px;">
        <n-form
          ref="modalFormRef"
          label-placement="left"
          label-align="left"
          :label-width="80"
          :model="modalForm"
          :rules="rules"
        >
          <n-form-item
            label="艺术品名"
            path="name"
            :rule="{
              required: true,
              message: '请输入艺术品名',
              trigger: ['blur', 'change'],
            }"
          >
            <n-input v-model:value="modalForm.name" placeholder="请输入你的艺术品名" />
          </n-form-item>
          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="modalForm.description"
              type="textarea"
              :autosize="{
                minRows: 3,
                maxRows: 5,
              }"
              placeholder="请介绍你的艺术品"
            />
          </n-form-item>
          <n-form-item label="图片" path="image">
            <n-upload
              v-model:file-list="fileList"
              :custom-request="fileRequest"
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
          <n-form-item
            :span="12"
            label="类型"
            path="type"
            :rule="{
              required: true,
              message: '请选择类型',
              trigger: ['blur', 'change'],
              type: 'number',
            }"
          >
            <n-select
              v-model:value="modalForm.type"
              placeholder="请选择类型"
              :options="artworkType"
            />
          </n-form-item>
          <n-form-item
            label="库存"
            path="stock"
            :rule="{
              required: true,
              message: '请添加库存',
              trigger: ['blur', 'change'],
              type: 'number',
            }"
          >
            <n-input-number v-model:value="modalForm.stock" placeholder="请输入库存" />
          </n-form-item>
          <n-form-item
            label="售价"
            path="price"
            :rule="{
              required: true,
              message: '请输入售价',
              trigger: ['blur', 'change'],
              type: 'number',
            }"
          >
            <n-input-number
              v-model:value="modalForm.price"
              placeholder="请输入售价"
              :min="0"
              :precision="2"
              :show-button="false"
              style="width: 26%"
            />
          </n-form-item>
          <n-form-item
            label="用料"
            path="material"
            :rule="{
              required: true,
              message: '请输入你的用料',
              trigger: ['blur', 'change'],
            }"
          >
            <n-input
              v-model:value="modalForm.material"
              placeholder="请输入你的用料"
              style="width: 33%"
            />
          </n-form-item>
        </n-form>
      </n-scrollbar>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NTag, NAvatar, NButton } from 'naive-ui'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { h } from 'vue'
import { CommonPage } from '@/components/index.js'
import gApi from '@/api'
import { useUserStore } from '@/store'

defineOptions({ name: 'ArtworkMgt' })

const userStore = useUserStore()
const fileList = ref([])
const artworkType = [
  {
    label: '茶杯',
    value: 0,
  },
  {
    label: '衣服',
    value: 1,
  },
]
const materialList = [
  {
    label: '青铜',
    value: '青铜',
  },
  {
    label: '玉石',
    value: '玉石',
  },
]
const roles = ref([])
api.getAllRoles().then(({ data = [] }) => (roles.value = data))

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const columns = [
  { title: '文物名称', key: 'name' },
  {
    title: '图片',
    key: 'image',
    render: ({ image }) =>
      h(NAvatar, {
        size: 'medium',
        src: image,
      }),
  },
  {
    title: '年代',
    key: 'era',
  },
  {
    title: '材质',
    key: 'material',
  },
  {
    title: '重量',
    key: 'weight',
    ellipsis: { tooltip: true },
    render: (row) => h(NTag, { type: 'default' }, () => row.weight),
  },
  {
    title: '宽度',
    key: 'width',
    ellipsis: { tooltip: true },
    render: (row) => h(NTag, { type: 'default' }, () => row.width),
  },
  {
    title: '高度',
    key: 'height',
    ellipsis: { tooltip: true },
    render: (row) => h(NTag, { type: 'default' }, () => row.height),
  },
  {
    title: '深度',
    key: 'depth',
    ellipsis: { tooltip: true },
    render: (row) => h(NTag, { type: 'default' }, () => row.depth),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
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

const { modalRef, modalFormRef, modalForm, handleAdd, handleDelete, handleEdit } = useCrud({
  name: '艺术品',
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  initForm: { publisher: userStore.userInfo.id },
  refresh: () => $table.value?.handleSearch(),
})
watch(modalForm, (newValue) => {
  fileList.value =
    newValue.image !== undefined
      ? [
          {
            id: new Date().getTime(),
            name: 'image',
            status: 'finished',
            thumbnailUrl: newValue.imageUrl,
          },
        ]
      : []
})
async function fileRequest({ file, onFinish }) {
  try {
    $message.loading('上传中..')
    const formData = new FormData()
    formData.append('file', file.file)
    const image = (await gApi.uploadImage(formData)).data
    modalForm.value.image = image
    fileList.value = [
      {
        id: new Date().getTime(),
        name: 'image',
        status: 'finished',
        thumbnailUrl: image,
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
