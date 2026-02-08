import CreateOrg from "../services/CreateOrg";
import Organization from "../models/Organization";


interface payload{
    OrgName:string,
    UserId:Number
}


const CreateNewOrg = async (payload:payload) => {
    return await CreateOrg.createOrg(payload.OrgName,payload.UserId)
}

const GetOrgById = async (id: number) => {
    return await Organization.findOrgById(id)
}

const UpdateOrg = async (id: number, data: Partial<{ Orgname: string }>) => {
    return await Organization.UpdateOrgById(id, data as any)
}

const DeleteOrg = async (id: number) => {
    return await Organization.DeleteOrgById(id)
}

export default { CreateNewOrg, GetOrgById, UpdateOrg, DeleteOrg }