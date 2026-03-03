import {DialogPlugin, Form, FormItem, Input, RadioGroup} from "tdesign-vue-next";
import XhFileSelect from "@/components/xiaohei/XhFileSelect.vue";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {buildFolderViewCore, type FolderType, type FolderView, type FolderViewCore} from "@/entity/domain/Folder.ts";
import {addFolder, removeFolder, updateFolderPassword} from "@/service";

export function addFolderDialog(type: FolderType, onUpdate: () => void) {
  const data = ref<FolderViewCore>(buildFolderViewCore(type));
  const dp = DialogPlugin({
    header: '添加文件夹',
    confirmBtn: '添加',
    placement: 'center',
    width: '650px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'路径'} labelAlign={'top'}>
        {data.value.type === 'local'
          ? <XhFileSelect v-model={data.value.path} directory={true} label={'选择文件夹'}/>
          : <Input v-model={data.value.path} placeholder={'选填'}/>}
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input type={'password'} v-model={data.value.password}/>
      </FormItem>
      {data.value.type === 'webdav' && <>
        <FormItem label={'服务器地址'} labelAlign={'top'}>
          <Input v-model={data.value.payload.auth_url}/>
        </FormItem>
        <FormItem label={'用户名'} labelAlign={'top'}>
          <Input v-model={data.value.payload.auth_username}/>
        </FormItem>
        <FormItem label={'密码'} labelAlign={'top'}>
          <Input type={'password'} v-model={data.value.payload.auth_password}/>
        </FormItem>
        <FormItem label={'认证类型'} labelAlign={'top'}>
          <RadioGroup options={[
            {label: 'auto', value: 'auto'},
            {label: 'digest', value: 'digest'},
            {label: 'none', value: 'none'},
            {label: 'password', value: 'password'},
            {label: 'token', value: 'token'}
          ]} v-model={data.value.payload.auth_type}/>
        </FormItem>
      </>}
    </Form>,
    onConfirm() {
      addFolder(data.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy();
        onUpdate();
      }).catch(e => {
        MessageUtil.error("添加失败", e);
      })
    }
  })
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

export function openDeleteFolderLocal(folder: FolderView) {
  MessageBoxUtil.confirm("确定要删除吗？", "删除文件夹")
    .then(() => {
      removeFolder(folder.id).then(() => {
        MessageUtil.success('删除成功');
      }).catch(e => {
        MessageUtil.error("删除失败", e);
      })
    })
}