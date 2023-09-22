import React from "react"

function A(props: { num: number; changeNum: (num: any) => void }) {
  return (
    <div>
      <span>{props.num}</span>
      <button
        onClick={() => {
          props.changeNum(Math.random())
        }}>
        按钮 num +1
      </button>
    </div>
  )
}

export default A
