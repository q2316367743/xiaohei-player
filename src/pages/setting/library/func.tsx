import type {PrimaryTableCol} from "tdesign-vue-next";
import {revealItemInDir} from '@tauri-apps/plugin-opener';
import {Button, DialogPlugin, Form, FormItem, Input, Link, Popconfirm, Switch} from "tdesign-vue-next";
import type {LibraryItem} from "@/entity/setting/LibrarySetting.ts";
import XhFileSelect from "@/components/xiaohei/XhFileSelect.vue";

export const settingLibraryItemColumns = (
  onItemChange: (path: string, key: 'hidden', value: boolean) => void,
  onDelete: (path: string) => void
): Array<PrimaryTableCol> => {
  return [{
    title: '名称',
    colKey: 'name',
    width: 200
  }, {
    title: '路径',
    colKey: 'path',
    cell: (_h, {row}) => <Link theme={'primary'} onClick={() => revealItemInDir(row.path)}>{row.path}</Link>
  }, {
    title: '默认隐藏',
    colKey: 'hidden',
    width: 100,
    cell: (_h, {row}) => <Switch value={row.hidden} onChange={e => onItemChange(row.path, 'hidden', e as any)}/>
  }, {
    title: '操作',
    colKey: 'action',
    width: 80,
    cell: (_h, {row}) => <Popconfirm content={'确认删除吗？'} onConfirm={() => onDelete(row.path)}>
      <Button theme="danger" variant="text">删除</Button>
    </Popconfirm>
  }];
}

export const addLibraryItem = (onConfirm: (item: LibraryItem) => void) => {
  const data = ref<LibraryItem>({
    name: '', path: '', hidden: false
  });

  const dp = DialogPlugin({
    header: '新增收藏库',
    default: () => <Form data={data.value}>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'路径'} labelAlign={'top'}>
        <XhFileSelect v-model={data.value.path} directory={true} label={'选择文件夹'}/>
      </FormItem>
      <FormItem label={'默认隐藏'} labelAlign={'top'}>
        <Switch v-model={data.value.hidden}/>
      </FormItem>
    </Form>,
    onConfirm() {
      onConfirm(data.value);
      dp.destroy();
    },
  })
}

