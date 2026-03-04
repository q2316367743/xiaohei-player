import {Form, FormItem, Input, Select, Textarea} from "tdesign-vue-next";
import {DownloadPluginPlatformOptions} from "@/entity/main/DownloadPlugin.ts";
import {addDownloadPlugin, removeDownloadPlugin, updateDownloadPlugin} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import type {DownloadPluginView, DownloadPluginViewCore} from "@/entity/main/DownloadPlugin.ts";

export function addDownloadPluginDialog(onUpdate: () => void) {
  const data = ref<DownloadPluginViewCore>({
    name: '',
    description: '',
    author: '',
    version: '',
    platform: [],
    url: '',
    rule_title: '',
    rule_cover: '',
    rule_author: '',
    rule_description: '',
    rule_url: '',
  });
  const dp = DrawerPlugin({
    header: '添加下载插件',
    confirmBtn: '添加',
    size: '600px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder={'请输入插件名称'}/>
      </FormItem>
      <FormItem label={'描述'} labelAlign={'top'}>
        <Textarea v-model={data.value.description} placeholder={'请输入插件描述'}/>
      </FormItem>
      <FormItem label={'作者'} labelAlign={'top'}>
        <Input v-model={data.value.author} placeholder={'请输入作者名称'}/>
      </FormItem>
      <FormItem label={'版本'} labelAlign={'top'}>
        <Input v-model={data.value.version} placeholder={'请输入版本号，如 1.0.0'}/>
      </FormItem>
      <FormItem label={'支持平台'} labelAlign={'top'}>
        <Select v-model={data.value.platform} multiple options={DownloadPluginPlatformOptions} placeholder={'请选择支持的平台'}/>
      </FormItem>
      <FormItem label={'请求链接'} labelAlign={'top'} help={'使用 {{url}} 作为视频链接占位符'}>
        <Input v-model={data.value.url} placeholder={'https://example.com/parse?url={{url}}'}/>
      </FormItem>
      <FormItem label={'标题规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_title} placeholder={'请提取标题的规则'}/>
      </FormItem>
      <FormItem label={'封面规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_cover} placeholder={'请提取封面的规则'}/>
      </FormItem>
      <FormItem label={'作者规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_author} placeholder={'请提取作者的规则'}/>
      </FormItem>
      <FormItem label={'描述规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_description} placeholder={'请提取描述的规则'}/>
      </FormItem>
      <FormItem label={'链接规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_url} placeholder={'请提取下载链接的规则'}/>
      </FormItem>
    </Form>,
    onConfirm() {
      addDownloadPlugin(data.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy?.();
        onUpdate();
      }).catch(e => {
        MessageUtil.error("添加失败", e);
      })
    }
  })
}

export function updateDownloadPluginDialog(plugin: DownloadPluginView, onUpdate: () => void) {
  const data = ref<Partial<DownloadPluginViewCore>>({
    name: plugin.name,
    description: plugin.description,
    author: plugin.author,
    version: plugin.version,
    platform: plugin.platform,
    url: plugin.url,
    rule_title: plugin.rule_title,
    rule_cover: plugin.rule_cover,
    rule_author: plugin.rule_author,
    rule_description: plugin.rule_description,
    rule_url: plugin.rule_url,
  });
  const dp = DrawerPlugin({
    header: '编辑下载插件',
    confirmBtn: '保存',
    size: '600px',
    default: () => <Form>
      <FormItem label={'名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder={'请输入插件名称'}/>
      </FormItem>
      <FormItem label={'描述'} labelAlign={'top'}>
        <Textarea v-model={data.value.description} placeholder={'请输入插件描述'}/>
      </FormItem>
      <FormItem label={'作者'} labelAlign={'top'}>
        <Input v-model={data.value.author} placeholder={'请输入作者名称'}/>
      </FormItem>
      <FormItem label={'版本'} labelAlign={'top'}>
        <Input v-model={data.value.version} placeholder={'请输入版本号，如 1.0.0'}/>
      </FormItem>
      <FormItem label={'支持平台'} labelAlign={'top'}>
        <Select v-model={data.value.platform} multiple options={DownloadPluginPlatformOptions} placeholder={'请选择支持的平台'}/>
      </FormItem>
      <FormItem label={'请求链接'} labelAlign={'top'} help={'使用 {{url}} 作为视频链接占位符'}>
        <Input v-model={data.value.url} placeholder={'https://example.com/parse?url={{url}}'}/>
      </FormItem>
      <FormItem label={'标题规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_title} placeholder={'请提取标题的规则'}/>
      </FormItem>
      <FormItem label={'封面规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_cover} placeholder={'请提取封面的规则'}/>
      </FormItem>
      <FormItem label={'作者规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_author} placeholder={'请提取作者的规则'}/>
      </FormItem>
      <FormItem label={'描述规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_description} placeholder={'请提取描述的规则'}/>
      </FormItem>
      <FormItem label={'链接规则'} labelAlign={'top'}>
        <Input v-model={data.value.rule_url} placeholder={'请提取下载链接的规则'}/>
      </FormItem>
    </Form>,
    onConfirm() {
      updateDownloadPlugin(plugin.id, data.value).then(() => {
        MessageUtil.success('修改成功');
        dp.destroy?.();
        onUpdate();
      }).catch(e => {
        MessageUtil.error("修改失败", e);
      })
    }
  })
}

export function deleteDownloadPluginDialog(plugin: DownloadPluginView, onUpdate: () => void) {
  MessageBoxUtil.confirm(`确定要删除插件 "${plugin.name}" 吗？`, "删除插件")
    .then(() => {
      removeDownloadPlugin(plugin.id).then(() => {
        onUpdate();
        MessageUtil.success('删除成功');
      }).catch(e => {
        MessageUtil.error("删除失败", e);
      })
    })
}
