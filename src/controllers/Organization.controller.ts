import CreateOrg from "../services/CreateOrg";
import Organization from "../models/Organization";
import Member from "../models/Member";


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

const GetOrgsByUserId = async (userId: number) => {
    // Get all memberships for the user
    const members = await Member.findMemberByUserId(userId);
    
    if (!members || members.length === 0) {
        return [];
    }

    // Get the organizations for all the memberships
    const organizationIds = members.map(member => Number(member.OrganizationId));
    const organizations = [];
    
    for (const orgId of organizationIds) {
        try {
            const org = await Organization.findOrgById(orgId);
            if (org) {
                organizations.push(org);
            }
        } catch (error) {
            // Continue if organization not found
            console.warn(`Organization with ID ${orgId} not found`);
        }
    }
    
    return organizations;
}

const UpdateOrg = async (id: number, requestingUserId: number, data: Partial<{ Orgname: string }>) => {

    const org = await Organization.findOrgById(id)
    if (!org) {
        throw new Error("Organization not found")
    }

    const requestingMember = await Member.findMemberByUserIdAndOrgId(requestingUserId, id)
    if (!requestingMember) {
        throw new Error("You are not a member of this organization")
    }

    if (!requestingMember.isAdmin) {
        throw new Error("Only admins can update this organization")
    }

    return await Organization.UpdateOrgById(id, data as any)
}

const DeleteOrg = async (id: number, requestingUserId: number) => {
    const org = await Organization.findOrgById(id)
    if (!org) {
        throw new Error("Organization not found")
    }

    const requestingMember = await Member.findMemberByUserIdAndOrgId(requestingUserId, id)
    if (!requestingMember) {
        throw new Error("You are not a member of this organization")
    }

    if (!requestingMember.isAdmin) {
        throw new Error("Only admins can delete this organization")
    }

    return await Organization.DeleteOrgById(id)
}

export default { CreateNewOrg, GetOrgById, GetOrgsByUserId, UpdateOrg, DeleteOrg }