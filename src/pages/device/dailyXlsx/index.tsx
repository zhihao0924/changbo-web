import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useMemo, useRef } from "react"
import Services from "@/pages/device/services"
import moment from "moment"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { DownloadOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import type { API_PostDailyXlsxList } from "@/pages/device/services/typings/device"

type Columns = API_PostDailyXlsxList.List

const DailyXlsx: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params,
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postDeviceDailyXlsxList(data)

    if (res) {
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const downloadLoad = async (row: any) => {
    try {
      // 使用项目统一的API请求方式
      const response = await Services.api.postDeviceDailyXlsxDownload(
        { id: row.id },
        {
          responseType: "blob",
          showLoading: false,
          showToast: false,
        },
      )

      if (response) {
        const blob = new Blob([response])
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${row.file_name}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("下载失败:", error)
      // 可以添加错误提示
    }
  }
  useCallback(async (row) => {
    try {
      const res = await Services.api.postDeleterDailyXlsx(
        {
          id: row.id,
        },
        { showLoading: false, showToast: false },
      )
      if (res?.res) {
        actionRef.current?.reload()
      } else {
      }
    } catch (error) {
    } finally {
    }
  }, [])
  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: "日志ID",
        dataIndex: "id",
        hideInSearch: true,
        hideInTable: true,
      },
      {
        title: "文件名称",
        align: "center",
        dataIndex: "file_name",
        hideInSearch: true,
      },
      {
        title: "设备编号",
        align: "center",
        dataIndex: "id",
        hideInTable: true,
        valueType: "select",
        renderFormItem: () => <DeviceNameSelect />,
        search: {
          transform: (value) => ({
            device_id: value,
          }),
        },
      },
      {
        title: "日期",
        align: "center",
        dataIndex: "file_date",
        hideInSearch: true,
      },
      {
        title: "创建时间",
        align: "center",
        dataIndex: "created_at",
        valueType: "dateRange",
        render: (_, row: API_PostDailyXlsxList.List) => {
          return [
            <div key="created_at">{moment(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</div>,
          ]
        },
        hideInTable: true,
        search: {
          transform: (value) => ({
            begin_at: value[0] + " 00:00:00",
            end_at: value[1] + " 23:59:59",
          }),
        },
      },
      {
        title: "操作",
        hideInSearch: true,
        render: (_, row: Columns) => {
          return (
            <Space>
              <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadLoad(row)}>
                下载
              </Button>
              {/*<Button type="link" icon={<DeleteOutlined />} onClick={() => deleteRow(row)}>*/}
              {/*  删除*/}
              {/*</Button>*/}
            </Space>
          )
        },
      },
    ]
  }, [])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        request={getLists}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          size: "default",
        }}
        search={{
          labelWidth: 80,
        }}
        toolBarRender={() => []}
      />
    </PageContainer>
  )
}

export default DailyXlsx
