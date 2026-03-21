import {
  buildFolderViewCore, type FolderViewCoreSmb,
} from "@/entity/main/Folder.ts";
import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import {addFolder} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function addSmbFolderDialog(onUpdate: () => void) {
  const data = ref<FolderViewCoreSmb>(buildFolderViewCore('smb'));
  const dp = DialogPlugin({
    header: '添加文件夹',
    confirmBtn: '添加',
    placement: 'center',
    width: '650px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'} help={'留空则不设置'}>
        <Input type={'password'} v-model={data.value.password}/>
      </FormItem>
      <FormItem label={'服务器地址'} labelAlign={'top'}>
        <Input v-model={data.value.payload.domain} placeholder={'192.168.0.1:5055'}/>
      </FormItem>
      <FormItem label={'用户名'} labelAlign={'top'}>
        <Input v-model={data.value.payload.username}/>
      </FormItem>
      <FormItem label={'密码'} labelAlign={'top'}>
        <Input type={'password'} v-model={data.value.payload.password}/>
      </FormItem>
      <FormItem label={'共享目录'} labelAlign={'top'}>
        <Input v-model={data.value.payload.share} placeholder={"\\share\\example"}/>
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