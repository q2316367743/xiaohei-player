import {buildNetworkServerEdit, NetworkServerTypeOptions, type NetworkServerEdit, type NetworkServer} from "@/entity";
import {Form, FormItem, Input, Select, InputNumber, Switch} from "tdesign-vue-next";
import {addNetworkServer, deleteNetworkServer, updateNetworkServer} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

function buildForm(data: Ref<NetworkServerEdit>) {
  return () => <Form data={data.value} labelAlign="top">
    <FormItem label={'名称'} name="name" requiredMark>
      <Input v-model={data.value.name} placeholder="请输入名称"/>
    </FormItem>
    <FormItem label={'分组'} name="group">
      <Input v-model={data.value.group} placeholder="请输入分组"/>
    </FormItem>
    <FormItem label={'顺序'} name="sequence">
      <InputNumber v-model={data.value.sequence} placeholder="请输入顺序" style={{width: '100%'}}/>
    </FormItem>
    <FormItem label={'类型'} name="type">
      <Select v-model={data.value.type} options={NetworkServerTypeOptions} placeholder="请选择类型"/>
    </FormItem>
    <FormItem label={'格式'} name="format">
      <Select v-model={data.value.format} options={[
        {label: 'JSON', value: 'json'},
        {label: 'XML', value: 'xml'}
      ]} placeholder="请选择格式"/>
    </FormItem>
    <FormItem label={'URL地址'} name="url" requiredMark>
      <Input v-model={data.value.url} placeholder="请输入URL地址"/>
    </FormItem>
    <FormItem label={'主页'} name="home">
      <Input v-model={data.value.home} placeholder="请输入主页地址"/>
    </FormItem>
    <FormItem label={'M3U8解析地址'} name="m3u8_parse">
      <Input v-model={data.value.m3u8_parse} placeholder="请输入M3U8解析地址，如：https://xxx.com/?url="/>
    </FormItem>
    <FormItem label={'用于聚合搜索'} name="is_aggregate_search">
      <Switch v-model={data.value.is_aggregate_search} customValue={[1, 0]} label={['是', '否']}/>
    </FormItem>
  </Form>
}

export function openAddNetworkServerDrawer(onUpdate: () => void) {
  const data = ref<NetworkServerEdit>(buildNetworkServerEdit());

  const dp = DrawerPlugin({
    header: '新增流媒体',
    size: '600px',
    default: buildForm(data),
    onConfirm: () => {
      addNetworkServer(data.value).then(() => {
        MessageUtil.success('新增成功');
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    }
  })
}

export function openEditNetworkServerDrawer(id: string, old: NetworkServerEdit, onUpdate: () => void) {
  const data = ref<NetworkServerEdit>(old);

  const dp = DrawerPlugin({
    header: '编辑流媒体',
    size: '600px',
    default: buildForm(data),
    onConfirm: () => {
      updateNetworkServer(id, data.value).then(() => {
        MessageUtil.success('更新成功');
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("更新失败", e);
      })
    }
  })
}

export function openDeleteNetworkServer(id: string, onUpdate: () => void) {
  MessageBoxUtil.confirm("确认要删除该流媒体服务器吗？", "删除流媒体服务器").then(() => {
    deleteNetworkServer(id).then(() => {
      MessageUtil.success('删除成功');
      onUpdate();
    }).catch(e => {
      MessageUtil.error("删除失败", e);
    })
  })
}

export function openEditNetworkServerDrawerFromServer(server: NetworkServer, onUpdate: () => void) {
  openEditNetworkServerDrawer(server.id, server, onUpdate);
}
