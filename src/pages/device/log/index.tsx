import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Services from "@/pages/device/services"
import moment from "moment"
import { Input, InputNumber } from "antd"

type Columns = API_PostDeviceList.List

const DeviceLog: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params,
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postDeviceLogList(data)

    if (res) {
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})

    if (res) {
      setDeviceTypes(res.res.list)
      return res.res.list
    }
    return []
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
        title: "设备类型",
        align: "center",
        dataIndex: "device_type_name",
        valueType: "select",
        request: async () => {
          const res = await getDeviceTypes()
          return res.map((item) => {
            return {
              value: item.key,
              label: item.value,
            }
          })
        },
        search: {
          transform: (value) => ({
            device_type: value,
          }),
        },
      },
      {
        title: "设备名称",
        align: "center",
        dataIndex: "id",
        hideInTable: true,
        valueType: "select",
        renderFormItem: (text, props) => <InputNumber />,
      },
      {
        title: "设备名称",
        align: "center",
        dataIndex: "device_name",
        hideInSearch: true,
      },
      {
        title: "设备名称",
        align: "center",
        dataIndex: "device_name",
        hideInSearch: true,
      },
      {
        title: "时间",
        align: "center",
        dataIndex: "created_at",
        valueType: "dateTimeRange",
        render: (_, row: API_PostLogList.List) => {
          return [
            <div key="created_at">{moment(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</div>,
          ]
        },
        search: {
          transform: (value) => ({
            begin_at: value[0],
            end_at: value[1],
          }),
        },
      },
    ]
  }, [getDeviceTypes])

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

export default DeviceLog
