import React from "react"
import { PageContainer } from "@ant-design/pro-components"
import { Card, Button, Row, Col, Space, message, Image } from "antd"
import { useEffect, useRef, useState, useCallback } from "react"
import G6 from "@antv/g6"

const imageNodeStyle = {
  width: 40,
  height: 40,
}

const defaultImage = "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"

export default function TopologyPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [data, setData] = useState({
    nodes: [
      {
        id: "node1",
        x: 100,
        y: 100,
        type: "image",
        image: defaultImage,
        style: imageNodeStyle,
      },
      {
        id: "node2",
        x: 200,
        y: 100,
        type: "image",
        image: defaultImage,
        style: imageNodeStyle,
      },
      {
        id: "node3",
        x: 200,
        y: 300,
        type: "image",
        image: defaultImage,
        style: imageNodeStyle,
      },
    ],
    edges: [
      { source: "node1", target: "node2", label: "", style: {} },
      { source: "node2", target: "node3", label: "", style: {} },
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
      modes: {
        default: ["drag-canvas", "drag-node"],
      },
      layout: {
        type: null,
      },
    })

    graph.on("edge:click", (e) => {
      const edge = e.item
      if (edge) {
        graph.getEdges().forEach((edge) => graph.clearItemStates(edge, ["selected"]))
        graph.setItemState(edge, "selected", true)
        const model = edge.getModel()
        setSelectedNodes([model.source, model.target])
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
          import("antd").then(({ Modal, Select }) => {
            const images = [defaultImage, defaultImage]
            Modal.confirm({
              title: "修改图标",
              content: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {images.map((image) => (
                    <Image
                      key={image}
                      width={80}
                      src={image}
                      preview={false}
                      style={{
                        cursor: "pointer",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                      }}
                      onClick={() => {
                        const select = document.querySelector(".ant-select-selection-item")
                        if (select) {
                          select.setAttribute("title", image)
                        }
                      }}
                    />
                  ))}
                </div>
              ),
              onOk: (close) => {
                const select = document.querySelector(".ant-select-selection-item")
                if (select) {
                  const newIcon = select.getAttribute("title")
                  setData((prevData) => ({
                    ...prevData,
                    nodes: prevData.nodes.map((n) =>
                      n.id === model.id ? { ...n, icon: newIcon } : n,
                    ),
                  }))
                }
                close()
                if (menu.parentNode === document.body) {
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
      document.addEventListener("click", closeMenu)
    })

    graph.data(data)
    graph.render()
    graphRef.current = graph

    return () => {
      graphRef.current?.destroy()
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
        image: defaultImage,
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
      setSelectedNodes((prev) => [...prev, nodeId])
      if (selectedNodes.length === 1) {
        const newEdge = {
          source: selectedNodes[0],
          target: nodeId,
          label: ``,
          style: { stroke: "#faad14", lineDash: [4, 4] },
        }
        const isEdgeExist = data.edges.some(
          (edge) =>
            (edge.source === newEdge.source && edge.target === newEdge.target) ||
            (edge.source === newEdge.target && edge.target === newEdge.source),
        )
        if (!isEdgeExist) {
          setData((prevData) => ({
            nodes: prevData.nodes,
            edges: [...prevData.edges, newEdge],
          }))
          message.success("关联成功！")
        } else {
          message.warning("节点已关联！")
        }
        setIsLinkingMode(false)
        setSelectedNodes([])
      }
    },
    [isLinkingMode, selectedNodes, data.edges],
  )

  const handleToggleLinkingMode = useCallback(() => {
    setIsLinkingMode((prev) => !prev)
    setSelectedNodes([])
    message.info(isLinkingMode ? "已退出关联模式" : "请点击两个节点进行关联")
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
              style={{ height: "500px", border: "1px solid #f0f0f0" }}
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
