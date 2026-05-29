import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SyncOutlined,
  MoreOutlined,
} from "@ant-design/icons"
import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  TreeSelect,
} from "antd"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Services from "@/pages/device/services"
import type { API_PostDeviceList } from "@/pages/device/services/typings/device"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { useIntl } from "umi"
import {
  createBackendLabelFormatter,
  isAmplifierDeviceGroup,
  isNearEndDeviceGroup,
  isRemoteDeviceGroup,
  isRfSettingDeviceGroup,
  isSplitterDeviceGroup,
} from "@/utils/i18n"
import "./index.less"

type Columns = API_PostDeviceList.List

type CreateFormValues = {
  id: number
  name: string
  ip: string
  position: string
  device_type_id: number
  is_maintaining: boolean
}

type CreateSettingFormValues = {
  uplink_power: number | null | string
  uplink_power_min: number
  uplink_power_max: number
  uplink_gain: number | null | string
  uplink_gain_min: number
  uplink_gain_max: number
  downlink_power: number | null | string
  downlink_power_min: number
  downlink_power_max: number
  downlink_gain: number | null | string
  downlink_gain_min: number
  downlink_gain_max: number
  same_frequency_forward_switch: number | null | string
  downlink_switch: number | null | string
  uplink_switch: number | null | string
  pa4_alarm_switch: number | null | string
}

type DeviceTypeOption = {
  value: number
  label: string
  group: string
}

type DeviceTypeTreeNode = {
  title: string
  value: string | number
  selectable?: boolean
  disabled?: boolean
  children?: DeviceTypeTreeNode[]
}

// 设备类型组常量。接口可能按当前语言返回中文或英文分组，value 必须使用接口原值。
const DEVICE_GROUP_DEFINITIONS = [
  {
    values: ["发射合路器", "Transmitter Mixer"],
    messageId: "app.device.index.group.transmitterMixer",
    defaultMessage: "Transmitter Mixer",
  },
  {
    values: ["接收分路器", "Receiver Splitter"],
    messageId: "app.device.index.group.receiverSplitter",
    defaultMessage: "Receiver Splitter",
  },
  {
    values: ["带通双工器", "Bandpass Duplexer"],
    messageId: "app.device.index.group.bandpassDuplexer",
    defaultMessage: "Bandpass Duplexer",
  },
  {
    values: ["上行信号剥离器", "Uplink Signal Stripper"],
    messageId: "app.device.index.group.uplinkStripper",
    defaultMessage: "Uplink Signal Stripper",
  },
  {
    values: ["下行信号剥离器", "Downlink Signal Stripper"],
    messageId: "app.device.index.group.downlinkStripper",
    defaultMessage: "Downlink Signal Stripper",
  },
  {
    values: ["数字近端机", "Digital Near-end Unit"],
    messageId: "app.device.index.group.digitalNearEnd",
    defaultMessage: "Digital Near-end Unit",
  },
  {
    values: ["数字远端机", "Digital Remote Unit"],
    messageId: "app.device.index.group.digitalRemote",
    defaultMessage: "Digital Remote Unit",
  },
  {
    values: ["模拟近端机", "Analog Near-end Unit"],
    messageId: "app.device.index.group.analogNearEnd",
    defaultMessage: "Analog Near-end Unit",
  },
  {
    values: ["模拟远端机", "Analog Remote Unit"],
    messageId: "app.device.index.group.analogRemote",
    defaultMessage: "Analog Remote Unit",
  },
  {
    values: ["干线放大器", "Trunk Amplifier"],
    messageId: "app.device.index.group.trunkAmplifier",
    defaultMessage: "Trunk Amplifier",
  },
  {
    values: ["功率采集网关", "Power Collection Gateway"],
    messageId: "app.device.index.group.powerCollectionGateway",
    defaultMessage: "Power Collection Gateway",
  },
] as const

const DEVICE_GROUP_ORDER = DEVICE_GROUP_DEFINITIONS.reduce<Record<string, number>>(
  (acc, group, index) => {
    group.values.forEach((value) => {
      acc[value] = index
    })
    return acc
  },
  {},
)

// 配置类型映射
const CONFIG_TYPE_MAP = {
  uplink_power: ["app.device.index.uplinkPowerShort", "Uplink Power"],
  uplink_gain: ["app.device.index.uplinkGainShort", "Uplink Gain"],
  downlink_power: ["app.device.index.downlinkPowerShort", "Downlink Power"],
  downlink_gain: ["app.device.index.downlinkGainShort", "Downlink Gain"],
  same_frequency_forward_switch: [
    "app.device.index.sameFrequencyForward",
    "Same Frequency Forward",
  ],
  downlink_switch: ["app.device.index.downlinkSwitch", "Downlink Switch"],
  uplink_switch: ["app.device.index.uplinkSwitch", "Uplink Switch"],
  pa4_alarm_switch: ["app.device.index.pa4AlarmSwitch", "PA4 Alarm Switch"],
} as Record<string, [string, string]>

const SWITCH_ENABLED_VALUE = "1"
const SWITCH_DISABLED_VALUE = "-1"

const getSwitchFormValue = (
  isSet?: boolean,
  value?: number | string | boolean | null,
): string | null => {
  if (!isSet) {
    return null
  }
  return value === 1 || value === "1" || value === true
    ? SWITCH_ENABLED_VALUE
    : SWITCH_DISABLED_VALUE
}

const DeviceIndex: React.FC = () => {
  const intl = useIntl()
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [settingModalVisible, setSettingModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<Columns | null>(null)
  const [form] = Form.useForm<CreateFormValues>()
  const [rfConfigForm] = Form.useForm<CreateSettingFormValues>()

  const [allDeviceTypes, setAllDeviceTypes] = useState<DeviceTypeOption[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([])
  const [configRangeMap, setConfigRangeMap] = useState<
    Record<string, { min: number; max: number; unit: string }>
  >({})

  // 初始化设备类型数据
  const [deviceTypesLoading, setDeviceTypesLoading] = useState(false)
  const t = useCallback(
    (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage }),
    [intl],
  )
  const formatBackendLabel = useMemo(() => createBackendLabelFormatter(t), [t])
  const deviceGroupLabelMap = useMemo(
    () =>
      DEVICE_GROUP_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
        const label = t(item.messageId, item.defaultMessage)
        item.values.forEach((value) => {
          acc[value] = label
        })
        return acc
      }, {}),
    [t],
  )
  const deviceGroupOptions = useMemo(() => {
    const groups =
      allDeviceTypes.length > 0
        ? allDeviceTypes
            .map((item) => item.group)
            .filter((group): group is string => Boolean(group))
        : DEVICE_GROUP_DEFINITIONS.map((group) => group.values[0])

    return Array.from(new Set(groups))
      .sort((prev, next) => {
        const prevOrder = DEVICE_GROUP_ORDER[prev] ?? Number.MAX_SAFE_INTEGER
        const nextOrder = DEVICE_GROUP_ORDER[next] ?? Number.MAX_SAFE_INTEGER

        if (prevOrder !== nextOrder) {
          return prevOrder - nextOrder
        }
        return prev.localeCompare(next)
      })
      .map((value) => ({
        value,
        label: deviceGroupLabelMap[value] || formatBackendLabel(value),
      }))
  }, [allDeviceTypes, deviceGroupLabelMap, formatBackendLabel])
  const deviceTypeTreeData = useMemo<DeviceTypeTreeNode[]>(() => {
    const groupedTypes = allDeviceTypes.reduce<Record<string, DeviceTypeOption[]>>((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    }, {})

    return Object.entries(groupedTypes).map(([group, types]) => ({
      title: deviceGroupLabelMap[group] || formatBackendLabel(group),
      value: `group-${group}`,
      selectable: false,
      disabled: true,
      children: types.map((type) => ({
        title: type.label,
        value: type.value,
      })),
    }))
  }, [allDeviceTypes, deviceGroupLabelMap, formatBackendLabel])

  const getDeviceTypes = useCallback(async () => {
    // 如果已经有数据，直接返回
    if (allDeviceTypes.length > 0) {
      return allDeviceTypes
    }

    // 如果没有数据，重新获取
    setDeviceTypesLoading(true)
    try {
      const res = await Services.api.postDeviceTypes({})
      if (res?.res?.list) {
        const formattedTypes = res.res.list
          .filter((item) => item != null && item.id != null)
          .map((item) => ({
            value: item.id,
            label: formatBackendLabel(item.device_type_alias || item.device_type),
            group: item.device_type_group,
          }))
        setAllDeviceTypes(formattedTypes)
        return formattedTypes
      }
    } catch (error) {
      return []
    } finally {
      setDeviceTypesLoading(false)
    }
    return []
  }, [allDeviceTypes, formatBackendLabel])

  // 初始化设备类型数据（首次加载）
  useEffect(() => {
    const initDeviceTypes = async () => {
      try {
        const res = await Services.api.postDeviceTypes({})
        if (res?.res?.list) {
          const formattedTypes = res.res.list
            .filter((item) => item != null && item.id != null)
            .map((item) => ({
              value: item.id,
              label: formatBackendLabel(item.device_type_alias || item.device_type),
              group: item.device_type_group,
            }))
          setAllDeviceTypes(formattedTypes)
        }
      } catch (error) {}
    }
    initDeviceTypes()
  }, [formatBackendLabel])

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params,
    }
    // 如果存在is_maintaining 将is_maintaining 转成int
    if (data.is_maintaining) {
      data.is_maintaining = data.is_maintaining ? 1 : 0
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postDeviceList(data)

    if (res) {
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const openModal = useCallback(
    (record: Columns | null = null) => {
      setCurrentDevice(record)
      if (record) {
        setDeviceTypes(allDeviceTypes.filter((item) => item.group == record.device_type_group))
        form.setFieldsValue({
          ...record,
        })
      } else {
        form.resetFields()
        setDeviceTypes([])
      }
      setModalVisible(true)
    },
    [form, allDeviceTypes],
  )

  const openSettingModal = useCallback(
    (record: Columns | null = null) => {
      setCurrentDevice(record)

      // 然后获取数据并设置表单值
      Services.api
        .postRFConfig({
          device_id: record?.id,
        })
        .then((res) => {
          // 从API响应中提取范围配置
          const newConfigRangeMap = {
            uplink_power: {
              min: res.res.uplink_power_min,
              max: res.res.uplink_power_max,
              unit: "dBm",
            },
            uplink_gain: {
              min: res.res.uplink_gain_min,
              max: res.res.uplink_gain_max,
              unit: "dB",
            },
            downlink_power: {
              min: res.res.downlink_power_min,
              max: res.res.downlink_power_max,
              unit: "dBm",
            },
            downlink_gain: {
              min: res.res.downlink_gain_min,
              max: res.res.downlink_gain_max,
              unit: "dB",
            },
          }
          setConfigRangeMap(newConfigRangeMap)

          // 设置表单值
          const { res: configRes } = res
          rfConfigForm.setFieldsValue({
            downlink_gain: configRes.is_set_downlink_gain ? configRes.downlink_gain : "——",
            uplink_gain: configRes.is_set_uplink_gain ? configRes.uplink_gain : "——",
            downlink_power: configRes.is_set_downlink_power ? configRes.downlink_power : "——",
            uplink_power: configRes.is_set_uplink_power ? configRes.uplink_power : "——",
            same_frequency_forward_switch: getSwitchFormValue(
              configRes.is_set_same_frequency_forward_switch,
              configRes.same_frequency_forward_switch,
            ),
            downlink_switch: getSwitchFormValue(
              configRes.is_set_downlink_switch,
              configRes.downlink_switch,
            ),
            uplink_switch: getSwitchFormValue(
              configRes.is_set_uplink_switch,
              configRes.uplink_switch,
            ),
            pa4_alarm_switch: getSwitchFormValue(
              configRes.is_set_pa4_alarm_switch,
              configRes.pa4_alarm_switch,
            ),
          })
        })
        .then(() => {
          // 先打开模态框，确保表单已经挂载
          setSettingModalVisible(true)
        })
        .catch(() => {
          message.error(
            t(
              "app.device.index.fetchConfigFailed",
              "Failed to load device configuration. Please try again later.",
            ),
          )
        })
    },
    [rfConfigForm, t],
  )

  const syncPanel = useCallback(async () => {
    try {
      return await Services.api.postDeviceSyncPanel({}).then((ret) => {
        message.success(
          t(
            "app.device.index.syncSummary",
            `Panel sync succeeded: ${ret.res.success_count}, failed: ${ret.res.fail_count}`,
          )
            .replace("${success}", String(ret.res.success_count))
            .replace("${failed}", String(ret.res.fail_count)),
          2,
          actionRef.current?.reload,
        )
      })
    } catch (error) {
      message.error(t("app.device.index.syncFailed", "Panel sync failed"))
      throw error
    } finally {
    }
  }, [t])

  const handleCancel = useCallback(() => {
    setModalVisible(false)
    form.resetFields()
  }, [form])

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const res = await Services.api.postDeviceSave(values)
      message.success(
        res?.msg ||
          (currentDevice
            ? t("app.device.index.updateSuccess", "Device updated successfully")
            : t("app.device.index.createSuccess", "Device created successfully")),
      )
      setModalVisible(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
    } finally {
      setSubmitLoading(false)
    }
  }, [actionRef, currentDevice, form, t])

  const handleToggleMaintaining = useCallback(
    async (record: Columns) => {
      if (!record || !record.id) {
        return
      }
      try {
        const data = {
          id: record.id,
          is_maintaining: !record?.is_maintaining,
        }
        const res = await Services.api.postToggleMaintaining(data)
        message.success(
          res?.msg || t("app.device.index.updateSuccess", "Device updated successfully"),
        )
        actionRef.current?.reload()
      } catch (error: any) {
        if (error?.errorFields) {
          return
        }
      }
    },
    [t],
  )

  const handleDelDevice = useCallback(
    async (record: Columns) => {
      if (!record || !record.id) {
        return
      }
      Modal.confirm({
        title: t("app.device.index.deleteConfirm", "Confirm deleting ${group}(${name})?")
          .replace("${group}", formatBackendLabel(record.device_type_group))
          .replace("${name}", record.name),
        onOk: async () => {
          try {
            const data = {
              device_id: record.id,
            }
            const res = await Services.api.postDeleteDevice(data)
            message.success(
              res?.msg || t("app.device.index.updateSuccess", "Device updated successfully"),
            )
            actionRef.current?.reload()
          } catch (error: any) {
            if (error?.errorFields) {
              return
            }
          }
        },
      })
    },
    [formatBackendLabel, t],
  )

  const handleMoveDevice = useCallback(
    async (record: Columns, direction: "up" | "down") => {
      if (!record || !record.id) {
        return
      }
      try {
        const res = await Services.api.postDeviceMove({
          device_id: record.id,
          direction,
        })
        message.success(res?.msg || t("app.device.index.moveSuccess", "Device moved successfully"))
        actionRef.current?.reload()
      } catch (error: any) {
        if (error?.errorFields) {
          return
        }
      }
    },
    [t],
  )

  // 配置类型对应的中文标签
  const getConfigLabel = useCallback(
    (configType: string): string => {
      const configLabel = CONFIG_TYPE_MAP[configType]
      return configLabel ? t(configLabel[0], configLabel[1]) : configType
    },
    [t],
  )

  // 统一的参数配置保存函数
  const saveRFConfig = useCallback(
    async (configType: string) => {
      if (!currentDevice?.id) {
        message.error(
          t(
            "app.device.index.invalidDevice",
            "Invalid device information, unable to save configuration",
          ),
        )
        return
      }

      const fieldValue = rfConfigForm.getFieldValue(configType)
      if (fieldValue === undefined || fieldValue === null) {
        message.error(
          `${t("app.common.pleaseEnter", "Please enter")} ${getConfigLabel(configType)}`,
        )
        return
      }

      // 检查数值范围（从API获取的范围）
      const configRange = configRangeMap[configType]
      if (configRange) {
        if (fieldValue < configRange.min || fieldValue > configRange.max) {
          message.error(
            `${getConfigLabel(configType)} ${t("app.device.index.rangeLimit", "must be within")} ${
              configRange.min
            }~${configRange.max}${configRange.unit}`,
          )
          return
        }
      }

      try {
        const res = await Services.api.postRFConfigSave({
          device_id: currentDevice.id,
          current_val: Number(fieldValue),
          rf_config_type: configType,
        })
        message.success(
          res?.msg ||
            `${getConfigLabel(configType)} ${t(
              "app.device.index.configSaved",
              "saved successfully",
            )}`,
        )
      } catch (error) {
        message.error(
          `${getConfigLabel(configType)} ${t(
            "app.device.index.configSaveFailed",
            "failed to save",
          )}`,
        )
      }
    },
    [currentDevice, getConfigLabel, rfConfigForm, configRangeMap, t],
  )

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: t("app.device.index.ip", "IP Address"),
        align: "center",
        dataIndex: "ip",
        fixed: "left",
        key: "ip",
        // search: {
        //   transform: (value) => ({
        //     ip: value,
        //   }),
        // },
        hideInSearch: true,
      },
      {
        key: "name",
        title: t("app.device.index.deviceId", "Device ID"),
        align: "center",
        dataIndex: "name",
        width: 200,
        valueType: "select",
        renderFormItem: () => <DeviceNameSelect />,
        search: {
          transform: (value) => ({
            id_list: value,
          }),
        },
      },
      {
        key: "device_type_group",
        title: t("app.device.index.deviceGroup", "Device Group"),
        align: "center",
        dataIndex: "device_type_group",
        hideInSearch: true,
        renderText: (value) => formatBackendLabel(value),
        width: 200,
      },
      {
        title: t("app.device.index.deviceType", "Device Type"),
        align: "center",
        dataIndex: "device_type_id",
        key: "device_type_id",
        valueType: "select",
        request: getDeviceTypes,
        renderFormItem: () => (
          <TreeSelect
            allowClear
            showSearch
            treeDefaultExpandAll
            treeData={deviceTypeTreeData}
            placeholder={t("app.device.index.deviceType.required", "Please select a device type")}
            filterTreeNode={(input, treeNode) =>
              String(treeNode.title || "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        ),
        width: 200,
      },
      {
        title: t("app.device.index.position", "Installation Position"),
        align: "center",
        dataIndex: "position",
        key: "position",
        hideInSearch: true,
        width: 200,
      },
      {
        title: t("app.device.index.maintainingStatus", "Maintenance Status"),
        dataIndex: "is_maintaining",
        key: "is_maintaining",
        valueType: "select",
        hideInTable: true,
        valueEnum: {
          1: { text: t("app.device.index.maintaining", "Maintaining"), status: "Processing" },
        },
        fieldProps: {
          placeholder: t(
            "app.device.index.selectMaintainingStatus",
            "Please select a maintenance status",
          ),
          allowClear: true,
        },
      },
      {
        title: t("app.device.index.deviceStatus", "Device Status"),
        align: "center",
        dataIndex: "status_text",
        key: "status_text",
        hideInSearch: true,
        renderText: (value) => formatBackendLabel(value),
        width: 200,
      },
      {
        key: "panel_info_panel_type",
        title: t("app.device.index.panelType", "Panel Type"),
        align: "center",
        dataIndex: ["panel_info", "panel_type"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_panel_id",
        title: t("app.device.index.panelId", "Panel ID"),
        align: "center",
        dataIndex: ["panel_info", "panel_id"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_name",
        title: t("app.device.index.name", "Name"),
        align: "center",
        dataIndex: ["panel_info", "name"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_model",
        title: t("app.device.index.model", "Model"),
        align: "center",
        dataIndex: ["panel_info", "model"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_serial_number",
        title: t("app.device.index.code", "Code"),
        align: "center",
        dataIndex: ["panel_info", "serial_number"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_area",
        title: t("app.device.index.area", "Area"),
        align: "center",
        dataIndex: ["panel_info", "area"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_sn",
        title: t("app.device.index.serialNumber", "Serial Number"),
        align: "center",
        dataIndex: ["panel_info", "sn"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_physical_sn",
        title: t("app.device.index.physicalSerialNumber", "Physical Serial Number"),
        align: "center",
        dataIndex: ["panel_info", "physical_sn"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_id",
        title: t("app.device.index.firmwareId", "Firmware ID"),
        align: "center",
        dataIndex: ["panel_info", "firmware_id"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_upstream_band",
        title: t("app.device.index.upstreamBand", "Upstream Band"),
        align: "center",
        dataIndex: ["panel_info", "upstream_band"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_downstream_band",
        title: t("app.device.index.downstreamBand", "Downstream Band"),
        align: "center",
        dataIndex: ["panel_info", "downstream_band"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_band_code",
        title: t("app.device.index.bandCode", "Band Code"),
        align: "center",
        dataIndex: ["panel_info", "band_code"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_power",
        title: t("app.device.index.power", "Power (W)"),
        align: "center",
        dataIndex: ["panel_info", "power"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_uplink_power",
        title: t("app.device.index.uplinkPower", "Uplink Power (dBm)"),
        align: "center",
        dataIndex: ["panel_info", "uplink_power"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_downlink_power",
        title: t("app.device.index.downlinkPower", "Downlink Power (dBm)"),
        align: "center",
        dataIndex: ["panel_info", "downlink_power"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_uplink_gain",
        title: t("app.device.index.uplinkGain", "Uplink Gain (dB)"),
        align: "center",
        dataIndex: ["panel_info", "uplink_gain"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_downlink_gain",
        title: t("app.device.index.downlinkGain", "Downlink Gain (dB)"),
        align: "center",
        dataIndex: ["panel_info", "downlink_gain"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_type",
        title: t("app.device.index.firmwareType", "Firmware Type"),
        align: "center",
        dataIndex: ["panel_info", "firmware_type"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_version",
        title: t("app.device.index.firmwareVersion", "Firmware Version"),
        align: "center",
        dataIndex: ["panel_info", "firmware_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_internal_version",
        title: t("app.device.index.internalVersion", "Internal Version"),
        align: "center",
        dataIndex: ["panel_info", "internal_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_bootloader_version",
        title: t("app.device.index.bootloaderVersion", "Bootloader Version"),
        align: "center",
        dataIndex: ["panel_info", "bootloader_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_netmask",
        title: t("app.device.index.netmask", "Netmask"),
        align: "center",
        dataIndex: ["panel_info", "netmask"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_wifi_mac",
        title: t("app.device.index.wifiMac", "WiFi MAC Address"),
        align: "center",
        dataIndex: ["panel_info", "wifi_mac"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_ipv4",
        title: t("app.device.index.ipv4", "IPv4 Address"),
        align: "center",
        dataIndex: ["panel_info", "ipv4"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_ipv6",
        title: t("app.device.index.ipv6", "IPv6 Address"),
        align: "center",
        dataIndex: ["panel_info", "ipv6"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_last_program_time",
        title: t("app.device.index.lastProgramTime", "Last Program Time"),
        align: "center",
        dataIndex: ["panel_info", "last_program_time"],
        hideInSearch: true,
        width: 200,
      },
      {
        width: 400,
        title: t("app.common.action", "Action"),
        align: "center",
        valueType: "option",
        fixed: "right",
        render: (_, record) => {
          // 检查记录是否存在
          if (!record || !record.id) {
            return null
          }

          // 需要显示设置按钮的设备类型组
          const showSettingButton = isRfSettingDeviceGroup(record.device_type_group)

          const actionItems = [
            ...(showSettingButton
              ? [
                  {
                    key: "setting",
                    label: t("app.common.settings", "Settings"),
                    icon: <SettingOutlined />,
                    onClick: () => openSettingModal(record),
                  },
                ]
              : []),
            {
              key: "moveUp",
              label: t("app.common.moveUp", "Move Up"),
              icon: <ArrowUpOutlined />,
              onClick: () => handleMoveDevice(record, "up"),
            },
            {
              key: "moveDown",
              label: t("app.common.moveDown", "Move Down"),
              icon: <ArrowDownOutlined />,
              onClick: () => handleMoveDevice(record, "down"),
            },
          ]

          return [
            <div key="actions">
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => openModal(record)}
              >
                {t("app.common.edit", "Edit")}
              </Button>
              <Button
                key="delete"
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => handleDelDevice(record)}
              >
                {t("app.common.delete", "Delete")}
              </Button>
              <Button
                key="toggle"
                type="link"
                icon={record?.is_maintaining ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                onClick={() => handleToggleMaintaining(record)}
              >
                {record?.is_maintaining
                  ? t("app.device.index.endMaintenance", "End Maintenance")
                  : t("app.device.index.startMaintenance", "Start Maintenance")}
              </Button>
              <Dropdown key="dropdown" menu={{ items: actionItems }} trigger={["click"]}>
                <Button type="link" icon={<MoreOutlined />}>
                  {t("app.common.more", "More")}
                </Button>
              </Dropdown>
            </div>,
          ]
        },
      },
    ]
  }, [
    deviceTypeTreeData,
    getDeviceTypes,
    handleDelDevice,
    handleMoveDevice,
    handleToggleMaintaining,
    formatBackendLabel,
    openModal,
    openSettingModal,
    t,
  ])

  // 根据设备状态返回行样式对象
  const getRowClassName = useCallback((record: Columns) => {
    // 检查记录是否存在，避免 null 错误
    if (!record || !record.id) {
      return ""
    }

    let className = ""
    // 根据在线状态设置背景色
    if (record.is_online) {
      className = "device-online-row"
    } else {
      className = "device-offline-row"
    }
    return className.trim()
  }, [])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        request={getLists}
        rowKey="id"
        rowClassName={getRowClassName}
        pagination={{
          showSizeChanger: true,
          size: "default",
        }}
        search={{
          labelWidth: 80,
        }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => openModal()}>
            {t("app.device.index.addDevice", "Add Device")}
          </Button>,
          <Button key="button" icon={<SyncOutlined />} type="primary" onClick={() => syncPanel()}>
            {t("app.device.index.syncDeviceInfo", "Sync Device Info")}
          </Button>,
        ]}
        scroll={{ x: 0 }}
        // 列设置配置
        columnsState={{
          // persistenceKey: "deviceIndexColumns", // 本地存储的key
          // persistenceType: "localStorage", // 存储方式
          defaultValue: {
            device_type_group: { show: true },
            device_type_id: { show: true },
            position: { show: true },
            status_text: { show: true },
            panel_info_panel_type: { show: false },
            panel_info_panel_id: { show: false },
            panel_info_name: { show: false },
            panel_info_model: { show: false },
            panel_info_serial_number: { show: false },
            panel_info_area: { show: false },
            panel_info_sn: { show: false },
            panel_info_physical_sn: { show: false },
            panel_info_firmware_id: { show: false },
            panel_info_upstream_band: { show: false },
            panel_info_downstream_band: { show: false },
            panel_info_band_code: { show: false },
            panel_info_power: { show: false },
            panel_info_uplink_power: { show: false },
            panel_info_downlink_power: { show: false },
            panel_info_uplink_gain: { show: false },
            panel_info_downlink_gain: { show: false },
            panel_info_firmware_type: { show: false },
            panel_info_firmware_version: { show: false },
            panel_info_internal_version: { show: false },
            panel_info_bootloader_version: { show: false },
            panel_info_netmask: { show: false },
            panel_info_wifi_mac: { show: false },
            panel_info_ipv4: { show: false },
            panel_info_ipv6: { show: false },
            panel_info_last_program_time: { show: false },
          },
        }}
      />

      <Modal
        title={
          currentDevice
            ? t("app.device.index.editDevice", "Edit Device")
            : t("app.device.index.addDevice", "Add Device")
        }
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label={t("app.device.index.deviceId", "Device ID")}
            rules={[
              {
                required: true,
                message: t("app.device.index.deviceId.required", "Please enter the device ID"),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ip"
            label={t("app.device.index.ip", "IP Address")}
            rules={[
              {
                required: true,
                message: t("app.device.index.ip.required", "Please enter the IP address"),
              },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: t("app.device.index.ip.invalid", "Please enter a valid IP address"),
              },
            ]}
          >
            <Input
              onChange={(e) => {
                const ip = e.target.value
                if (
                  /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)
                ) {
                  const ipParts = ip.split(".")
                  form.setFieldsValue({ name: ipParts[3] })
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="position"
            label={t("app.device.index.position", "Installation Position")}
            rules={[
              {
                required: true,
                message: t(
                  "app.device.index.position.required",
                  "Please enter the installation position",
                ),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="device_type_group"
            label={t("app.device.index.deviceGroup", "Device Group")}
            rules={[
              {
                required: true,
                message: t("app.device.index.deviceGroup.required", "Please select a device group"),
              },
            ]}
          >
            <Select
              loading={deviceTypesLoading}
              disabled={deviceTypesLoading || allDeviceTypes.length === 0}
              options={deviceGroupOptions}
              onChange={(item) => {
                form.setFieldValue("device_type_id", undefined)
                setDeviceTypes(allDeviceTypes.filter((types) => types.group == item))
              }}
            />
          </Form.Item>
          <Form.Item
            name="device_type_id"
            label={t("app.device.index.deviceType", "Device Type")}
            rules={[
              {
                required: true,
                message: t("app.device.index.deviceType.required", "Please select a device type"),
              },
            ]}
          >
            <Select options={deviceTypes} />
          </Form.Item>
          <Form.Item
            name="is_maintaining"
            label={t("app.device.index.maintainingStatus", "Maintenance Status")}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="is_online"
            label={t("app.device.index.onlineStatus", "Online Status")}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${t("app.device.index.deviceSettings", "Device Settings")}-${currentDevice?.name}`}
        onCancel={() => {
          setSettingModalVisible(false)
          rfConfigForm.resetFields()
        }}
        open={settingModalVisible}
        footer={
          <Button
            type={"link"}
            icon={<ReloadOutlined />}
            onClick={() => currentDevice && openSettingModal(currentDevice)}
          >
            {t("app.common.refresh", "Refresh")}
          </Button>
        }
      >
        <Form form={rfConfigForm}>
          {!(
            isNearEndDeviceGroup(currentDevice?.device_type_group) ||
            isSplitterDeviceGroup(currentDevice?.device_type_group)
          ) && (
            <Form.Item
              label={t("app.device.index.uplinkPowerShort", "Uplink Power")}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Space align="center">
                <Form.Item name="uplink_power" noStyle>
                  <InputNumber
                    style={{ width: 200 }}
                    placeholder={t(
                      "app.device.index.uplinkPower.placeholder",
                      "Please enter uplink power",
                    )}
                    addonAfter={`(${configRangeMap.uplink_power?.min}~${configRangeMap.uplink_power?.max})dBm`}
                  />
                </Form.Item>
                <Button type="link" onClick={() => saveRFConfig("uplink_power")}>
                  {t("app.common.save", "Save")}
                </Button>
              </Space>
            </Form.Item>
          )}
          <Form.Item
            label={t("app.device.index.uplinkGainShort", "Uplink Gain")}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Space align="center">
              <Form.Item name="uplink_gain" noStyle>
                <InputNumber
                  style={{ width: 200 }}
                  placeholder={t(
                    "app.device.index.uplinkGain.placeholder",
                    "Please enter uplink gain",
                  )}
                  addonAfter={`(${configRangeMap.uplink_gain?.min}~${configRangeMap.uplink_gain?.max})dB`}
                />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("uplink_gain")}>
                {t("app.common.save", "Save")}
              </Button>
            </Space>
          </Form.Item>
          {!isNearEndDeviceGroup(currentDevice?.device_type_group) && (
            <Form.Item
              label={t("app.device.index.downlinkPowerShort", "Downlink Power")}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Space align="center">
                <Form.Item name="downlink_power" noStyle>
                  <InputNumber
                    style={{ width: 200 }}
                    placeholder={t(
                      "app.device.index.downlinkPower.placeholder",
                      "Please enter downlink power",
                    )}
                    addonAfter={`(${configRangeMap.downlink_power?.min}~${configRangeMap.downlink_power?.max})dBm`}
                  />
                </Form.Item>
                <Button type="link" onClick={() => saveRFConfig("downlink_power")}>
                  {t("app.common.save", "Save")}
                </Button>
              </Space>
            </Form.Item>
          )}
          <Form.Item
            label={t("app.device.index.downlinkGainShort", "Downlink Gain")}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Space align="center">
              <Form.Item name="downlink_gain" noStyle>
                <InputNumber
                  style={{ width: 200 }}
                  placeholder={t(
                    "app.device.index.downlinkGain.placeholder",
                    "Please enter downlink gain",
                  )}
                  addonAfter={`(${configRangeMap.downlink_gain?.min}~${configRangeMap.downlink_gain?.max})dB`}
                />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("downlink_gain")}>
                {t("app.common.save", "Save")}
              </Button>
            </Space>
          </Form.Item>
          {(isRemoteDeviceGroup(currentDevice?.device_type_group) ||
            isAmplifierDeviceGroup(currentDevice?.device_type_group)) && (
            <>
              <Form.Item
                label={t("app.device.index.sameFrequencyForward", "Same Frequency Forward")}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Space align="center">
                  <Form.Item name="same_frequency_forward_switch" noStyle>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: (
                            <span style={{ color: "#52c41a" }}>
                              {t("app.common.enable", "Enable")}
                            </span>
                          ),
                          value: SWITCH_ENABLED_VALUE,
                        },
                        {
                          label: (
                            <span style={{ color: "#ff4d4f" }}>
                              {t("app.common.disable", "Disable")}
                            </span>
                          ),
                          value: SWITCH_DISABLED_VALUE,
                        },
                      ]}
                    />
                  </Form.Item>
                  <Button type="link" onClick={() => saveRFConfig("same_frequency_forward_switch")}>
                    {t("app.common.save", "Save")}
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item
                label={t("app.device.index.downlinkSwitch", "Downlink Switch")}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Space align="center">
                  <Form.Item name="downlink_switch" noStyle>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: (
                            <span style={{ color: "#52c41a" }}>
                              {t("app.common.enable", "Enable")}
                            </span>
                          ),
                          value: SWITCH_ENABLED_VALUE,
                        },
                        {
                          label: (
                            <span style={{ color: "#ff4d4f" }}>
                              {t("app.common.disable", "Disable")}
                            </span>
                          ),
                          value: SWITCH_DISABLED_VALUE,
                        },
                      ]}
                    />
                  </Form.Item>
                  <Button type="link" onClick={() => saveRFConfig("downlink_switch")}>
                    {t("app.common.save", "Save")}
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item
                label={t("app.device.index.uplinkSwitch", "Uplink Switch")}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Space align="center">
                  <Form.Item name="uplink_switch" noStyle>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: (
                            <span style={{ color: "#52c41a" }}>
                              {t("app.common.enable", "Enable")}
                            </span>
                          ),
                          value: SWITCH_ENABLED_VALUE,
                        },
                        {
                          label: (
                            <span style={{ color: "#ff4d4f" }}>
                              {t("app.common.disable", "Disable")}
                            </span>
                          ),
                          value: SWITCH_DISABLED_VALUE,
                        },
                      ]}
                    />
                  </Form.Item>
                  <Button type="link" onClick={() => saveRFConfig("uplink_switch")}>
                    {t("app.common.save", "Save")}
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item
                label={t("app.device.index.pa4AlarmSwitch", "PA4 Alarm Switch")}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                <Space align="center">
                  <Form.Item name="pa4_alarm_switch" noStyle>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: (
                            <span style={{ color: "#52c41a" }}>
                              {t("app.common.enable", "Enable")}
                            </span>
                          ),
                          value: SWITCH_ENABLED_VALUE,
                        },
                        {
                          label: (
                            <span style={{ color: "#ff4d4f" }}>
                              {t("app.common.disable", "Disable")}
                            </span>
                          ),
                          value: SWITCH_DISABLED_VALUE,
                        },
                      ]}
                    />
                  </Form.Item>
                  <Button type="link" onClick={() => saveRFConfig("pa4_alarm_switch")}>
                    {t("app.common.save", "Save")}
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceIndex
