import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import type {FolderLocal, FolderLocalCore} from "@/entity/domain/FolderLocal.ts";
import XhFileSelect from "@/components/xiaohei/XhFileSelect.vue";
import {useFolderStore} from "@/store/components/FolderStore.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function addFolderDialog() {
  const data = ref<FolderLocalCore>({
    name: '',
    path: '',
    password: ''
  })
  const dp = DialogPlugin({
    header: '添加文件夹',
    confirmBtn: '添加',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'路径'} labelAlign={'top'}>
        <XhFileSelect v-model={data.value.path} directory={true} label={'选择文件夹'}/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input v-model={data.value.password}/>
      </FormItem>
    </Form>,
    onConfirm() {
      useFolderStore().addLocal(data.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy();
      }).catch(e => {
        MessageUtil.error("添加失败", e);
      })
    }
  })
}

export function openUpdateLocalPassword(folder: FolderLocal) {
  const data = ref({
    old: '',
    password: ''
  })
  const dp = DialogPlugin({
    header: '修改密码',
    confirmBtn: '修改',
    default: () => <Form>
      <FormItem label={'旧密码'} labelAlign={'top'} help={'未设置可留空'}>
        <Input v-model={data.value.old} type="password"/>
      </FormItem>
      <FormItem label={'新密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input v-model={data.value.password} type="password"/>
      </FormItem>
    </Form>,
    onConfirm() {
      useFolderStore().updateLocalPassword(folder.id, data.value.old, data.value.password)
        .then(() => {
          MessageUtil.success('修改成功');
          dp.destroy();
        })
        .catch(e => {
          MessageUtil.error("修改失败", e);
        })
    }
  })
}

export function openDeleteFolderLocal(folder: FolderLocal) {
  MessageBoxUtil.confirm("确定要删除吗？", "删除文件夹")
    .then(() => {
      useFolderStore().removeLocal(folder.id).then(() => {
        MessageUtil.success('删除成功');
      }).catch(e => {
        MessageUtil.error("删除失败", e);
      })
    })
}