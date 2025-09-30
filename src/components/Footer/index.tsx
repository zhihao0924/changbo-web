import { DefaultFooter } from "@ant-design/pro-components"
import { useIntl } from "umi"

const Footer: React.FC = () => {
  const intl = useIntl()
  const defaultMessage = intl.formatMessage({
    id: "app.copyright.produced",
    defaultMessage: "",
  })

  const currentYear = new Date().getFullYear()

  return (
    <>
      <DefaultFooter
        style={{
          background: "none",
        }}
        copyright={`${currentYear} ${defaultMessage}`}
        links={[
          {
            key: "slogan",
            title: "",
            href: "#!",
          },
        ]}
      />
    </>
  )
}

export default Footer
