import "./index.css"
import { setVersionTipTheme } from "./versionTipTheme"

const defaultParams = {
  buttonText: "刷新",
}

export const versionTipDialog = (params: {
  title?: string
  description?: string
  buttonText?: string
  cancelButtonText?: string
  cancelMode?: string
  imageUrl?: string
  rocketColor?: string
  primaryColor?: string
  buttonStyle?: string
  newVersion: string
  onRefresh?: (event: any) => void
  onCancel?: (event: any) => void
}) => {
  const dialogElement = document.querySelector("#version-rocket")
  if (dialogElement) return

  const getDescription = () => {
    let dom = ""
    if (params?.description) {
      params.description[params.newVersion].update.map((v: any, idx: number) => {
        dom += `<div>${idx + 1}、${v}</div>`
      })
    }
    return dom
  }

  const template = `
  <div id="version-rocket">
        <div class="version-area">
            ${
              params.primaryColor || params.rocketColor
                ? `<div class="version-img">${setVersionTipTheme(
                    params.primaryColor,
                    params.rocketColor,
                  )}</div>`
                : `<img class="version-img" src="${
                    params.imageUrl || "/version-bg.png"
                  }" alt="version" />`
            }
            <div class="version-content">
                <div class="version-title">
                  更新v${params.newVersion}版本
                </div>
                <div class="version-subtitle">
                  ${getDescription()}
                </div>
                <div style="${
                  params.primaryColor ? `background-color: ${params.primaryColor};` : ""
                } ${params.buttonStyle || ""}"  class="refresh-button">
                  ${params.buttonText || defaultParams.buttonText}
                </div>
                ${
                  params.cancelButtonText
                    ? `<div class="cancel-button">
                    ${params.cancelButtonText}
                  </div>`
                    : ""
                }
            </div>
        </div>
  </div>`

  const rootNode = document.createElement("div")
  rootNode.innerHTML = template
  document.body.appendChild(rootNode)

  // refresh
  const refreshBtnNode = document.querySelector("#version-rocket .refresh-button") as HTMLElement
  refreshBtnNode.onclick = () => {
    if (typeof params?.onRefresh === "function") {
      params.onRefresh({ newVersion: params.newVersion })
    } else {
      window.location.reload()
    }
  }
}
