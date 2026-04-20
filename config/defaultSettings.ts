import { Settings as LayoutSettings } from "@ant-design/pro-components"

const colorPrimary = "#1890ff"

const Settings: LayoutSettings & {
  pwa?: boolean
  logo?: string
  token?: Record<string, any>
} = {
  navTheme: "light",
  colorPrimary,
  layout: "mix",
  contentWidth: "Fluid",
  fixedHeader: true,
  fixSiderbar: true,
  pwa: false,
  logo: "/logo.png",
  splitMenus: false,
  title: "专网通信智能网管平台",
  token: {
    header: {
      colorBgHeader: "#163b66",
      colorHeaderTitle: "#fff",
      colorTextMenu: "rgba(255, 255, 255, 0.88)",
      colorTextMenuSecondary: "rgba(255, 255, 255, 0.82)",
      colorTextMenuSelected: "#fff",
      colorBgMenuItemSelected: "rgba(255, 255, 255, 0.12)",
      colorTextRightActionsItem: "#fff",
      heightLayoutHeader: 48,
    },
    sider: {
      colorMenuBackground: "#fff",
      colorMenuItemDivider: "#dfdfdf",
      colorTextMenu: "#595959",
      colorTextMenuSelected: colorPrimary,
      colorBgMenuItemSelected: "rgba(230,243,254,1)",
      // colorBgMenuItemHover: "transparent",
      colorTextMenuItemHover: colorPrimary,
    },
    pageContainer: {
      // colorBgPageContainer: "#F0F2F5",
      paddingInlinePageContainerContent: 24,
    },
  },
}

export default Settings
