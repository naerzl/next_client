import { Metadata } from "next"
import dynamic from "next/dynamic"

const HomePage = dynamic(() => import("@/app/components/HomePage"), { ssr: false })

export default function Home() {
  return <HomePage></HomePage>
}

export const metadata: Metadata = {
  title: "首页-客户端",
}
