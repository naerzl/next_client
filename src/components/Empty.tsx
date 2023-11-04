import React from "react"

type Props = {
  fontSize?: string
  color?: string
  text?: React.ReactNode
  className?: string
}
function empty(props: Props) {
  const { fontSize, color, text, className } = props
  return (
    <div style={{ color: color ? color : "#737373" }} className={className ? className : ""}>
      <div>
        <i className="iconfont icon-empty" style={{ fontSize: fontSize ? fontSize : "16px" }}></i>
      </div>
      <div>{text ? text : "no data"}</div>
    </div>
  )
}

export default empty
