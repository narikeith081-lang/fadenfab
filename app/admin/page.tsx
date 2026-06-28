"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  company: string;
  quantity: string;
  message: string;
  status: string;
  created_at: string;
};

const ADMIN_SECRET =
  process.env.NEXT_PUBLIC_ADMIN_SECRET || "";

export default function AdminPage() {

  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [leads, setLeads] = useState<
    Lead[]
  >([]);

  const [filteredLeads, setFilteredLeads] =
    useState<Lead[]>([]);

  const [lastLeadCount, setLastLeadCount] =
    useState(0);

  // ================= FILTERS =================
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ================= AUTH CHECK =================
  useEffect(() => {

    const isAdmin =
      localStorage.getItem(
        "fadenfab_admin"
      );

    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      router.replace("/login");
    }

  }, [router]);

// ================= FETCH LEADS =================
const fetchLeads = useCallback(async () => {
  try {
    setLoading(true);

    const res = await fetch("/api/leads", {
      method: "GET",
      cache: "no-store",
headers: {
  "x-admin-secret":
    "fadenfab_secure_admin_2026",
},
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error(
        `API Error ${res.status}:`,
        errorText
      );

      setLeads([]);
      setFilteredLeads([]);
      setLastLeadCount(0);

      return;
    }

    const data: Lead[] =
      await res.json();

    console.log(
      "Fetched Leads:",
      data
    );

    // 🔔 New Lead Notification
    if (
      lastLeadCount > 0 &&
      data.length > lastLeadCount
    ) {
      const latestLead =
        data[0];

      if (
        "Notification" in window &&
        Notification.permission ===
          "granted"
      ) {
        new Notification(
          "🚀 New Lead Received",
          {
            body: `${latestLead.name} from ${latestLead.company}`,
          }
        );
      }

      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
      );

      audio.play().catch(() => {});
    }

    setLastLeadCount(
      data.length
    );

    // IMPORTANT
    setLeads(data);
    setFilteredLeads(data);

  } catch (err) {

    console.error(
      "Fetch Error:",
      err
    );

    setLeads([]);
    setFilteredLeads([]);
    setLastLeadCount(0);

  } finally {

    setLoading(false);

  }
}, [lastLeadCount]);

  // ================= INITIAL LOAD =================
  useEffect(() => {

    if (!authorized) return;

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    fetchLeads();

    const interval =
      setInterval(() => {
        fetchLeads();
      }, 1000000);

    return () =>
      clearInterval(interval);

  }, [authorized, fetchLeads]);

  // ================= FILTER =================
  useEffect(() => {

    let updatedLeads = [...leads];

    if (statusFilter !== "all") {

      updatedLeads =
        updatedLeads.filter(
          (lead) =>
            lead.status ===
            statusFilter
        );
    }

    if (search.trim()) {

      updatedLeads =
        updatedLeads.filter(
          (lead) =>
            lead.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            lead.company
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            lead.phone.includes(
              search
            )
        );
    }

    setFilteredLeads(
      updatedLeads
    );

  }, [
    search,
    statusFilter,
    leads,
  ]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (
    id: number,
    status: string
  ) => {

    try {

      const res = await fetch(
        "/api/leads",
        {
          method: "PATCH",

          headers: {
  "Content-Type": "application/json",
  "x-admin-secret":
    "fadenfab_secure_admin_2026",
},

          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Update failed"
        );
      }

      fetchLeads();

    } catch (err) {

      console.error(err);

      alert(
        "Failed to update status"
      );

    }

  };

  // ================= DELETE LEAD =================
  const deleteLead = async (
    id: number
  ) => {

    const confirmDelete =
      confirm(
        "Delete this lead permanently?"
      );

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        "/api/leads",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",

            "x-admin-secret":
              "fadenfab_secure_admin_2026",
          },

          body: JSON.stringify({
            id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      fetchLeads();

    } catch (err) {

      console.error(err);

      alert(
        "Delete failed"
      );

    }

  };

  // ================= LOGOUT =================
  const logout = () => {

    localStorage.removeItem(
      "fadenfab_admin"
    );

    localStorage.removeItem(
      "fadenfab_admin_name"
    );

    window.location.href =
      "/login";
  };

  // ================= STATS =================
  const stats = useMemo(() => {

    return {

      total: leads.length,

      new: leads.filter(
        (lead) =>
          lead.status === "new"
      ).length,

      contacted: leads.filter(
        (lead) =>
          lead.status ===
          "contacted"
      ).length,

      closed: leads.filter(
        (lead) =>
          lead.status === "closed"
      ).length,
    };

  }, [leads]);

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1023] to-[#111827] text-white">

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,_rgba(250,204,21,0.12),transparent_30%)]" />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b18]/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)]">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              FADENFAB
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Lead Management Dashboard
            </p>

          </div>

          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:scale-105 hover:from-red-500/30 hover:to-pink-500/30 text-red-200 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-white",
            },

            {
              label: "New",
              value: stats.new,
              color: "text-yellow-400",
            },

            {
              label: "Contacted",
              value: stats.contacted,
              color: "text-cyan-400",
            },

            {
              label: "Closed",
              value: stats.closed,
              color: "text-green-600",
            },
          ].map((item, i) => (

            <motion.div
              key={i}
              whileHover={{
                scale: 1.03,
              }}
              className="bg-gradient-to-br from-[#131c31] to-[#0b1220] border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.08)] hover:border-blue-400/20 transition-all duration-300"
            >

              <p className="text-sm text-gray-400">
                {item.label}
              </p>

              <h2
                className={`text-3xl font-bold mt-2 ${item.color}`}
              >
                {item.value}
              </h2>

            </motion.div>

          ))}

        </div>

        {/* ================= FILTERS ================= */}
        <div className="bg-gradient-to-r from-[#111827] to-[#172033] border border-white/10 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search name, company or phone..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="flex-1 bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
            />

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
            >

              <option value="all">
                All Status
              </option>

              <option value="new">
                New
              </option>

              <option value="contacted">
                Contacted
              </option>

              <option value="closed">
                Closed
              </option>

            </select>

          </div>

        </div>

        {/* ================= TABLE HEADER ================= */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-4 text-sm text-gray-400 border-b border-white/10 mb-3">

          <div className="col-span-2">
            Customer
          </div>

          <div className="col-span-2">
            Phone
          </div>

          <div className="col-span-2">
            Company
          </div>

          <div className="col-span-1">
            Qty
          </div>

          <div className="col-span-3">
            Message
          </div>

          <div className="col-span-1">
            Status
          </div>

          <div className="col-span-1">
            Action
          </div>

        </div>

        {/* ================= LEADS ================= */}
        <div className="space-y-4">
        
          {loading ? (

            <div className="text-center py-20 text-gray-400">
              Loading leads...
            </div>

          ) : filteredLeads.length === 0 ? (

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-gray-400">
              No leads found
            </div>

          ) : (

            filteredLeads.map((lead) => (

              <motion.div
                key={lead.id}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300"
              >

                {/* DESKTOP */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">

                  {/* NAME */}
                  <div className="col-span-2">

                    <p className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-bold text-lg">
                      {lead.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString()}
                    </p>

                  </div>

                  {/* PHONE */}
                  <div className="col-span-2">

                    <p className="text-sm text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1">
                      {lead.phone}
                    </p>

                  </div>

                  {/* COMPANY */}
                  <div className="col-span-2">

                    <p className="text-sm text-gray-500">
                      Company
                    </p>

                    <p className="mt-1">
                      {lead.company}
                    </p>

                  </div>

                  {/* QUANTITY */}
                  <div className="col-span-1">

                    <p className="text-sm text-gray-500">
                      Qty
                    </p>

                    <p className="mt-1">
                      {lead.quantity}
                    </p>

                  </div>

                  {/* MESSAGE */}
                  <div className="col-span-3">

                    <p className="text-sm text-gray-500">
                      Message
                    </p>

                    <p className="mt-1 text-gray-300 truncate">
                      {lead.message || "No message"}
                    </p>

                  </div>

                  {/* STATUS */}
                  <div className="col-span-1">

                    <select
                      value={lead.status}
                      onChange={(e) =>
                        updateStatus(
                          lead.id,
                          e.target.value
                        )
                      }
                      className="w-full bg-[#0b1220] border border-white/10 rounded-x4 px-1 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                    >

                      <option
    value="new"
    className="bg-[#111827] text-yellow-300"
  >
    🟡 New
  </option>

  <option
    value="contacted"
    className="bg-[#111827] text-cyan-300"
  >
    🔵 Contacted
  </option>

  <option
    value="closed"
    className="bg-[#111827] text-green-300"
  >
    🟢 Closed
  </option>

</select>

                  </div>

                  {/* DELETE */}
                  <div className="col-span-1">

                    <button
                      onClick={() =>
                        deleteLead(
                          lead.id
                        )
                      }
                      className="w-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/20 hover:from-red-500/30 hover:to-orange-500/30 text-red-200 py-2 rounded-xl text-sm transition-all duration-300"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </motion.div>

            ))

          )}

        </div>

      </div>

    </main>
  );
}