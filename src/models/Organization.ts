import supabase from "../config/supabase";


export interface Organization {
    id: number;
    Orgname: string;
    CreateAt: string;
    UpdateAt: string;
}


const CreateOrg = async (Orgname: string) =>{
    const { data: row, error } = await supabase
        .from("Organization")
        .insert({ Orgname })
        .select("*")
        .single();

    if (error) throw error;
    return row as Organization;
}

const findOrgById = async (id: number) => {
    const { data: row, error } = await supabase
        .from("Organization")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
    }
    return row as Organization;
}

const UpdateOrgById = async (id:number, data:Organization) => {
    const { data: row, error } = await supabase
        .from("Organization")
        .update({ ...data, UpdateAt: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
    }
    return row as Organization;    
}

const DeleteOrgById = async (id:number) =>{
    const { error } = await supabase
        .from("Organization")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return { success: true as const };    
}

export default {CreateOrg, findOrgById, UpdateOrgById, DeleteOrgById}