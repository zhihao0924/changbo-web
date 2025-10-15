import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useMemo, useRef, useState } from "react"
import Services from "@/pages/device/services"
import moment from "moment"
import DeviceNameSelect from "@/components/DeviceNameSelect"

type Columns = API_PostDeviceList.List

const DeviceLog: React.FC = () => {
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
      const enums: any[] = []
      res.res.list.forEach((item) => {
        enums.push({
          value: item.id,
          label: item.device_type_alias
            ? item.device_type_alias
            : `${item.device_type_group}[${item.device_type}]`,
        })
      })
      return enums
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
        dataIndex: "device_type_id",
        valueType: "select",
        request: getDeviceTypes,
        render: (_, row) => {
          return row.device_type_alias
        },
        fieldProps: {
          showSearch: true,
        },
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
        title: "设备编号",
        align: "center",
        dataIndex: "device_name",
        hideInSearch: true,
      },
      {
        title: "日志",
        align: "center",
        dataIndex: "content",
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
