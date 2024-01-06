import React from "react"
import { Button, DialogActions, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"

import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { RequireTag } from "@/libs/other"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import dayjs, { Dayjs } from "dayjs"

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

  const [timeAt, setTimeAt] = React.useState<Dayjs | null>(dayjs(new Date()))

  const { run: onSubmit }: { run: SubmitHandler<any> } = useDebounce(async (values: any) => {})

  return (
    <div className="h-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8 relative">
          <div className="flex items-start ">
            <InputLabel htmlFor="pile_diameter" className="mr-3 min-w-[120px]  text-left mb-2.5">
              <RequireTag>开始浇筑时间:</RequireTag>
            </InputLabel>
            <DateTimePicker
              // views={["year", "month", "day"]}
              sx={{
                ".MuiInputBase-input": {
                  py: "10px",
                },
              }}
              format="YYYY-MM-DD HH:mm"
              ampm={false}
              value={timeAt}
              className="w-full z-auto"
              onChange={(newValue) => {
                setTimeAt(newValue)
              }}
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
