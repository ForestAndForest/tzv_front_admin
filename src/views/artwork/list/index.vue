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
        新增艺术品
      </n-button>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="艺术品名" :label-width="50">
        <n-input
          v-model:value="queryItems.name"
          type="text"
          placeholder="请输入艺术品名"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="用料" :label-width="50">
        <n-input
          v-model:value="queryItems.material"
          type="text"
          placeholder="请输入用料"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="类型" :label-width="50">
        <n-select v-model:value="queryItems.type" clearable :options="artworkType" />
      </MeQueryItem>
      <MeQueryItem label="作者" :label-width="50">
        <n-select v-model:value="queryItems.publisher" clearable :options="artworkPublisher" />
      </MeQueryItem>
      <MeQueryItem label="状态" :label-width="50">
        <n-select v-model:value="queryItems.state" clearable :options="artworkState" />
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
        >
          <n-form-item
            label="艺术品名"
            path="name"
            :rule="{
              required: true,
              message: '请输入艺术品名',
              trigger: ['input', 'blur'],
            }"
          >
            <n-input v-model:value="modalForm.name" />
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
              :disabled="modalAction !== 'add'"
            />
          </n-form-item>
          <n-form-item label="图片" path="image">
            <n-upload v-model:value="modalForm.image">
              <n-button>添加图片</n-button>
            </n-upload>
          </n-form-item>
          <n-form-item label="权限" path="permissionIds">
            <n-tree
              key-field="id"
              label-field="name"
              :selectable="false"
              :data="permissionTree"
              :checked-keys="modalForm.permissionIds"
              :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"
              default-expand-all
              checkable
              check-on-click
              class="cus-scroll max-h-200 w-full"
            />
          </n-form-item>
          <n-form-item label="状态" path="enable">
            <n-switch v-model:value="modalForm.enable">
              <template #checked>启用</template>
              <template #unchecked>停用</template>
            </n-switch>
          </n-form-item>
        </n-form>
      </n-scrollbar>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NTag, NAvatar, NButton, NSwitch } from 'naive-ui'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { h } from 'vue'
import { CommonPage } from '@/components/index.js'

defineOptions({ name: 'ArtworkMgt' })

const router = useRouter()
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
const artworkPublisher = [
  {
    label: '作者1',
    value: 1,
  },
  {
    label: '作者2',
    value: 2,
  },
]
const artworkState = [
  { label: '已发布', value: 1 },
  { label: '已删除', value: 2 },
  { label: '审核中', value: 3 },
  { label: '审核失败', value: 4 },
]

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const columns = [
  { title: '手工艺术品名', key: 'name' },
  {
    title: '图片',
    key: 'image',
    render: ({ img }) =>
      h(NAvatar, {
        size: 'medium',
        src: img,
      }),
  },
  {
    title: '作者',
    key: 'publisher',
  },
  {
    title: '用料',
    key: 'material',
  },
  {
    title: '类型',
    key: 'type',
    ellipsis: { tooltip: true },
    render: (row) =>
      h(NTag, { type: 'default' }, () => artworkType.find((item) => item.value === row.type).label),
  },
  {
    title: '状态',
    key: 'state',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) =>
      h(
        NTag,
        {
          type:
            row.state === 1
              ? 'success'
              : row.state === 2
              ? 'tertiary'
              : row.state === 3
              ? 'info'
              : 'error',
        },
        () => artworkState.find((item) => item.value === row.state).label
      ),
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

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit } =
  useCrud({
    name: '艺术品',
    doCreate: api.create,
    doDelete: api.delete,
    doUpdate: api.update,
    initForm: { enable: true },
    refresh: () => $table.value?.handleSearch(),
  })

const permissionTree = ref([])
</script>
