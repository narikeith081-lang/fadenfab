"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import UserNavbar from "@/components/UserNavbar";

export default function UserNavbar(){

    const [user,setUser]=useState<any>(null);

    useEffect(()=>{

        supabase.auth.getUser().then(({data})=>{
            setUser(data.user);
        });

    },[]);

    const logout=async()=>{

        await supabase.auth.signOut();

        window.location.reload();

    }

    return(

        <>
            {user ? (

                <div className="flex items-center gap-4">

                    <span className="font-semibold">

                        {user.email}

                    </span>

                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-5 py-2 rounded-full"
                    >
                        Logout
                    </button>

                </div>

            ) : (

                <UserNavbar
                    href="/userlogin"
                    className="bg-[#0D4A86] text-white px-6 py-3 rounded-full font-bold"
                >
                    Login
                </UserNavbar>

            )}
        </>

    )

}