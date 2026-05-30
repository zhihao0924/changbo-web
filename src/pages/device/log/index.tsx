import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import React, { useCallback, useMemo, useRef } from "react"
import Services from "@/pages/device/services"
import moment from "moment"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { useIntl } from "umi"
import { createBackendLabelFormatter, formatBackendKeyedValue, isRecoveryLog } from "@/utils/i18n"
import "./index.less"

type Columns = API_PostLogList.List

const formatLogTime = (value: number | string) => {
  const numericValue = typeof value === "number" ? value : Number(value)
  return moment(Number.isFinite(numericValue) ? numericValue : value).format("YYYY-MM-DD HH:mm:ss")
}

const DeviceLog: React.FC = () => {
  const intl = useIntl()
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  )
  const formatBackendLabel = useMemo(() => createBackendLabelFormatter(t), [t])

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
        if (item && item.id) {
          enums.push({
            value: item.id,
            label: formatBackendLabel({
              key: item.device_type_alias_key,
              fallback: item.device_type_alias || item.device_type,
            }),
          })
        }
      })
      return enums
    }
    return []
  }, [formatBackendLabel])

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: t("app.device.log.logId", "Log ID"),
        dataIndex: "id",
        hideInSearch: true,
        hideInTable: true,
      },
      {
        title: t("app.device.log.deviceType", "Device Type"),
        align: "center",
        dataIndex: "device_type_id",
        valueType: "select",
        request: getDeviceTypes,
        render: (_, row) => {
          return formatBackendLabel({
            key: row.device_type_alias_key,
            fallback: row.device_type_alias || row.device_type,
          })
        },
        fieldProps: {
          showSearch: true,
        },
      },
      {
        title: t("app.device.log.deviceId", "Device ID"),
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
        title: t("app.device.log.deviceId", "Device ID"),
        align: "center",
        dataIndex: "device_name",
        hideInSearch: true,
      },
      {
        title: t("app.device.log.content", "Log"),
        align: "center",
        dataIndex: "content",
        hideInSearch: true,
        renderText: (_value, record) =>
          formatBackendKeyedValue(
            {
              key: record.event_code,
              params: record.event_params,
              fallback: record.content,
            },
            t,
          ) || record.content,
      },
      {
        title: t("app.device.log.time", "Time"),
        align: "center",
        dataIndex: "created_at",
        valueType: "dateTimeRange",
        render: (_, row: API_PostLogList.List) => {
          return [<div key="created_at">{formatLogTime(row.created_at)}</div>]
        },
        search: {
          transform: (value) => ({
            begin_at: value[0],
            end_at: value[1],
          }),
        },
      },
    ]
  }, [formatBackendLabel, getDeviceTypes, t])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        rowClassName={(record) => {
          return isRecoveryLog(record.event_code || record.content) ? "status-recovery" : "status-alarm"
        }}
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
