import Member from "../models/Member";
import Organization from "../models/Organization";
import User from "../models/User";

interface CreateMemberPayload {
    OrganizationId: string,
    email: string,
    Admin: string,
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

    // Look up user by email
    const newUser = await User.findUserByEmail(payload.email)
    if (!newUser){
        throw new Error("User with this email does not exist")
    }

    const ExistingMember = await Member.findMemberByUserIdAndOrgId(Number(newUser.id), Number(payload.OrganizationId))
    if (ExistingMember){
        throw new Error("User is already a member of this organization")
    }

    return await Member.CreateMember(Number(payload.OrganizationId), Number(newUser.id), payload.isAdmin)
}

const GetMemberById = async (id: number) => {
    const member = await Member.findMemberById(id);
    if (!member) {
        throw new Error("Member not found");
    }
    return member;
}

const GetMemberByUserId = async (userId: number) => {
    const members = await Member.findMemberByUserId(userId);
    return await Promise.all(
        members.map(async (member) => {
            const org = await Organization.findOrgById(Number(member.OrganizationId));
            return {
                ...member,
                OrgName: org?.Orgname ?? null
            };
        })
    );
}

const GetMemberByOrgId = async (orgId: number) => {
    return await Member.findMemberByOrgId(orgId);
}

const UpdateMember = async (id: number, requestingUserId: number, data: UpdateMemberPayload) => {
    const targetMember = await Member.findMemberById(id)
    if (!targetMember) {
        throw new Error("Member not found")
    }

    const requestingMember = await Member.findMemberByUserIdAndOrgId(Number(requestingUserId), Number(targetMember.OrganizationId))
    if (!requestingMember) {
        throw new Error("You are not a member of this organization")
    }

    if (!requestingMember.isAdmin && requestingMember.UserId !== targetMember.UserId) {
        throw new Error("Only admins or the account owner can update this member")
    }

    const updatedMember = await Member.UpdateMemberById(id, data);
    if (!updatedMember) {
        throw new Error("Member not found or could not be updated");
    }
    return updatedMember;
}

const DeleteMember = async (id: number, requestingUserId: number) => {
    const targetMember = await Member.findMemberById(id)
    if (!targetMember) {
        throw new Error("Member not found")
    }

    const requestingMember = await Member.findMemberByUserIdAndOrgId(Number(requestingUserId), Number(targetMember.OrganizationId))
    if (!requestingMember) {
        throw new Error("You are not a member of this organization")
    }

    if (!requestingMember.isAdmin && requestingMember.UserId !== targetMember.UserId) {
        throw new Error("Only admins or the account owner can delete this member")
    }

    return await Member.DeleteMemberById(id)
}

export default { CreateNewMember, GetMemberById, GetMemberByUserId, GetMemberByOrgId, UpdateMember, DeleteMember }