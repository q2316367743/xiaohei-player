import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import XhFileSelect from "@/components/xiaohei/XhFileSelect.vue";
import {addLibrary, removeLibrary, updateLibraryPassword} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {LibraryCore, LibraryEntity} from "@/entity/main/LibraryEntity.ts";

export function addLibraryDialog(onUpdate: () => void) {
  const data = ref<LibraryCore>({
    name: '',
    path: '',
    password: '',
  });
  const dp = DialogPlugin({
    header: '添加收藏库',
    confirmBtn: '添加',
    placement: 'center',
    width: '480px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'路径'} labelAlign={'top'}>
        <XhFileSelect v-model={data.value.path} directory={true} label={'选择文件夹'}/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input type={'password'} v-model={data.value.password}/>
      </FormItem>
    </Form>,
    onConfirm() {
      addLibrary(data.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy();
        onUpdate();
      }).catch(e => {
        MessageUtil.error("添加失败", e);
      })
    }
  })
}

export function openUpdateLibraryPassword(library: LibraryEntity, onUpdate: () => void) {
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
      updateLibraryPassword(library.id, data.value.old, data.value.password)
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

export function openDeleteFolderLocal(library: LibraryEntity, onUpdate: () => void) {
  MessageBoxUtil.confirm("确定要删除吗？", "删除文件夹")
    .then(() => {
      removeLibrary(library.id).then(() => {
        onUpdate();
        MessageUtil.success('删除成功');
      }).catch(e => {
        MessageUtil.error("删除失败", e);
      })
    })
}