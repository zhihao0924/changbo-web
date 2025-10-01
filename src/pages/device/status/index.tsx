import {
  PlusOutlined
} from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Services from '@/pages/device/services'

type Columns = API_PostDeviceList.List


const DeviceStatus: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})

    if (res) {
      setDeviceTypes(res.res.list)
      return res.res.list
    }
    return []
  }, [])

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postDeviceList(data)

    if (res) {
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true
      })
    }
    return {}
  }, [])


  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: 'IP地址',
        align: 'center',
        dataIndex: 'ip',
        search: {
          transform: (value) => ({
            order_no: value
          })
        }
      },
      {
        key: 'name',
        title: '设备名称',
        align: 'center',
        dataIndex: 'name',
        hideInSearch: true
      },
      {
        title: '设备类型',
        align: 'center',
        dataIndex: 'type',
        valueType: 'select',
        request: getDeviceTypes,
        render: (_, record) => {
          const findItem = deviceTypes.find((val) => val.key == record.type)
          return findItem?.value
        }
      },
      {
        title: '安装位置',
        align: 'center',
        dataIndex: 'position',
        hideInSearch: true
      },
      {
        title: '设备状态',
        align: 'center',
        dataIndex: 'status_text',
        hideInSearch: true
      },
      {
        width: 160,
        title: '操作',
        align: 'center',
        valueType: 'option'
      }
    ]
  }, [deviceTypes, getDeviceTypes])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        request={getLists}
        rowKey="id"
        pagination={{
          showSizeChanger: true
        }}
        search={{
          labelWidth: 80
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
          >
            添加设备
          </Button>
        ]}
      />

    </PageContainer>
  )
}

export default DeviceStatus
