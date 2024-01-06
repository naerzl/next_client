import React from "react"
import { Button, DialogActions, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"

import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { RequireTag } from "@/libs/other"

type Props = {
  handleClose: () => void
}

export default function ExportForm(props: Props) {
  const { handleClose } = props

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = useForm()

  const { run: onSubmit }: { run: SubmitHandler<any> } = useDebounce(async (values: any) => {})

  return (
    <div className="h-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8 relative">
          <div className="flex items-start ">
            <InputLabel htmlFor="pile_diameter" className="mr-3 min-w-[100px]  text-left mb-2.5">
              <RequireTag>实验室编号:</RequireTag>
            </InputLabel>
            <TextField
              className="flex-1"
              variant="outlined"
              id="pile_diameter"
              size="small"
              fullWidth
              error={Boolean(errors.pile_diameter)}
              {...register("pile_diameter", { required: "请输入实验室编码" })}
              placeholder="请输入实验室编码"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="pile_diameter"
            render={({ message }) => (
              <p className="text-railway_error text-sm absolute">{message}</p>
            )}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-start ">
            <InputLabel htmlFor="pile_length" className="mr-3  min-w-[100px] text-left mb-2.5">
              <RequireTag>序号:</RequireTag>
            </InputLabel>
            <TextField
              className="flex-1"
              variant="outlined"
              id="pile_length"
              size="small"
              error={Boolean(errors.pile_length)}
              {...register("pile_length", { required: "请输入序号" })}
              placeholder="请输入序号"
            />
          </div>
        </div>

        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button type="submit" variant="contained" className="bg-railway_blue">
            确定
          </Button>
        </DialogActions>
      </form>
    </div>
  )
}
