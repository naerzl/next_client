"use client"
import React from "react"
import Decimal from "decimal.js"
function Page() {
  const handleClick = () => {}
  React.useEffect(() => {
    console.log(Decimal.add(0.15, 1).mul(Decimal.mul(4.015, 1000)).toNumber())
    console.log(Decimal.random(1).toNumber())
  }, [])

  return (
    <div>
      <button
        onClick={() => {
          handleClick()
        }}>
        测试
      </button>
    </div>
  )
}

export default Page
