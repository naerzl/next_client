import { Button, Drawer } from "@mui/material"
import React from "react"
import { TestDataList } from "@/app/test/types"
import { dateToYYYYMM } from "@/libs/methods"
import { classOptions, TEST_TYPE_OPTION } from "@/app/test/const"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | TestDataList
}

function findTitle(str: string) {
  let title = "查看试验详情"
  const testItem = TEST_TYPE_OPTION.find((item) => item.value == str)
  if (testItem) title += `--${testItem.label}`
  return title
}

function findCementMethod(val: string) {
  const item = classOptions.find((item) => item.value == val)

  return item ? item.label : val
}

export default function LookTestDetaill(props: Props) {
  const { open, close, editItem } = props

  const [dataSets, setDataSets] = React.useState<any>({})

  React.useEffect(() => {
    if (!!editItem) {
      console.log(JSON.parse(editItem.datum_sets))
      setDataSets(JSON.parse(editItem.datum_sets))
    }
  }, [editItem])

  const handleClose = () => {
    close()
  }

  const renderRebar = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">拉伸试验</h3>
          {dataSets?.tensile?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">公称直径a(mm):</b>
                  <span className="font-bold text-railway_303">{item.nominal_diameter}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">公称截面面积S(mm2):</b>
                  <span className="font-bold text-railway_303">
                    {item.nominal_cross_sectional_area}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">原始标距L0(mm):</b>
                  <span className="font-bold text-railway_303">{item.original_gauge_length}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">屈服点σs(Mpa):</b>
                  <span className="font-bold text-railway_303">{item.yield_point}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">抗拉强度σb(Mpa):</b>
                  <span className="font-bold text-railway_303">{item.tensile_strength}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">伸长率δ(%):</b>
                  <span className="font-bold text-railway_303">{item.elongation}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">最大力总延伸率Agt(%):</b>
                  <span className="font-bold text-railway_303">
                    {item.total_extension_maximum_force_ratio}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    实测抗拉强度与实测屈服强度之比R0m/R0el:
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.measured_tensile_yield_strength_ratio}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    实测屈服强度与规定的屈服强度特征值之比R0el/Rel:
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.measured_yield_strength_characteristic_value_ratio}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">拉断位置描述:</b>
                  <span className="font-bold text-railway_303">{item.desc}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">弯曲试验</h3>
          {dataSets?.bending_test?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯心角度α(°):</b>
                  <span className="font-bold text-railway_303">{item.bending_center_angle}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲压头直径d(mm):</b>
                  <span className="font-bold text-railway_303">{item.diameter_of_plunger}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲外表面描述:</b>
                  <span className="font-bold text-railway_303">{item.desc}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲结果:</b>
                  <span className="font-bold text-railway_303">{item.result}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">反向弯曲试验</h3>
          {dataSets?.reverse_bending_test?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">温度:</b>
                  <span className="font-bold text-railway_303">
                    {item?.artificial_aging_process_conditions?.temperature}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">时间:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item?.artificial_aging_process_conditions?.time)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯心角度α(°):</b>
                  <span className="font-bold text-railway_303">{item.bending_center_angle}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲压头直径d(mm):</b>
                  <span className="font-bold text-railway_303">{item.diameter_of_plunger}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲外表面描述:</b>
                  <span className="font-bold text-railway_303">{item.desc}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">弯曲结果:</b>
                  <span className="font-bold text-railway_303">{item.result}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderSteelBarConnection = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">连接接头拉伸试验</h3>
          {dataSets?.connection_joints_tensile_test?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件连接长度L(㎜):</b>
                  <span className="font-bold text-railway_303">{item.connection_length}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">接头面积S(㎜2):</b>
                  <span className="font-bold text-railway_303">{item.joint_area}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">接头最大力Fb(kN):</b>
                  <span className="font-bold text-railway_303">{item.maximum_joint_force}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">接头抗拉强度σb(MPa):</b>
                  <span className="font-bold text-railway_303">{item.joints_tensile_strength}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">断口位置(距连接处端点距离)(㎜):</b>
                  <span className="font-bold text-railway_303">{item.fracture_location}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">接头断裂特征:</b>
                  <span className="font-bold text-railway_303">
                    {item.joint_fracture_characteristics}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderConcretePerformance = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">标准配比:</b>
              <span className="font-bold text-railway_303">{dataSets?.standard_ratio_id}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">施工配比:</b>
              <span className="font-bold text-railway_303">{dataSets?.construction_ratio}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">搅拌方式:</b>
              <span className="font-bold text-railway_303">{dataSets?.stirring_method}</span>
            </li>
          </ul>
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">试验数据</h3>
          {dataSets?.test_data?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">坍落度（mm）:</b>
                  <span className="font-bold text-railway_303">{item.slump}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">含气量（%）:</b>
                  <span className="font-bold text-railway_303">{item.gas_content}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">温度（℃）:</b>
                  <span className="font-bold text-railway_303">{item.temperature}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderTestBlock = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">抗压强度比</h3>
          {dataSets?.compressive_strength?.map((item: any, index: number) => (
            <div key={index}>
              {item.map((subitem: any, subIndex: number) => (
                <ul key={subIndex}>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">试验日期:</b>
                    <span className="font-bold text-railway_303">
                      {dateToYYYYMM(subitem.date_of_determination)}
                    </span>
                  </li>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">龄期(d):</b>
                    <span className="font-bold text-railway_303">{subitem.instar}</span>
                  </li>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">承压面积(mm²):</b>
                    <span className="font-bold text-railway_303">{subitem.pressure_area}</span>
                  </li>
                </ul>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderWater = () => {
    return <div></div>
  }
  const renderCement = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">密度</h3>
          {dataSets?.density?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">水泥试样质量G(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    李氏瓶中未加试样时无水煤油弯月面第一次读数V1(mL):
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.first_anhydrous_kerosene_meniscus}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    李氏瓶中加入试样后无水煤油弯月面第二次读数V2(mL):
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.second_anhydrous_kerosene_meniscus_add_sample}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">安定性</h3>
          {dataSets?.stability?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">测定方法:</b>
                  <span className="font-bold text-railway_303">
                    {findCementMethod(item.assay_method)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">制件日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_sample_making)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">测定日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <ul>
                    {item?.rex_situation?.map((subItem: any, index: number) => (
                      <li key={index}>
                        <div>
                          <b className="mr-1.5 text-railway_gray">试件号:</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.date_of_determination)}
                          </span>
                        </div>
                        <div>
                          <b className="mr-1.5 text-railway_gray">A值(mm):</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.a_value)}
                          </span>
                        </div>
                        <div>
                          <b className="mr-1.5 text-railway_gray">C值(mm):</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.c_value)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">标准稠度用水量</h3>
          {dataSets?.standard_consistency_water_consumption?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">测定日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">测定方法:</b>
                  <span className="font-bold text-railway_303">{item.assay_method}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量W(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">拌和水量(mL):</b>
                  <span className="font-bold text-railway_303">{item.mixing_water_quantity}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试杆距底板距离S(mm):</b>
                  <span className="font-bold text-railway_303">
                    {item.distance_rod_bottom_plate}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试杆下沉深度S(mm):</b>
                  <span className="font-bold text-railway_303">{item.rod_sinking_depth}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">凝结时间</h3>
          {dataSets?.setting_time?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">测定日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">水泥全部加入水中时刻:</b>
                  <span className="font-bold text-railway_303">
                    {item.all_cement_to_water_moment}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">初凝时刻:</b>
                  <span className="font-bold text-railway_303">{item.initial_set_moment}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">初凝时间:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.initial_set_time)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">终凝时刻:</b>
                  <span className="font-bold text-railway_303">{item.final_set_moment}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">终凝时间:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.final_set_time)}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">强度</h3>
          {dataSets?.strength?.map((item: any, index: number) => (
            <div key={index}>
              <div className="mb-5 shadow p-2.5">
                <h4 className="text-lg font-bold">抗折强度</h4>
                <div>
                  {item.flexural.map((subItem: any, subIndex: number) => (
                    <div key={subIndex}>
                      <ul>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">制件日期:</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.date_of_sample_making)}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">试验日期:</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.date_of_determination)}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">龄期:</b>
                          <span className="font-bold text-railway_303">{subItem.instar}</span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">棱柱体正方形截面边长:</b>
                          <span className="font-bold text-railway_303">
                            {subItem.side_length_prism_square_section}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">支撑圆柱之间距离L:</b>
                          <span className="font-bold text-railway_303">
                            {subItem.distance_between_supporting_cylinders}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">荷载Ft:</b>
                          <span className="font-bold text-railway_303">{subItem.load}</span>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-5 shadow p-2.5">
                <h4 className="text-lg font-bold">抗压强度</h4>
                <div>
                  {item.compressive.map((subItem: any, subIndex: number) => (
                    <div key={subIndex}>
                      <ul>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">制件日期:</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.date_of_sample_making)}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">试验日期:</b>
                          <span className="font-bold text-railway_303">
                            {dateToYYYYMM(subItem.date_of_determination)}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">龄期:</b>
                          <span className="font-bold text-railway_303">{subItem.instar}</span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">受压面积:</b>
                          <span className="font-bold text-railway_303">
                            {subItem.compression_area}
                          </span>
                        </li>
                        <li className="mt-1.5">
                          <b className="mr-1.5 text-railway_gray">荷载Ft:</b>
                          <span className="font-bold text-railway_303">{subItem.load}</span>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderCoarseAggregate = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">针片状颗粒总含量（%）</h3>
          {dataSets?.needle_flake_particles_total?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">{item.drying_sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">针片状颗粒总质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.needle_flake_particles_quality_total}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">含泥量（%）</h3>
          {dataSets?.soil?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后烘干试样质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">泥块含量（%）</h3>
          {dataSets?.mud?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">公称直径5㎜筛上筛余质量m1（g）:</b>
                  <span className="font-bold text-railway_303">{item.mm5_accumulate_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后烘干试样质量m2（g）:</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">表观密度ρ（kg/m3）</h3>
          {dataSets?.apparent_density?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样的烘干质量m0(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_drying_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">吊篮在水中的质量m1(g):</b>
                  <span className="font-bold text-railway_303">{item.basket_quality_water}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">吊篮及试样在水中的质量m2(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.basket_sample_quality_water}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">水温t（℃）:</b>
                  <span className="font-bold text-railway_303">{item.water_temperature}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">水温修正系数αt:</b>
                  <span className="font-bold text-railway_303">
                    {item.water_temperature_correction_coefficient}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">紧密密度（kg/m³）</h3>
          {dataSets?.higher_feed_density?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">容量筒质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.capacity_cylinder_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">容量筒和试样总质量m2(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.capacity_cylinder_sample_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">容量筒的体积V(L):</b>
                  <span className="font-bold text-railway_303">
                    {item.capacity_cylinder_volume}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">压碎指标值（%）</h3>
          {dataSets?.crushing_value?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">压碎试验后筛余的试样质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.sample_after_test_quality}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">颗粒级配</h3>
          {dataSets?.particle_grading?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">筛余质量（g）:</b>
                  <span className="font-bold text-railway_303">{item.accumulate_quality}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderFineAggregate = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">含泥量（%）</h3>
          {dataSets?.soil?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后烘干试样质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">泥块含量（%）</h3>
          {dataSets?.mud?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后烘干试样质量m2（g）:</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">云母含量（%）</h3>
          {dataSets?.mica?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">{item.drying_sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">挑出云母质量m(g):</b>
                  <span className="font-bold text-railway_303">{item.pick_mica_quality}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">轻物质含量(%)</h3>
          {dataSets?.light_substance?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">重液密度 (g/m3):</b>
                  <span className="font-bold text-railway_303">{item.heavy_liquid_density}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前试样干质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">干轻物质+器皿质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.dry_matter_light_matter_utensils_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">器皿质量m2(g):</b>
                  <span className="font-bold text-railway_303">{item.utensils_quality}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">有机物含量判定</h3>
          {dataSets?.organic_judge?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样数量(mL):</b>
                  <span className="font-bold text-railway_303">{item.sample_mass}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">加3%NaOH溶液时间:</b>
                  <span className="font-bold text-railway_303">{item.three_p_naoh_time}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">标准溶液配制时间:</b>
                  <span className="font-bold text-railway_303">
                    {item.standard_preparation_time}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">比较时间:</b>
                  <span className="font-bold text-railway_303">{item.compare_time}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">比较结果:</b>
                  <span className="font-bold text-railway_303">{item.compare_result}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">压碎指标（%）</h3>
          {dataSets?.crushing_value?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">第i级单级试样的质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.each_grade_single_stage_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    第i单级试样的压碎试验后筛余的试样质量m1(g):
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.each_sample_after_test_sample_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">第i单级试样分计筛余αi(%):</b>
                  <span className="font-bold text-railway_303">
                    {item.each_grade_sample_calculated_respectively}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">第i单级试样压碎指标δi(%):</b>
                  <span className="font-bold text-railway_303">
                    {item.each_grade_calculated_respectively}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">石粉含量（%）</h3>
          {dataSets?.powder?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前烘干试样质量m0(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后烘干试样质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">吸水率（%）</h3>
          {dataSets?.absorption?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">容器质量m1(g):</b>
                  <span className="font-bold text-railway_303">{item.volume_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">饱和面干试样质量(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.saturated_surface_dry_sample_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">烘干试样+容器质量m2(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_sample_volume_quality}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">含水率（%）</h3>
          {dataSets?.moisture?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">容器质量m1(g):</b>
                  <span className="font-bold text-railway_303">{item.volume_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">饱和面干试样质量(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_sample_before_volume_quality}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">烘干试样+容器质量m2(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_sample_after_volume_quality}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">坚固性（%）</h3>
          {dataSets?.ruggedness?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验前试样干质量mi(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_before_test}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验后试样干质量mi(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.drying_quality_after_test}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">硫化物及硫酸盐含量（%）</h3>
          {dataSets?.sulfide_and_sulfate?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">粉磨试样质量m(g):</b>
                  <span className="font-bold text-railway_303">{item.grinding_sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">坩埚质量m1(g):</b>
                  <span className="font-bold text-railway_303">{item.crucible_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">800℃灼烧30min后沉淀物+坩锅质量m2(g):</b>
                  <span className="font-bold text-railway_303">
                    {item["800c_30m_after_burning_crucible_quality"]}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">氯化物含量（%）</h3>
          {dataSets?.chloride?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">硝酸银标准溶液浓度CAgNO3(mol/L):</b>
                  <span className="font-bold text-railway_303">
                    {item.silver_nitrate_standard_concentration}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    样品滴定时消耗硝酸银标准溶液体积V1(mL):
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.sample_silver_nitrate_standard_volume_consumed}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量m(g):</b>
                  <span className="font-bold text-railway_303">{item["sample_quality"]}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">颗粒级配</h3>
          {dataSets?.particle_grading?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">筛余质量(g):</b>
                  <span className="font-bold text-railway_303">{item.accumulate_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">分计筛余（%）:</b>
                  <span className="font-bold text-railway_303">{item.accumulate_respectively}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">累计筛余（%）:</b>
                  <span className="font-bold text-railway_303">{item.accumulate_sieve}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">＞9.50mm颗粒含量(%):</b>
                  <span className="font-bold text-railway_303">
                    {item.gt_95mm_particle_content}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderMineralAdmixture = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">细度</h3>
          {dataSets?.fly_ash?.fineness?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样的质量G(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">筛余物的质量G1(g):</b>
                  <span className="font-bold text-railway_303">{item.sieve_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">修正系数K:</b>
                  <span className="font-bold text-railway_303">{item.correction_coefficient}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">需水量比</h3>
          {dataSets?.fly_ash?.water_demand_ratio?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">需水量(ml):</b>
                  <span className="font-bold text-railway_303">{item.water_requirement}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">游离氧化钙含量（%）</h3>
          {dataSets?.fly_ash?.f_cao?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量m(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    每mL苯甲酸无水乙醇标准滴定溶液相当于氧化钙的毫克数TCao(mg/mL):
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.titration_anhydrous_ethanol_benzoic_acid_calcium_oxide}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    滴定时消耗苯甲酸无水乙醇标准滴定溶液的体积V(mL):
                  </b>
                  <span className="font-bold text-railway_303">
                    {
                      item.during_titration_consumption_benzoic_acid_anhydrous_ethanol_titration_volume
                    }
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">烧失量（%）</h3>
          {dataSets?.fly_ash?.ignition_loss?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量m(g):</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">灼烧后试样质量m1(g):</b>
                  <span className="font-bold text-railway_303">
                    {item.after_burning_sample_quality}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderAdditive = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">含气量</h3>
          {dataSets?.water_reducer?.gas_content?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">骨料含气量Ag（%）:</b>
                  <span className="font-bold text-railway_303">{item.aggregate_air_content}</span>
                </li>
                <li className="mt-1.5">
                  <div className="mb-5 shadow p-2.5">
                    <h4 className="text-lg font-bold">混凝土拌和物含气量测定值A0（%）</h4>
                    <div>
                      {item.determination_air_content_concrete_mixture.map(
                        (subItem: any, subIndex: number) => (
                          <div key={subIndex}>
                            <ul>
                              <li className="mt-1.5">
                                <b className="mr-1.5 text-railway_gray">数据{index + 1}:</b>
                                <span className="font-bold text-railway_303">{subItem}</span>
                              </li>
                            </ul>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">减水率（%）</h3>
          {dataSets?.water_reducer?.water_reduction?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">基准混凝土单位用水量W0（kg/m3）:</b>
                  <span className="font-bold text-railway_303">
                    {item.benchmark_concrete_unit_water}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">掺外加剂混凝土单位用水量W1（kg/m3）:</b>
                  <span className="font-bold text-railway_303">
                    {item.water_unit_concrete_additive}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">泌水率比（%）</h3>
          {dataSets?.water_reducer?.bleeding_rate_ratio?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试样质量GW（g）:</b>
                  <span className="font-bold text-railway_303">{item.sample_quality}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">拌和物用水量W（g）:</b>
                  <span className="font-bold text-railway_303">
                    {item.mixture_water_consumption}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">拌和物总质量G（g）:</b>
                  <span className="font-bold text-railway_303">{item.mixture_quality_total}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">泌水总质量VW（g）:</b>
                  <span className="font-bold text-railway_303">{item.bleeding_quality_total}</span>
                </li>
                <li>
                  <div className="mb-5 shadow p-2.5">
                    <h4 className="text-lg font-bold">泌水量V(mL)</h4>
                    <div>
                      {item?.bleeding_quality?.map((subItem: any, subIndex: number) => (
                        <div key={subIndex}>
                          <ul>
                            <li className="mt-1.5">
                              <b className="mr-1.5 text-railway_gray">数据{index + 1}:</b>
                              <span className="font-bold text-railway_303">
                                {subItem.pressurize_time}
                              </span>
                            </li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">坍落度1h经时变化量</h3>
          {dataSets?.water_reducer?.h_1_slump_variation?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">时间:</b>
                  <span className="font-bold text-railway_303">{item.duration}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>

                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">坍落度(mm):</b>
                  <span className="font-bold text-railway_303">{item.slumps}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3"> 抗压强度比（%）</h3>
          {dataSets?.water_reducer?.compressive_strength_ratio?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件编号:</b>
                  <span className="font-bold text-railway_303">{item.no}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">龄期(d):</b>
                  <span className="font-bold text-railway_303">{item.instar}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件尺寸（mm):</b>
                  <span className="font-bold text-railway_303">{item.specimen_size}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">破坏荷载（kN）:</b>
                  <span className="font-bold text-railway_303">{item.failure_load}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">抗压强度（MPa）:</b>
                  <span className="font-bold text-railway_303">{item.compressive_strength}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">收缩率比（%）</h3>
          {dataSets?.water_reducer?.shrinkage_ratio?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试验日期:</b>
                  <span className="font-bold text-railway_303">
                    {dateToYYYYMM(item.date_of_determination)}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件标距:</b>
                  <span className="font-bold text-railway_303">{item.specimen_gauge_length}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件长度初始读数:</b>
                  <span className="font-bold text-railway_303">{item.initial_specimen_length}</span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">试件在28d期长度读数:</b>
                  <span className="font-bold text-railway_303">{item.d_28_specimen_length}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">相对耐久性指标P（%）</h3>
          {dataSets?.water_reducer?.relative_durability_index?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    掺外加剂混凝土冻融200次后试件横向基频fn（Hz）:
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.lateral_fundamental_frequency_after_200_freeze_thawing}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">
                    掺外加剂混凝土冻融试验前试件横向基频fo（Hz）:
                  </b>
                  <span className="font-bold text-railway_303">
                    {item.lateral_fundamental_frequency_before_freeze_thawing}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">匀质性</h3>

          <div>
            {dataSets?.water_reducer?.isotropism?.solid?.map((item: any, index: number) => (
              <div className="mb-5 shadow p-2.5" key={index}>
                <h4 className="text-lg font-bold">含固量（%）</h4>
                <ul>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">称量瓶的质量m0（g）:</b>
                    <span className="font-bold text-railway_303">
                      {item.weighing_bottle_quality}
                    </span>
                  </li>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">称量瓶加试样的质量 m1（g）:</b>
                    <span className="font-bold text-railway_303">
                      {item.weighing_bottle_sample_quality}
                    </span>
                  </li>
                  <li className="mt-1.5">
                    <b className="mr-1.5 text-railway_gray">称量瓶加烘干后试样的质量m2（g）:</b>
                    <span className="font-bold text-railway_303">
                      {item.weighing_bottle_sample_drying_quality}
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">温度和湿度</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">温度:</b>
              <span className="font-bold text-railway_303">{dataSets?.temperature}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">湿度:</b>
              <span className="font-bold text-railway_303">{dataSets?.humidity}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  const renderDetail = () => {
    switch (editItem!.class) {
      case "rebar":
        return renderRebar()
      case "steel_bar_connection":
        return renderSteelBarConnection()
      case "concrete_performance":
        return renderConcretePerformance()
      case "test_block":
        return renderTestBlock()
      case "water":
        return renderWater()
      case "cement":
        return renderCement()
      case "coarse_aggregate":
        return renderCoarseAggregate()
      case "fine_aggregate":
        return renderFineAggregate()
      case "mineral_admixture":
        return renderMineralAdmixture()
      case "additive":
        return renderAdditive()
      default:
        return <></>
    }
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[700px] p-10 relative">
        <header className="text-3xl text-[#44566C] mb-8 sticky top-0 bg-white py-4">
          {findTitle(editItem!.class)}
        </header>
        <div>{renderDetail()}</div>
        <div>
          <Button onClick={handleClose}>关闭</Button>
        </div>
      </div>
    </Drawer>
  )
}
