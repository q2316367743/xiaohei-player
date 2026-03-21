import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {type FolderType, type FolderView} from "@/entity/main/Folder.ts";
import {removeFolder, updateFolderPassword} from "@/service";
import {addLocalFolderDialog} from "@/pages/folder/list/components/LocalFileEdit.tsx";
import {addWebdavFolderDialog} from "@/pages/folder/list/components/WebdavFileEdit.tsx";
import {addSmbFolderDialog} from "@/pages/folder/list/components/SmbFileEdit.tsx";

export function addFolderDialog(type: FolderType, onUpdate: () => void) {
  if (type === 'local') {
    addLocalFolderDialog(onUpdate);
  } else if (type === 'webdav') {
    addWebdavFolderDialog(onUpdate);
  } else if (type === 'smb') {
    addSmbFolderDialog(onUpdate);
  }
}

export function openUpdateLocalPassword(folder: FolderView, onUpdate: () => void) {
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
      updateFolderPassword(folder.id, data.value.old, data.value.password)
        .then(() => {
          MessageUtil.success('修改成功');
          dp.destroy();
          onUpdate();
        })
        .catch(e => {
          MessageUtil.error("修改失败", e);
        })
    }
  })
}

export function openDeleteFolderLocal(folder: FolderView, onUpdate: () => void) {
  MessageBoxUtil.confirm("确定要删除吗？", "删除文件夹")
    .then(() => {
      removeFolder(folder.id).then(() => {
        onUpdate();
        MessageUtil.success('删除成功');
      }).catch(e => {
        MessageUtil.error("删除失败", e);
      })
    })
}