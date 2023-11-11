export interface EngineeringListing {
  id: number
  project_id: number
  ebs_id: number
  is_highspeed: number
  name: string
  start_mileage: string
  end_mileage: string
  updated_at: string
  created_at: string
  ebs: {
    code: string
    name: string
  }
  creator: string
}

export interface PostEngineeringListingParams {
  project_id: number
  ebs_id?: number
  is_highspeed: number
  name: string
  start_mileage: string
  end_mileage: string
}

export interface PutEngineeringListingParams {
  id: number
  project_id: number
  is_highspeed: number
  name: string
  start_mileage: string
  end_mileage: string
}
