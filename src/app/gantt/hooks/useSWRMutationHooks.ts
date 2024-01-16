import useSWRMutation from "swr/mutation"
import {
  reqDelMaterialDemandItem,
  reqGetExportMaterialDemand,
  reqGetMaterialDemand,
  reqGetMaterialDemandItem,
  reqGetProjectMaterialRequirementStatic,
  reqGetProjectMaterialRequirementStaticDetail,
  reqPostMaterialDemand,
  reqPostMaterialDemandItem,
  reqPutMaterialDemand,
  reqPutMaterialDemandItem,
} from "@/app/material-demand/api"
import { reqGetMaterialProportion } from "@/app/proportion/api"
import { reqGetDictionary } from "@/app/material-approach/api"
import { reqGetQueue } from "@/app/queue/api"
import {
  reqGetMaterialLossCoefficient,
  reqPostMaterialLossCoefficient,
} from "@/app/material-loss-coefficient/api"
import { reqGetProjectSubSection } from "@/app/working-point/api"
import {
  reqGetProcurementPlanListItems,
  reqPostMaterialProcurementPlan,
  reqPutMaterialProcurementPlan,
  reqPutProcurementPlanListItems,
} from "@/app/material-procurement-plan/api"

const useSWRMutationHooks = () => {
  const { trigger: postMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqPostMaterialDemand,
  )

  const { trigger: getMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqGetMaterialDemandItem,
  )

  const { trigger: putMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqPutMaterialDemandItem,
  )

  const { trigger: postMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqPostMaterialDemandItem,
  )

  const { trigger: delMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqDelMaterialDemandItem,
  )

  const { trigger: getMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqGetMaterialDemand,
  )

  const { trigger: putMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqPutMaterialDemand,
  )

  const { trigger: getMaterialProportionApi } = useSWRMutation(
    "/material-proportion",
    reqGetMaterialProportion,
  )

  const { trigger: getExportMaterialDemandApi } = useSWRMutation(
    "/export-material-requirement",
    reqGetExportMaterialDemand,
  )

  const { trigger: getDictionaryListApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const { trigger: getQueueApi } = useSWRMutation("/queue", reqGetQueue)

  const { trigger: getMaterialLossCoefficientApi } = useSWRMutation(
    "/loss-coefficient",
    reqGetMaterialLossCoefficient,
  )

  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const { trigger: postMaterialLossCoefficientApi } = useSWRMutation(
    "/project-loss-coefficient",
    reqPostMaterialLossCoefficient,
  )

  const { trigger: getProjectMaterialRequirementStaticApi } = useSWRMutation(
    "/project-material-requirement/static",
    reqGetProjectMaterialRequirementStatic,
  )
  const { trigger: getProjectMaterialRequirementStaticDetailApi } = useSWRMutation(
    "/project-material-requirement/static-detail",
    reqGetProjectMaterialRequirementStaticDetail,
  )

  const { trigger: postProjectMaterialPurchaseApi } = useSWRMutation(
    "/project-material-purchase",
    reqPostMaterialProcurementPlan,
  )

  const { trigger: putProjectMaterialPurchaseApi } = useSWRMutation(
    "/project-material-purchase",
    reqPutMaterialProcurementPlan,
  )

  const { trigger: getProjectMaterialPurchaseItemApi } = useSWRMutation(
    "/project-material-purchase-item",
    reqGetProcurementPlanListItems,
  )

  const { trigger: putProjectMaterialPurchaseItemApi } = useSWRMutation(
    "/project-material-purchase-item",
    reqPutProcurementPlanListItems,
  )

  return {
    getMaterialDemandItemApi,
    getMaterialProportionApi,
    getMaterialDemandApi,
    postMaterialDemandApi,
    putMaterialDemandItemApi,
    postMaterialDemandItemApi,
    delMaterialDemandItemApi,
    putMaterialDemandApi,
    getExportMaterialDemandApi,
    getDictionaryListApi,
    getQueueApi,
    getMaterialLossCoefficientApi,
    getProjectSubSectionApi,
    postMaterialLossCoefficientApi,
    getProjectMaterialRequirementStaticApi,
    getProjectMaterialRequirementStaticDetailApi,
    postProjectMaterialPurchaseApi,
    getProjectMaterialPurchaseItemApi,
    putProjectMaterialPurchaseItemApi,
    putProjectMaterialPurchaseApi,
  }
}

export default useSWRMutationHooks
