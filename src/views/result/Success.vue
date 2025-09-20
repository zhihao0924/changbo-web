<template>
  <a-card :bordered="false">
    <a-result status="success" :title="result.title" :sub-title="result.description">
      <template #extra>
        <a-button type="primary">"返回"</a-button>
        <a-button style="margin-left: 8px">"查看项目"</a-button>
        <a-button style="margin-left: 8px">"打印"</a-button>
      </template>
      <div class="content">
        <div style="font-size: 16px; color: rgba(0, 0, 0, 0.85); font-weight: 500; margin-bottom: 20px;">"操作记录"</div>
        <a-row style="margin-bottom: 16px">
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="6">
            <span style="color: rgba(0, 0, 0, 0.85)">"操作ID"：</span>
            20180724089
          </a-col>
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="6">
            <span style="color: rgba(0, 0, 0, 0.85)">"负责人"：</span>
            曲丽丽是谁？
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
            <span style="color: rgba(0, 0, 0, 0.85)">"操作时间"：</span>
            2016-12-12 ~ 2017-12-12
          </a-col>
        </a-row>
        <a-steps :current="1" :direction="isMobile && directionType.vertical || directionType.horizontal" progressDot>
          <a-step title="“步骤1&quot;">
            <span style="font-size: 14px" slot="title">"步骤1"</span>
            <template slot="description">
              <div style="fontSize: 12px; color: rgba(0, 0, 0, 0.45); position: relative; left: 42px;text-align: left;" slot="description" >
                <div style="margin: 8px 0 4px">
                  曲丽丽
                  <a-icon style="margin-left: 8px" type="dingding-o" />
                </div>
                <div>2016-12-12 12:32</div>
              </div>
            </template>
          </a-step>
          <a-step title="步骤2">
            <span style="font-size: 14px" slot="title">"步骤2"</span>
            <template slot="description">
              <div style="fontSize: 12px; color: rgba(0, 0, 0, 0.45); position: relative; left: 42px;text-align: left;" slot="description" >
                <div style="margin: 8px 0 4px">
                  周毛毛
                  <a-icon style="margin-left: 8px; color: #00A0E9" type="dingding-o" />
                </div>
                <div><a href="">催一下</a></div>
              </div>
            </template>
          </a-step>
          <a-step title="步骤3">
            <span style="font-size: 14px" slot="title">"步骤3"</span>
          </a-step>
          <a-step title="步骤4">
            <span style="font-size: 14px" slot="title">"步骤4"</span>
          </a-step>
        </a-steps>
      </div>
    </a-result>
  </a-card>
</template>

<script>
import { baseMixin } from '@/store/app-mixin'

const directionType = {
  horizontal: 'horizontal',
  vertical: 'vertical'
}

export default {
  name: 'Success',
  mixins: [baseMixin],
  data () {
    this.directionType = directionType
    return {
      // title: "成功页面",
      // description: "操作成功"
    }
  },
  computed: {
    result () {
      return {
      title: '成功页面',
      description: '操作成功'
      }
    }
  }
}
</script>
