import { DICTIONARY_CLASS_ID } from "@/libs/const"

export const Pile_Type_Enum = [
  {
    value: "FRICTION",
    label: "摩擦桩",
  },
  {
    value: "SOCKETED",
    label: "嵌岩桩",
  },
]

export const CONSTRUCTION_TECHNOLOGY = [
  {
    value: "dry_construction_drill",
    label: "干作业钻孔",
  },
  {
    value: "mud_protection_drill",
    label: "泥浆护壁钻孔",
  },
  {
    value: "casing_pipe_wall_drill",
    label: "套管护壁钻孔",
  },
]

export const DRILL_MODE = [
  {
    value: "percussion_drill",
    label: "冲击钻",
  },
  {
    value: "rotary_drilling_rig",
    label: "旋挖钻",
  },
  {
    value: "positive_circulation",
    label: "正循环",
  },
  {
    value: "reverse_circulation",
    label: "反循环",
  },
]

export const Connect_method_enum = [
  {
    value: "MACHINE",
    label: "机械连接",
  },
  {
    value: "WELD",
    label: "焊接连接",
  },
  {
    value: "LASHED",
    label: "绑扎搭接",
  },
]

export const PILE_CODE = [
  "030101010102010701",
  "030101010102010702",
  "030101010101010701",
  "030101010101010702",
  "030102010101010701",
  "030102010101010702",
  "03010301010101010701",
  "03010301010101010702",
  "03020101010101010701",
  "03020101010101010702",
  "03020102010101010701",
  "03020102010101010702",
  "03020103010101010701",
  "03020103010101010702",
  "03020201010101010701",
  "03020201010101010702",
  "03020201020101010701",
  "03020201020101010702",
  "030301010101010701",
  "030301010101010702",
  "030301020101010701",
  "030301020101010702",
  "030302010101010701",
  "030302010101010702",
  "030302020101010701",
  "030302020101010702",
  "030401010101010701",
  "030401010101010702",
  "030401020101010701",
  "030401020101010702",
  "030402010101010701",
  "030402010101010702",
  "030402020101010701",
  "030402020101010702",
]

export const BASIC_DICTIONARY_CLASS_ID = DICTIONARY_CLASS_ID.spacer

export const REBAR_DICTIONARY_CLASS_ID = DICTIONARY_CLASS_ID.rebar

export const CONCRETE_DICTIONARY_CLASS_ID = DICTIONARY_CLASS_ID.concrete

export const ACOUSTIC_TUBE_DICTIONARY_CLASS_ID = DICTIONARY_CLASS_ID.acoustic_tube

export const SPACER_DICTIONARY_CLASS_ID = DICTIONARY_CLASS_ID.spacer + 1
