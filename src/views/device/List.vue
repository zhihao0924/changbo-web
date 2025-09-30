<template>
  <page-header-wrapper>
    <a-list
      rowKey="id"
      :grid="{gutter: 24, lg: 4, md: 3, sm: 2, xs: 1}"
      :dataSource="dataSource"
      class="card-list"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        <a-card :title="item.name">
          <p>状态：{{ item.status_text ?? '-' }}</p>
          <p>电压：{{ item.voltage ?? '-' }}V</p>
          <p>电流：{{ item.current ?? '-' }}A</p>
          <p>温度：{{ item.temperature ?? '-' }}°C</p>
          <p>
            <a-progress :percent="100" :steps="5" size="small" stroke-color="#52c41a" />
          </p>
          <router-link to="/device/detail" style="color: #1890ff;">查看详情</router-link>
        </a-card>
      </a-list-item>
    </a-list>
  </page-header-wrapper>
</template>

<script>
import { postDeviceList } from '@/api/manage'
import Trend from '@/components/Trend/Trend.vue'

export default {
  name: 'CardList',
  components: { Trend },
  data () {
    return {
      dataSource: [],
      timer: null
    }
  },
  methods: {
    async queryList () {
      const res = await postDeviceList({ pageNo: 1, pageSize: 100 })
      this.dataSource = res.data || []
    }
  },
  created () {
    this.queryList().catch(() => {
      if (this.timer) {
        clearInterval(this.timer)
      }
    })
    this.timer = setInterval(() => {
      this.queryList().catch(() => {
        if (this.timer) {
          clearInterval(this.timer)
        }
      })
    }, 500)
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/components/index.less";

.card-list {
  :deep(.ant-card-body:hover) {
    .ant-card-meta-title > a {
      color: @primary-color;
    }
  }

  :deep(.ant-card-meta-title) {
    margin-bottom: 12px;

    & > a {
      display: inline-block;
      max-width: 100%;
      color: rgba(0, 0, 0, .85);
    }
  }

  :deep(.meta-content) {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    height: 64px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    margin-bottom: 1em;
  }
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}

.ant-card-actions {
  background: #f7f9fa;

  li {
    float: left;
    text-align: center;
    margin: 12px 0;
    color: rgba(0, 0, 0, 0.45);
    width: 50%;

    &:not(:last-child) {
      border-right: 1px solid #e8e8e8;
    }

    a {
      color: rgba(0, 0, 0, .45);
      line-height: 22px;
      display: inline-block;
      width: 100%;

      &:hover {
        color: @primary-color;
      }
    }
  }
}

.new-btn {
  background-color: #fff;
  border-radius: 2px;
  width: 100%;
  height: 188px;
}

</style>
