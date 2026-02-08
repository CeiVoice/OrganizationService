import supabase from "../config/supabase";

export interface Member {
    id: Number;
    OrganizationId: Number;
    UserId: Number;
    InviteAt: String;
    isAdmin: Boolean;
    DeptName?: String;
}


const CreateMember= async (OrganizationId: number, UserId: number, isAdmin: Boolean = false) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .insert({
            OrganizationId,
            UserId,
            InviteAt: new Date().toISOString(),
            isAdmin
        })
        .select("*")
        .single();

    if (error) throw error;
    return row as Member;
}

const findMemberById = async (id: number) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return row as Member;
}

const findMemberByUserId = async (id: number) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .select("*")
        .eq("UserId", id)
        .single();

    if (error) throw error;
    return row as Member;
}

const findMemberByOrgId = async (id: number) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .select("*")
        .eq("OrganizationId", id)
        .single();

    if (error) throw error;
    return row as Member;
}

const findMemberByUserIdAndOrgId = async (userId: number, orgId: number) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .select("*")
        .eq("UserId", userId)
        .eq("OrganizationId", orgId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
    }
    return row as Member;
}

const UpdateMemberById = async (id:number, data:Partial<Member>) =>{
    const { data: row, error } = await supabase
        .from("Member")
        .update({ ...data })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;
    return row as Member;    
}

const DeleteMemberById = async (id:number) =>{
    const { error } = await supabase
        .from("Member")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return { success: true as const };    
}

export default {CreateMember, findMemberById, findMemberByUserId, findMemberByOrgId, findMemberByUserIdAndOrgId, UpdateMemberById, DeleteMemberById}