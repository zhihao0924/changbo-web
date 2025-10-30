import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useMemo, useRef } from "react"
import Services from "@/pages/device/services"
import moment from "moment"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { DownloadOutlined } from "@ant-design/icons"
import { Button } from "antd"

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
    console.log(row)
    const res = await Services.api.postDeviceDailyXlsxDownload({
      id: row.id,
    })
    if (res) {
      const url = window.URL.createObjectURL(new Blob([res.res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${row.device_name}-${row.file_date}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: "日志ID",
        dataIndex: "id",
        hideInSearch: true,
        hideInTable: true,
      },
      {
        title: "设备编号",
        align: "center",
        dataIndex: "device_name",
        hideInSearch: true,
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
            begin_at: value[0],
            end_at: value[1],
          }),
        },
      },
      {
        title: "操作",
        render: (_, row: Columns) => {
          return (
            <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadLoad(row)}>
              下载
            </Button>
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
