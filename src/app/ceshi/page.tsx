"use client"
import React from "react"

function Page() {
  const handleClick = () => {}

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
