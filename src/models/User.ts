import supabase from "../config/supabase";

export interface User {
    id: number;
    Email: string;
    Password: string;
    EmailConfirm: boolean;
    IsSSO: boolean;
    MetaDataSSO: Record<string, unknown> | null;
    LastSignin?: string | null;
    IsSuperAdmin: boolean;
    ProfileId: number;
    CreateAt: string;
    UpdateAt: string;
    IsBanned: boolean;
    EmailConfirmToken: string;
}

const findUserByEmail = async (email: string) => {
    const { data: row, error } = await supabase
        .from("User")
        .select("*")
        .eq("Email", email)
        .maybeSingle();

    if (error) throw error;
    return row as User | null;
};

export default { findUserByEmail };
