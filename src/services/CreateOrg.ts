import Organization from "../models/Organization";
import Member from "../models/Member";

const createOrg = async (OrgName:string, UserId:Number) => {
    const Org = await Organization.CreateOrg(OrgName)
    if (!Org){
        throw new Error("Err in Create Org")
    }

    const Admin = true
    const Mem = await Member.CreateMember(Number(Org.id), Number(UserId), Admin)
    
    return { organization: Org, member: Mem }
}

export default { createOrg }