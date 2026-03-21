import {
  buildFolderViewCore,
  type FolderViewCoreWebdav
} from "@/entity/main/Folder.ts";
import {DialogPlugin, Form, FormItem, Input, RadioGroup} from "tdesign-vue-next";
import {addFolder} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function addWebdavFolderDialog(onUpdate: () => void) {
  const data = ref<FolderViewCoreWebdav>(buildFolderViewCore('webdav'));
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
        <Input v-model={data.value.path} placeholder={'选填'}/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input type={'password'} v-model={data.value.password}/>
      </FormItem>
      <FormItem label={'服务器地址'} labelAlign={'top'}>
        <Input v-model={data.value.payload.auth_url} placeholder={'192.168.0.1:5055'}/>
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