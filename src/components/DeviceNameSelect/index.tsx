import React, { useState, useRef, useMemo } from "react"
import { Select, Spin } from "antd"
import type { SelectProps } from "antd"
import { debounce } from "lodash"
import services from "@/pages/common/services"

interface DeviceNameSelectProps extends SelectProps {
  debounceTimeout?: number
}

const DeviceNameSelect: React.FC<DeviceNameSelectProps> = ({
  debounceTimeout = 1000,
  ...props
}) => {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState<SelectProps["options"]>([])
  const fetchRef = useRef(0)

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setOptions([])
      setFetching(true)

      if (!value) {
        setOptions([])
        setFetching(false)
        return
      }

      services.api
        .postDeviceSelectOptions({ name: value })
        .then((newOptions) => {
          if (fetchId === fetchRef.current) {
            // 确保返回数据是数组格式
            const formattedOptions = Array.isArray(newOptions.res)
              ? newOptions.res
                  .filter((item) => item != null && (item.id != null || item.value != null))
                  .map((item) => {
                    console.log("选项项数据:", item)
                    return {
                      label: item.name || item.label || item.value,
                      value: item.id || item.value,
                    }
                  })
              : []
            setOptions(formattedOptions)
            setFetching(false)
          }
        })
        .catch(() => {
          if (fetchId === fetchRef.current) {
            setFetching(false)
          }
        })
    }

    return debounce(loadOptions, debounceTimeout)
  }, [debounceTimeout])

  return (
    <Select
      showSearch
      mode="multiple"
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      {...props}
    />
  )
}

export default DeviceNameSelect
