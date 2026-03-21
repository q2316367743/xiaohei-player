import {buildFolderViewCore, type FolderViewCoreLocal} from "@/entity/main/Folder.ts";
import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import XhFileSelect from "@/components/xiaohei/XhFileSelect.vue";
import {addFolder} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function addLocalFolderDialog(onUpdate: () => void) {
  const data = ref<FolderViewCoreLocal>(buildFolderViewCore('local'));
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