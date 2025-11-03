import React, { useState, useEffect, useCallback } from "react"
import { PageContainer } from "@ant-design/pro-components"
import type { UploadProps, UploadFile } from "antd"
import { Divider, Select, Switch } from "antd"
import { Card, Form, Input, Button, message, Upload } from "antd"
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import type { RcFile, UploadChangeParam } from "antd/es/upload"
import Services from "@/pages/setting/services"
import { SYSTEM_CONFIG } from "@/constants"

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener("load", () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

const beforeUpload = (file: RcFile) => {
  const isPng = file.type === "image/png"
  if (!isPng) {
    message.error("You can only upload PNG file!")
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!")
  }
  return isPng && isLt2M
}

const SystemSetting: React.FC = () => {
  const [form] = Form.useForm()

  const getSystemConfig = useCallback(async () => {
    const res = await Services.api.postSystemConfig({})
    if (res) {
      setImageUrl(res.res.system_logo)
      form.setFieldsValue(res.res)
    }
  }, [form])

  useEffect(() => {
    getSystemConfig()
  }, [getSystemConfig])

  const onFinish = async (values: any) => {
    Services.api
      .postSystemConfigSave(values)
      .then((res) => {
        localStorage.setItem(SYSTEM_CONFIG, JSON.stringify(res.res))
      })
      .then((res) => {
        window.location.reload()
      })
  }

  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>()

  const handleChange: UploadProps["onChange"] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === "uploading") {
      setLoading(true)
      return
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false)
        setImageUrl(url)
        // 将图片URL设置到表单字段
        form.setFieldsValue({ system_logo: url })
      })
    }
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )
  return (
    <PageContainer>
      <Form form={form} layout="horizontal" onFinish={onFinish}>
        <Card title="系统设置">
          <Form.Item
            labelCol={{ span: 6 }}
            label="系统名称"
            name="system_name"
            rules={[{ required: true, message: "请输入系统名称" }]}
            style={{ maxWidth: 600 }}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="系统Logo"
            name="system_logo"
            rules={[{ required: true, message: "请上传logo" }]}
            style={{ maxWidth: 600 }}
          >
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          <Divider dashed={true} />
          <Form.Item
            labelCol={{ span: 6 }}
            label="数据采集频率"
            name="dots_per_second"
            rules={[{ required: true, message: "请选择数据采集频率" }]}
            style={{ maxWidth: 600 }}
          >
            <Select
              defaultValue={1}
              options={[
                { label: "每秒1次", value: 1 },
                { label: "每秒5次", value: 5 },
                { label: "每秒10次", value: 10 },
                { label: "每秒20次", value: 20 },
              ]}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="页面刷新频率"
            name="refresh_interval"
            rules={[{ required: true, message: "请选择数据采集频率" }]}
            style={{ maxWidth: 600 }}
          >
            <Select
              defaultValue={3000}
              options={[
                { label: "500毫秒/次", value: 500 },
                { label: "1秒/次", value: 1000 },
                { label: "3秒/次", value: 3000 },
                { label: "5秒/次", value: 5000 },
              ]}
            />
          </Form.Item>
          <Divider dashed={true} />
          <Form.Item
            labelCol={{ span: 6 }}
            label="邮件服务器"
            name={["email_config", "host"]}
            style={{ maxWidth: 600 }}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue(["email_config", "is_send"]) && !value) {
                    return Promise.reject(new Error("开启邮件发送必须填写邮件服务器"))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder="例如：smtp.qq.com" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="邮件服务器端口"
            name={["email_config", "port"]}
            style={{ maxWidth: 600 }}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue(["email_config", "is_send"]) && !value) {
                    return Promise.reject(new Error("开启邮件发送必须填写端口号"))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder="例如：465 或 587" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="邮件服务器用户名"
            name={["email_config", "username"]}
            style={{ maxWidth: 600 }}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue(["email_config", "is_send"]) && !value) {
                    return Promise.reject(new Error("开启邮件发送必须填写用户名"))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder="邮箱地址" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="邮件服务器授权码"
            name={["email_config", "authorization_code"]}
            style={{ maxWidth: 600 }}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue(["email_config", "is_send"]) && !value) {
                    return Promise.reject(new Error("开启邮件发送必须填写授权码"))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder="邮箱授权码，非登录密码" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            label="是否发送邮件"
            name={["email_config", "is_send"]}
            style={{ maxWidth: 600 }}
            valuePropName="checked"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value) {
                    const emailConfig = getFieldValue("email_config")
                    if (
                      !emailConfig?.host ||
                      !emailConfig?.port ||
                      !emailConfig?.username ||
                      !emailConfig?.authorization_code
                    ) {
                      return Promise.reject(new Error("开启邮件发送前请先配置完整邮箱信息"))
                    }
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </PageContainer>
  )
}

export default SystemSetting
