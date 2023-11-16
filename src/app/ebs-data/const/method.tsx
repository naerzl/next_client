import React from "react"

export function renderProperty(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  if (arr instanceof Array) {
    return arr.map((item, index) => {
      return (
        <div key={index}>
          <span>
            {item.key}： {item.value}
          </span>
        </div>
      )
    })
  } else {
    return <></>
  }
}
