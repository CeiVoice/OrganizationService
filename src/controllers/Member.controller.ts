import Member from "../models/Member";
import Organization from "../models/Organization";

interface CreateMemberPayload {
    OrganizationId: string,
    UserId: string,
    Admin:string,
    isAdmin?: boolean
}

interface UpdateMemberPayload {
    isAdmin?: boolean,
    DeptName?: string
}

const CreateNewMember = async (payload: CreateMemberPayload) => {
    const Org = await Organization.findOrgById(Number(payload.OrganizationId))

    if (!Org){
        throw new Error("This Organization doesn't exist")
    }

    const AdminMember = await Member.findMemberByUserIdAndOrgId(Number(payload.Admin), Number(payload.OrganizationId))
    if (!AdminMember){
        throw new Error("Admin user not found in this organization")
    }

    if (!AdminMember.isAdmin){
        throw new Error("User is not an admin of this organization")
    }

    const ExistingMember = await Member.findMemberByUserIdAndOrgId(Number(payload.UserId), Number(payload.OrganizationId))
    if (ExistingMember){
        throw new Error("User is already a member of this organization")
    }

    return await Member.CreateMember(Number(payload.OrganizationId), Number(payload.UserId), payload.isAdmin)
}

const GetMemberById = async (id: number) => {
    return await Member.findMemberById(id)
}

const GetMemberByUserId = async (userId: number) => {
    return await Member.findMemberByUserId(userId)
}

const GetMemberByOrgId = async (orgId: number) => {
    return await Member.findMemberByOrgId(orgId)
}

const UpdateMember = async (id: number, data: UpdateMemberPayload) => {
    return await Member.UpdateMemberById(id, data)
}

const DeleteMember = async (id: number) => {
    return await Member.DeleteMemberById(id)
}

export default { CreateNewMember, GetMemberById, GetMemberByUserId, GetMemberByOrgId, UpdateMember, DeleteMember }