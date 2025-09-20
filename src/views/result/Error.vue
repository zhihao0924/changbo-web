<template>
  <a-card :bordered="false">
    <a-result status="error" :title="result.title" :sub-title="result.description">
      <template #extra>
        <a-button type="primary" >"返回"</a-button>
      </template>
      <div class="desc">
        <div style="font-size: 16px; color: rgba(0, 0, 0, 0.85); font-weight: 500; margin-bottom: 16px">
          "错误提示"
        </div>
        <div style="margin-bottom: 16px">
          <a-icon type="close-circle-o" style="color: #f5222d; margin-right: 8px"/>
          "请检查您的网络连接"
          <a style="margin-left: 16px">"重试" <a-icon type="right" /></a>
        </div>
        <div>
          <a-icon type="close-circle-o" style="color: #f5222d; margin-right: 8px"/>
          "或联系管理员"
          <a style="margin-left: 16px">"联系管理员" <a-icon type="right" /></a>
        </div>
      </div>
    </a-result>
  </a-card>
</template>

<script>

export default {
  name: 'Error',
  computed: {
    result () {
      return {
      title: '错误页面',
      description: '页面加载失败'
      }
    }
  }
}
</script>
