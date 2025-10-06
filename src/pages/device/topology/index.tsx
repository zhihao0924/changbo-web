import React from "react"
import { PageContainer } from "@ant-design/pro-components"
import { Card, Button, Row, Col, Space, message, Image } from "antd"
import { useEffect, useRef, useState, useCallback } from "react"
import G6 from "@antv/g6"

const imageNodeStyle = {
  width: 60,
  height: 60,
  fill: "#1890ff",
  stroke: "#096dd9",
  lineWidth: 2,
}

const images = [
  "/assets/D1.svg",
  "/assets/D2.svg",
  "/assets/D3.svg",
  "/assets/D4.svg",
  "/assets/D5.svg",
  "/assets/D6.svg",
  "/assets/D7.svg",
  "/assets/D8.svg",
]

const edgeStyle = {
  stroke: "#8c8c8c",
  lineWidth: 2,
  lineDash: undefined, // 移除虚线效果
  endArrow: {
    path: G6.Arrow.triangle(10, 12, 0),
    fill: "#8c8c8c",
  },
}
const TopologyPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [data, setData] = useState({
    nodes: [
      {
        id: "node1",
        x: 100,
        y: 100,
        type: "image",
        img: images[0],
        style: imageNodeStyle,
      },
      {
        id: "node2",
        x: 200,
        y: 100,
        type: "image",
        img: images[1],
        style: imageNodeStyle,
      },
      {
        id: "node3",
        x: 200,
        y: 300,
        type: "image",
        img: images[2],
        style: imageNodeStyle,
      },
    ],
    edges: [
      { source: "node1", target: "node2", label: "", style: edgeStyle },
      { source: "node2", target: "node3", label: "", style: edgeStyle },
    ],
  })
  const handleZoom = useCallback((ratio: number) => {
    if (graphRef.current) {
      graphRef.current.zoom(ratio, { x: 0, y: 0 })
    }
  }, [])

  const handleZoomIn = useCallback(() => handleZoom(1.2), [handleZoom])
  const handleZoomOut = useCallback(() => handleZoom(0.8), [handleZoom])

  const [isLinkingMode, setIsLinkingMode] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const selectedImageRef = useRef("")
  const [selectedImage, setSelectedImage] = useState("")

  const handleDeleteEdge = useCallback((source: string, target: string) => {
    setData((prevData) => {
      const newEdges = prevData.edges.filter(
        (edge) => !(edge.source === source && edge.target === target),
      )
      return { ...prevData, edges: newEdges }
    })
  }, [])

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.changeData(data)
      graphRef.current.refresh()
    }
  }, [data])

  const initGraph = useCallback(() => {
    if (!containerRef.current) return

    // 清理旧的画布实例
    if (graphRef.current) {
      graphRef.current.destroy()
      graphRef.current = null
    }

    const graph = new G6.Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 500,
      animate: false,
      fitView: true,
      layout: {
        type: "dendrogram",
        radius: 200,
        preventOverlap: true,
        workerEnabled: false,
      },
      modes: {
        default: ["drag-canvas", "drag-node"],
      },
      defaultNode: {
        type: "image",
        size: [60, 60],
        style: {
          fill: "#1890ff",
          stroke: "#096dd9",
          lineWidth: 2,
          fontWeight: 400, // 添加默认字体权重
        },
      },
      nodeStateStyles: {
        selected: {
          stroke: "#ff4d4f", // 选中时的边框颜色
          lineWidth: 3, // 选中时的边框宽度
        },
      },
      defaultEdge: {
        style: {
          stroke: "#8c8c8c",
          lineWidth: 2,
          endArrow: {
            path: G6.Arrow.triangle(10, 12, 0),
            fill: "#8c8c8c",
          },
          fontWeight: 400, // 添加默认字体权重
        },
      },
      // 布局配置已移到graph初始化参数中
    })

    graph.on("edge:click", (e) => {
      const edge = e.item
      if (edge) {
        graph.getEdges().forEach((edge) => graph.clearItemStates(edge, ["selected"]))
        graph.setItemState(edge, "selected", true)
        const model = edge.getModel()
        setSelectedNodes([model.source as string, model.target as string])
      }
    })

    graph.on("node:contextmenu", (e) => {
      e.preventDefault()
      const node = e.item
      if (!node) return

      const model = node.getModel()
      const menu = document.createElement("div")
      menu.style.position = "absolute"
      menu.style.left = `${e.clientX}px`
      menu.style.top = `${e.clientY}px`
      menu.style.background = "#fff"
      menu.style.border = "1px solid #ccc"
      menu.style.padding = "8px"
      menu.style.borderRadius = "4px"
      menu.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)"
      menu.style.zIndex = "9999"

      const createMenuOption = (text: string, onClick: () => void) => {
        const option = document.createElement("div")
        option.textContent = text
        option.style.padding = "4px 8px"
        option.style.cursor = "pointer"
        option.onclick = onClick
        return option
      }

      menu.appendChild(
        createMenuOption("修改名称", () => {
          import("antd").then(({ Modal, Input, Form }) => {
            const formRef = React.createRef<any>()
            Modal.confirm({
              title: "修改节点名称",
              content: (
                <Form ref={formRef}>
                  <Form.Item
                    name="label"
                    initialValue={model.label as string}
                    rules={[{ required: true, message: "请输入节点名称" }]}
                  >
                    <Input placeholder="请输入节点名称" />
                  </Form.Item>
                </Form>
              ),
              onOk: () => {
                return formRef.current?.validateFields().then((values: any) => {
                  model.label = values.label
                  graph.refreshItem(node)
                  setData((prevData) => ({
                    ...prevData,
                    nodes: prevData.nodes.map((n) =>
                      n.id === model.id ? { ...n, label: values.label } : n,
                    ),
                  }))
                  if (menu.parentNode === document.body) {
                    document.body.removeChild(menu)
                  }
                })
              },
              onCancel: () => {
                if (menu.parentNode === document.body) {
                  document.body.removeChild(menu)
                }
              },
            })
          })
        }),
      )

      menu.appendChild(
        createMenuOption("修改图标", () => {
          import("antd").then(({ Modal }) => {
            Modal.confirm({
              title: "修改图标",
              content: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {images.map((image) => (
                    <Image
                      key={image}
                      width={60}
                      src={image}
                      preview={false}
                      style={{
                        cursor: "pointer",
                        border: `1px solid ${selectedImage === image ? "#1890ff" : "#d9d9d9"}`,
                        borderRadius: "4px",
                      }}
                      onClick={() => {
                        console.log("[DEBUG] Selecting image:", image)
                        selectedImageRef.current = image
                        setSelectedImage(image)
                        // 更新所有图片边框样式
                        document.querySelectorAll<HTMLElement>(".ant-image").forEach((img) => {
                          const imgElement = img.querySelector("img")
                          if (imgElement) {
                            const imgSrc = imgElement.getAttribute("src")
                            if (imgSrc) {
                              img.style.border =
                                imgSrc === image ? "2px solid #1890ff" : "1px solid #d9d9d9"
                            }
                          }
                        })
                      }}
                    />
                  ))}
                </div>
              ),
              onOk: async (close) => {
                try {
                  const currentSelectedImage = selectedImageRef.current
                  console.log("[DEBUG] onOk - selectedImageRef:", currentSelectedImage)

                  if (!currentSelectedImage) {
                    message.warning("请先选择图片")
                    return
                  }

                  if (!images.includes(currentSelectedImage)) {
                    message.warning("无效的图片选择")
                    return
                  }

                  model.image = currentSelectedImage
                  graph.refreshItem(node)
                  setData((prevData) => ({
                    ...prevData,
                    nodes: prevData.nodes.map((n) =>
                      n.id === model.id ? { ...n, img: currentSelectedImage } : n,
                    ),
                  }))
                  message.success("图标修改成功")
                } catch (error) {
                  console.error("修改图标失败:", error)
                  message.error("图标修改失败")
                } finally {
                  close()
                  if (menu.parentNode === document.body) {
                    document.body.removeChild(menu)
                  }
                }
              },
              onCancel: () => {
                if (menu.parentNode === document.body) {
                  document.body.removeChild(menu)
                }
              },
            })
          })
        }),
      )

      menu.appendChild(
        createMenuOption("删除节点", () => {
          const hasEdges = data.edges.some((e) => {
            return e.source === model.id || e.target === model.id
          })
          if (hasEdges) {
            message.warning("当前节点存在关联边，无法删除")
            if (menu.parentNode === document.body) {
              document.body.removeChild(menu)
            }
          } else {
            setData((prevData) => ({
              nodes: prevData.nodes.filter((n) => n.id !== model.id),
              edges: prevData.edges.filter((e) => e.source !== model.id && e.target !== model.id),
            }))
            graph.removeItem(node)
            if (menu.parentNode === document.body) {
              document.body.removeChild(menu)
            }
          }
        }),
      )

      document.body.appendChild(menu)
      const closeMenu = (event: MouseEvent) => {
        if (!menu.contains(event.target as Node) && menu.parentNode === document.body) {
          if (menu.parentNode === document.body) {
            document.body.removeChild(menu)
          }
          document.removeEventListener("click", closeMenu)
        }
      }
      // 延迟添加点击事件监听，确保异步操作完成
      setTimeout(() => {
        document.addEventListener("click", closeMenu)
      }, 100)
    })

    try {
      console.log(data)
      graph.data(data)
      graph.render()
      graphRef.current = graph
    } catch (error) {
      console.error("Graph layout failed:", error)
      message.error("拓扑图初始化失败，请刷新页面重试")
    }

    return () => {
      if (graphRef.current) {
        try {
          graphRef.current.destroy()
        } catch (e) {
          console.error("Graph destroy error:", e)
        } finally {
          graphRef.current = null
        }
      }
    }
  }, [data])

  useEffect(() => {
    initGraph()
  }, [initGraph])

  const handleAddNode = useCallback(() => {
    setData((prevData) => {
      const newNodeId = `node_${Date.now()}`
      const newNode = {
        id: newNodeId,
        x: 30,
        y: 30,
        type: "image",
        image: images[0],
        style: imageNodeStyle,
      }
      return {
        nodes: [...prevData.nodes, newNode],
        edges: prevData.edges,
      }
    })
  }, [])

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (!isLinkingMode) return

      console.log("当前选中节点:", nodeId)
      console.log("已选节点列表:", selectedNodes)

      // 第一次点击 - 选择源节点
      if (selectedNodes.length === 0) {
        console.log("选择源节点:", nodeId)
        setSelectedNodes([nodeId])
        return
      }

      // 第二次点击 - 选择目标节点
      if (selectedNodes.length === 1) {
        console.log("选择目标节点:", nodeId)

        // 检查是否选择了相同节点
        if (nodeId === selectedNodes[0]) {
          console.log("错误: 源节点和目标节点相同")
          message.warning("源节点和目标节点不能相同")
          setIsLinkingMode(false)
          setSelectedNodes([])
          return
        }

        // 检查是否已存在相同方向的关联
        // 检查是否已存在相同方向的关联
        // 检查是否已存在相同方向的关联
        const edgeExists = data.edges.some(
          (edge) => edge.source === selectedNodes[0] && edge.target === nodeId,
        )

        if (edgeExists) {
          message.warning(`从 ${selectedNodes[0]} 到 ${nodeId} 的关联已存在`)
        } else {
          // 创建新关联
          setData((prev) => ({
            ...prev,
            edges: [
              ...prev.edges,
              {
                source: selectedNodes[0],
                target: nodeId,
                label: "",
                style: edgeStyle,
              },
            ],
          }))
          message.success(`成功创建关联`)
        }

        // 重置状态
        setIsLinkingMode(false)
        setSelectedNodes([])
      }
    },
    [isLinkingMode, selectedNodes, data.edges],
  )

  const handleToggleLinkingMode = useCallback(() => {
    const newMode = !isLinkingMode
    setIsLinkingMode(newMode)
    setSelectedNodes([])
    if (newMode) {
      message.info("关联模式已开启，请先点击源节点，再点击目标节点")
    } else {
      message.info("已退出关联模式")
    }
  }, [isLinkingMode])

  return (
    <PageContainer>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="设备拓扑图"
            extra={
              <Space>
                <Button type="primary" onClick={handleAddNode}>
                  添加节点
                </Button>
                <Button
                  type={isLinkingMode ? "primary" : "default"}
                  onClick={handleToggleLinkingMode}
                >
                  {isLinkingMode ? "完成关联" : "自定义关联"}
                </Button>
                <Button
                  danger
                  onClick={() => {
                    if (selectedNodes.length === 0) {
                      message.warning("请先选中关联")
                      return
                    }
                    handleDeleteEdge(selectedNodes[0], selectedNodes[1])
                  }}
                >
                  删除关联
                </Button>
              </Space>
            }
          >
            <div
              ref={containerRef}
              style={{ height: "500px", border: "1px solid #f0f0f0", position: "relative" }}
              onClick={(e) => {
                if (isLinkingMode && graphRef.current) {
                  const canvasPoint = graphRef.current.getPointByClient(e.clientX, e.clientY)
                  const node = graphRef.current.getNodes().find((n: { getBBox: () => any }) => {
                    const bbox = n.getBBox()
                    if (!bbox) return false
                    return (
                      canvasPoint.x >= bbox.minX &&
                      canvasPoint.x <= bbox.maxX &&
                      canvasPoint.y >= bbox.minY &&
                      canvasPoint.y <= bbox.maxY
                    )
                  })
                  if (node) handleNodeClick(node.getModel().id)
                }
              }}
            />
            <div style={{ position: "fixed", right: "24px", bottom: "24px", zIndex: 1000 }}>
              <Space direction="vertical">
                <Button type="primary" shape="circle" onClick={handleZoomIn}>
                  +
                </Button>
                <Button type="primary" shape="circle" onClick={handleZoomOut}>
                  -
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}

export default TopologyPage
