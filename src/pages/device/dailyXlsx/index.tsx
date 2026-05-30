import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useMemo, useRef } from "react"
import Services from "@/pages/device/services"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { DownloadOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import type { API_PostDailyXlsxList } from "@/pages/device/services/typings/device"
import { useIntl } from "umi"

type Columns = API_PostDailyXlsxList.List

const DailyXlsx: React.FC = () => {
  const intl = useIntl()
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  )

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
    if (!row || !row.id) {
      return
    }
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
        const blob = new Blob([response as unknown as BlobPart])
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
      // 可以添加错误提示
    }
  }
  useCallback(async (row) => {
    if (!row || !row.id) {
      return
    }
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
        title: t("app.device.backup.logId", "Log ID"),
        dataIndex: "id",
        hideInSearch: true,
        hideInTable: true,
      },
      {
        title: t("app.device.backup.fileName", "File Name"),
        align: "center",
        dataIndex: "file_name",
        hideInSearch: true,
      },
      {
        title: t("app.device.backup.deviceId", "Device ID"),
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
        title: t("app.device.backup.date", "Date"),
        align: "center",
        dataIndex: "file_date",
        hideInSearch: true,
      },
      {
        title: t("app.device.backup.date", "Date"),
        align: "center",
        dataIndex: "file_date_range",
        valueType: "dateRange",
        hideInTable: true,
        search: {
          transform: (value) => ({
            begin_at: value[0],
            end_at: value[1],
          }),
        },
      },
      {
        title: t("app.common.action", "Action"),
        hideInSearch: true,
        render: (_, row: Columns) => {
          return (
            <Space>
              <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadLoad(row)}>
                {t("app.common.download", "Download")}
              </Button>
              {/*<Button type="link" icon={<DeleteOutlined />} onClick={() => deleteRow(row)}>*/}
              {/*  删除*/}
              {/*</Button>*/}
            </Space>
          )
        },
      },
    ]
  }, [t])

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
