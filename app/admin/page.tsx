"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  quantity: string;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);

  // ✅ AUTH CHECK
  useEffect(() => {
    const isAdmin = localStorage.getItem("threads_admin");

    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  // ✅ FETCH LEADS
  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();

      setLeads(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ✅ LOAD LEADS AFTER AUTH
  useEffect(() => {
    if (authorized) {
      fetchLeads();
    }
  }, [authorized]);

  // ✅ UPDATE STATUS
  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ PREVENT PAGE FLASH
  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-4xl font-bold text-yellow-400">
            THREADS ADMIN
          </h1>

          <p className="text-gray-400 mt-2">
            Manage all customer inquiries
          </p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("threads_admin");
            router.push("/login");
          }}
          className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">
            Loading leads...
          </p>
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-white/10">

          <table className="w-full min-w-[900px]">

            {/* TABLE HEADER */}
            <thead className="bg-white/10 text-yellow-400">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Requirement</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>

              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center p-10 text-gray-400"
                  >
                    No inquiries yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">{lead.name}</td>

                    <td className="p-4">
                      {lead.phone}
                    </td>

                    <td className="p-4">
                      {lead.email || "N/A"}
                    </td>

                    <td className="p-4">
                      {lead.company}
                    </td>

                    <td className="p-4">
                      {lead.quantity}
                    </td>

                    <td className="p-4 max-w-[300px]">
                      {lead.message}
                    </td>

                    <td className="p-4">
                      <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                        {lead.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            updateStatus(lead.id, "contacted")
                          }
                          className="bg-blue-500 hover:bg-blue-600 transition px-3 py-2 rounded-lg text-sm"
                        >
                          Contacted
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(lead.id, "closed")
                          }
                          className="bg-green-500 hover:bg-green-600 transition px-3 py-2 rounded-lg text-sm"
                        >
                          Closed
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}