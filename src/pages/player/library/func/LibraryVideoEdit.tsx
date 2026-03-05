import {DrawerPlugin, Form, FormItem, Input, Select, Tag, Textarea, DatePicker, Button} from "tdesign-vue-next";
import {addActor, addStudio, addTag, getVideoMetadataById, listActor, listStudio, listTag, updateVideoMetadata, type VideoMetadataForm} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import type {CommonOption} from "@/global/CommonType.ts";
import type { ActorCore } from "@/entity/domain/Actor";
import type { StudioCore } from "@/entity/domain/Studio";
import type { TagCore } from "@/entity/domain/Tag";
import XhAvatar from "@/components/xiaohei/XhAvatar.vue";

function openAddStudio(onUpdate: () => void) {
  const data = ref<StudioCore>({
    name: "",
    country: "",
    founded_year: 0,
    website: "",
    logo_path: "",
  });
  const dp = DrawerPlugin({
    header: "添加工作室",
    size: '400px',
    confirmBtn: '添加',
    onConfirm: () => {
      addStudio(data.value).then(() => {
        MessageUtil.success('添加工作室成功');
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("添加工作室失败", e);
      })
    },
    default: () => <Form>
      <FormItem label={'工作室名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder={'请输入工作室名称'}/>
      </FormItem>
      <FormItem label={'Logo'} labelAlign={'top'}>
        <XhAvatar v-model={data.value.logo_path} folder="video/studio" size={80} shape="square" editable={true}/>
      </FormItem>
      <FormItem label={'所属国家'} labelAlign={'top'}>
        <Input v-model={data.value.country} placeholder={'请输入所属国家'}/>
      </FormItem>
      <FormItem label={'成立年份'} labelAlign={'top'}>
        <Input v-model={data.value.founded_year} placeholder={'请输入成立年份'} type="number"/>
      </FormItem>
      <FormItem label={'官网'} labelAlign={'top'}>
        <Input v-model={data.value.website} placeholder={'请输入官网地址'}/>
      </FormItem>
    </Form>
  })
}

function openAddTag(onUpdate: () => void) {
  const data = ref<TagCore>({
    name: "",
    color: "",
  });
  const dp = DrawerPlugin({
    header: "添加标签",
    size: '400px',
    confirmBtn: '添加',
    onConfirm: () => {
      addTag(data.value).then(() => {
        MessageUtil.success('添加标签成功');
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("添加标签失败", e);
      })
    },
    default: () => <Form>
      <FormItem label={'标签名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder={'请输入标签名称'}/>
      </FormItem>
      <FormItem label={'标签颜色'} labelAlign={'top'}>
        <Input v-model={data.value.color} placeholder={'请输入标签颜色 (如: #FF0000)'}/>
      </FormItem>
    </Form>
  })
}

function openAddActor(onUpdate: () => void) {
  const data = ref<ActorCore>({
    name: "",
    original_name: "",
    gender: "other",
    birth_date: "",
    death_date: "",
    biography: "",
    photo_path: "",
  });
  const dp = DrawerPlugin({
    header: "添加演员",
    size: '400px',
    confirmBtn: '添加',
    onConfirm: () => {
      addActor(data.value).then(() => {
        MessageUtil.success('添加演员成功');
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("添加演员失败", e);
      })
    },
    default: () => <Form>
      <FormItem label={'演员名'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder={'请输入演员名'}/>
      </FormItem>
      <FormItem label={'头像'} labelAlign={'top'}>
        <XhAvatar v-model={data.value.photo_path} folder="video/actor" size={80} editable={true}/>
      </FormItem>
      <FormItem label={'原名/英文名'} labelAlign={'top'}>
        <Input v-model={data.value.original_name} placeholder={'请输入原名/英文名'}/>
      </FormItem>
      <FormItem label={'性别'} labelAlign={'top'}>
        <Select v-model={data.value.gender} placeholder={'请选择性别'} options={[
          {label: '男', value: 'male'},
          {label: '女', value: 'female'},
          {label: '其他', value: 'other'}
        ]}/>
      </FormItem>
      <FormItem label={'出生日期'} labelAlign={'top'}>
        <DatePicker 
          v-model={data.value.birth_date} 
          placeholder={'请选择出生日期'}
          format={'YYYY-MM-DD'}
          enableTimePicker={false}
        />
      </FormItem>
      <FormItem label={'逝世日期'} labelAlign={'top'}>
        <DatePicker 
          v-model={data.value.death_date} 
          placeholder={'请选择逝世日期'}
          format={'YYYY-MM-DD'}
          enableTimePicker={false}
        />
      </FormItem>
      <FormItem label={'简介'} labelAlign={'top'}>
        <Textarea v-model={data.value.biography} placeholder={'请输入简介'} autosize={{minRows: 3}}/>
      </FormItem>
    </Form>
  })
}

export function openLibraryVideoEdit(videoId: string, onUpdate: () => void) {
  const data = ref<VideoMetadataForm>({
    title: "",
    description: "",
    link: "",
    release_date: "",
    director: "",
    studio_id: "",
    actorIds: [],
    tagIds: []
  });
  const actorOptions = ref<Array<CommonOption>>([]);
  const tagOptions = ref<Array<CommonOption>>([]);
  const studioOptions = ref<Array<CommonOption>>([]);

  const refreshOptions = async () => {
    const [tags, actors, studios] = await Promise.all([
      listTag(),
      listActor(),
      listStudio()
    ]);
    tagOptions.value = tags.map(tag => ({
      label: tag.name,
      value: tag.id
    }));
    actorOptions.value = actors.map(actor => ({
      label: actor.name,
      value: actor.id
    }));
    studioOptions.value = studios.map(studio => ({
      label: studio.name,
      value: studio.id
    }));
  };

  Promise.all([
    getVideoMetadataById(videoId),
    refreshOptions()
  ]).then(res => {
    const [video] = res;
    if (!video) {
      MessageUtil.error("视频不存在");
      return;
    }
    data.value = video;
  })

  const dp = DrawerPlugin({
    header: "编辑视频信息",
    size: '800px',
    confirmBtn: '保存',
    onConfirm: () => {
      updateVideoMetadata(videoId, data.value)
        .then(() => {
          MessageUtil.success('修改成功');
          dp.destroy?.();
          onUpdate();
        })
        .catch(e => {
          MessageUtil.error("修改失败", e);
        })
    },
    default: () => <Form>
      <FormItem label={'标题'} labelAlign={'top'}>
        <Input v-model={data.value.title} placeholder={'请输入标题'}/>
      </FormItem>
      <FormItem label={'描述'} labelAlign={'top'}>
        <Textarea v-model={data.value.description} placeholder={'请输入描述'} autosize={{minRows: 3}}/>
      </FormItem>
      <FormItem label={'链接'} labelAlign={'top'}>
        <Input v-model={data.value.link} placeholder={'请输入视频链接'}/>
      </FormItem>
      <FormItem label={'发行日期'} labelAlign={'top'}>
        <DatePicker 
          v-model={data.value.release_date} 
          placeholder={'请选择发行日期'}
          format={'YYYY-MM-DD'}
          enableTimePicker={false}
        />
      </FormItem>
      <FormItem label={'导演'} labelAlign={'top'}>
        <Input v-model={data.value.director} placeholder={'请输入导演'}/>
      </FormItem>
      <FormItem label={'工作室'} labelAlign={'top'}>
        <div style={{display: 'flex', gap: '8px'}}>
          <Select 
            v-model={data.value.studio_id} 
            options={studioOptions.value} 
            placeholder={'请选择工作室'} 
            clearable
            style={{flex: 1}}
          />
          <Button onClick={() => openAddStudio(refreshOptions)}>添加</Button>
        </div>
      </FormItem>
      <FormItem label={'演员'} labelAlign={'top'} help={'已选演员可在下方编辑角色名'}>
        <div style={{display: 'flex', gap: '8px'}}>
          <Select 
            v-model={data.value.actorIds} 
            options={actorOptions.value} 
            placeholder={'请选择演员'} 
            multiple
            clearable
            valueDisplay={() => {
              const selectedActors = data.value.actorIds.map(actor => {
                const option = actorOptions.value.find(opt => opt.value === actor.id);
                return option ? `${option.label} (${actor.role_name || '无角色'})` : '';
              }).filter(Boolean);
              return selectedActors.join(', ');
            }}
            style={{flex: 1}}
          />
          <Button onClick={() => openAddActor(refreshOptions)}>添加</Button>
        </div>
      </FormItem>
      {data.value.actorIds.length > 0 && (
        <FormItem label={'演员角色'} labelAlign={'top'}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {data.value.actorIds.map((actor, index) => {
              const option = actorOptions.value.find(opt => opt.value === actor.id);
              return (
                <div key={actor.id} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Tag theme="primary" style={{flexShrink: 0}}>{option?.label || actor.id}</Tag>
                  <Input 
                    value={actor.role_name || ''} 
                    placeholder="角色名" 
                    style={{flex: 1}}
                    onChange={(val) => {
                      if (data.value.actorIds[index]) {
                        data.value.actorIds[index].role_name = String(val);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </FormItem>
      )}
      <FormItem label={'标签'} labelAlign={'top'}>
        <div style={{display: 'flex', gap: '8px'}}>
          <Select 
            v-model={data.value.tagIds} 
            options={tagOptions.value} 
            placeholder={'请选择标签'} 
            multiple
            clearable
            style={{flex: 1}}
          />
          <Button onClick={() => openAddTag(refreshOptions)}>添加</Button>
        </div>
      </FormItem>
    </Form>,
  })
}