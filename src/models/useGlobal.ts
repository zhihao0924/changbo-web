import { useState, useCallback } from "react"

export default function useGlobal() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const setShowModalCB = useCallback((show: boolean) => setShowModal(show), [])

  const [collapsed] = useState<boolean>(false)

  return {
    showModal,
    setShowModalCB,
    collapsed,
  }
}
