export const RequireTag = (props: any) => {
  return (
    <div>
      <i className="text-railway_error mr-1.5">*</i>
      {props.children}
    </div>
  )
}
