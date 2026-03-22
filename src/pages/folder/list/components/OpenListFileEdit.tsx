import {
  buildFolderViewCore, type FolderViewCoreOpenList,
} from "@/entity/main/Folder.ts";
import {DialogPlugin, Form, FormItem, Input, Radio, RadioGroup} from "tdesign-vue-next";
import {addFolder, getFolder, updateFolder} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function addOpenListFolderDialog(onUpdate: () => void) {
  const data = ref<FolderViewCoreOpenList>(buildFolderViewCore('open_list'));
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
        <Input v-model={data.value.payload.domain} placeholder={'http://192.168.0.1:5123'}/>
      </FormItem>
      <FormItem label={'登录方式'} labelAlign={'top'}>
        <RadioGroup v-model={data.value.payload.type}>
          <Radio value={'basic'}>用户名和密码</Radio>
          <Radio value={'token'}>token 登录</Radio>
        </RadioGroup>
      </FormItem>
      {data.value.payload.type === 'basic' ? <>
        <FormItem label={'用户名'} labelAlign={'top'}>
          <Input v-model={data.value.payload.username}/>
        </FormItem>
        <FormItem label={'密码'} labelAlign={'top'}>
          <Input type={'password'} v-model={data.value.payload.password}/>
        </FormItem>
      </> : <>
        <FormItem label={'token'} labelAlign={'top'} help={'从 设置 -> 其他 -> 令牌 中获取'}>
          <Input type={'password'} v-model={data.value.payload.token}/>
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


export async function updateOpenListFolderDialog(id: string, onUpdate: () => void) {
  const d = await getFolder(id);
  if (!d) return MessageUtil.error('文件夹不存在');
  const data = ref<FolderViewCoreOpenList>(d as FolderViewCoreOpenList);
  const dp = DialogPlugin({
    header: '修改 OpenList 文件夹',
    confirmBtn: '修改',
    placement: 'center',
    width: '650px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'服务器地址'} labelAlign={'top'}>
        <Input v-model={data.value.payload.domain} placeholder={'http://192.168.0.1:5123'}/>
      </FormItem>
      <FormItem label={'登录方式'} labelAlign={'top'}>
        <RadioGroup v-model={data.value.payload.type}>
          <Radio value={'basic'}>用户名和密码</Radio>
          <Radio value={'token'}>token 登录</Radio>
        </RadioGroup>
      </FormItem>
      {data.value.payload.type === 'basic' ? <>
        <FormItem label={'用户名'} labelAlign={'top'}>
          <Input v-model={data.value.payload.username}/>
        </FormItem>
        <FormItem label={'密码'} labelAlign={'top'}>
          <Input type={'password'} v-model={data.value.payload.password}/>
        </FormItem>
      </> : <>
        <FormItem label={'token'} labelAlign={'top'} help={'从 设置 -> 其他 -> 令牌 中获取'}>
          <Input type={'password'} v-model={data.value.payload.token}/>
        </FormItem>
      </>}
    </Form>,
    onConfirm() {
      updateFolder(id, data.value).then(() => {
        MessageUtil.success('更新成功');
        dp.destroy();
        onUpdate();
      }).catch(e => {
        MessageUtil.error("更新失败", e);
      })
    }
  })
}