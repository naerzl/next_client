import { DICTIONARY_CLASS_ID } from "@/libs/const"

export const CLASS_OPTION = [
  {
    value: "rebar",
    label: "钢筋笼",
  },
  {
    value: "concrete",
    label: "混凝土",
  },
]

export const LINK_METHOD_OPTION = [
  {
    value: "MACHINE",
    label: "机械连接",
  },
  {
    value: "WELD",
    label: "绑扎搭接",
  },
  {
    value: "LASHED",
    label: "焊接连接",
  },
]

export const subRebarDictionaryClass = [
  {
    value: "acoustic_tube",
    label: "声测管",
    id: DICTIONARY_CLASS_ID.acoustic_tube,
    unit: "米",
  },
  {
    value: "rebar",
    label: "钢筋",
    id: DICTIONARY_CLASS_ID.rebar,
    unit: "吨",
  },
  {
    value: "spacer",
    label: "垫块",
    id: DICTIONARY_CLASS_ID.spacer,
    unit: "个",
  },
]

export const subConcreteDictionaryClass = [
  {
    value: "cement",
    label: "水泥",
    id: DICTIONARY_CLASS_ID.cement,
    unit: "吨",
  },
  {
    value: "water",
    label: "水",
    id: DICTIONARY_CLASS_ID.water,
    unit: "吨",
  },
  {
    value: "fine_aggregate",
    label: "细骨料",
    id: DICTIONARY_CLASS_ID.fine_aggregate,
    unit: "吨",
  },
  {
    value: "coarse_aggregate",
    label: "粗骨料",
    id: DICTIONARY_CLASS_ID.coarse_aggregate,
    unit: "吨",
  },
  {
    value: "mineral_admixture",
    label: "矿物掺和料",
    id: DICTIONARY_CLASS_ID.mineral_admixture,
    unit: "吨",
  },
  {
    value: "additive",
    label: "外加剂",
    id: DICTIONARY_CLASS_ID.additive,
    unit: "吨",
  },
]
