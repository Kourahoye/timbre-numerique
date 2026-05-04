type User = {
  id: string;
  username: string
}

type TimbreType = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  createdBy: User
  updatedBy: User
}

export type GetTypeTimbresQuery = {
  getTimbresType: TimbreType[]
}

export type DeleteTypeMutationVariables = {
  id: number
}

export type DeleteTypeMutationResponse = {
  deleteTypeTimbre: {
    success: boolean
    message: string
  }
}
export type DeleteSessionMutationResponse = {
  deleteSession: {
    success: boolean
    message: string
  }
}
export type ToggleSessionMutationResponse = {
  toogleActiveSession: {
    success: boolean
    message: string
  }
}


export type UsersData = {
  users: User[];
};

export type AssignRoleResponse = {
  assignRole: {
    success: boolean;
    message: string;
  };
};

export type ScanType = {
  name: string;
};

export type ScanItem = {
  id: string;
  qrCode: string;
  reference: string;
  used: boolean;
  type: ScanType;
};
export type ScanData = {
  scan: ScanItem;
};
export type ScanAgrs = {
  ref :string
}

export type AddSession ={
  addSession:{
    id:string;
    name:string;
  };
}

export type SessionType ={
      id: string
      name: string
      active:boolean
      startDate: string
      endDate: string
      createdAt: string
      updatedAt: string
      createdBy: User
      updatedBy: User
  }
export type Sessions = {
  sessionInfos:SessionType[]

}
export type MeType = {
  me:{ 
  username : string
    lastName :string
    firstName :string
    email: string
    id: string
}
}

export type Timbres = {
  myTimbres :{
    id:string
    qrCode:string
    reference:string
    used:string
    "type":TimbreType
  }[]

}

export type PriceType = 
  {
    id:string
    price:string
    session :SessionType
    type :TimbreType
    createdAt: string
    updatedAt: string
    createdBy: User
    updatedBy: User
  }

export type PriceAssignation ={
  activeSessionPrice:PriceType[]
}