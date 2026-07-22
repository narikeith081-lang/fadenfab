"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCatalog, saveCatalog, Product, Collection } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import CustomModal from "@/components/CustomModal";
import {
  ShieldCheckIcon,
  CircleStackIcon,
  EnvelopeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  TicketIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

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

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leads" | "inventory" | "users" | "coupons" | "orders">("leads");

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [lastLeadCount, setLastLeadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Catalog state
  const [catalog, setCatalog] = useState<Record<string, Collection>>({});

  // Analytics states
  const [usersAnalytics, setUsersAnalytics] = useState<any[]>([]);
  const [couponsData, setCouponsData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);

  // Orders management states
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [filteredOrdersList, setFilteredOrdersList] = useState<any[]>([]);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");

  // CRUD Product Forms State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ slug: string; product: Product } | null>(null);

  // Add Form State
  const [addName, setAddName] = useState("");
  const [addColor, setAddColor] = useState("");
  const [addFabric, setAddFabric] = useState("");
  const [addGsm, setAddGsm] = useState("");
  const [addStock, setAddStock] = useState("10");
  const [addImage, setAddImage] = useState("");
  const [addSlug, setAddSlug] = useState("oversized-tshirts");

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editFabric, setEditFabric] = useState("");
  const [editGsm, setEditGsm] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState("");

  // Professional Alert modal config
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error" | "info" | "confirm";
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  // ================= AUTH CHECK =================
  useEffect(() => {
    const isAdmin = localStorage.getItem("fadenfab_admin");
    if (isAdmin === "true") {
      setAuthorized(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  // ================= LOAD CATALOG & ANALYTICS =================
  const loadDataStores = useCallback(() => {
    // Catalog
    const data = getCatalog();
    setCatalog(data);

    // Users Analytics fallback initially
    const localAnalytics = JSON.parse(localStorage.getItem("fadenfab_user_analytics") || "[]");
    setUsersAnalytics(localAnalytics);

    // Coupons
    const defaultCoupons = [
      { code: "FADENFAB10", discount: 10, usageCount: 0, users: [] },
      { code: "WELCOME20", discount: 20, usageCount: 0, users: [] },
      { code: "SUPER50", discount: 50, usageCount: 0, users: [] }
    ];
    const savedCoupons = localStorage.getItem("fadenfab_coupons");
    if (!savedCoupons) {
      localStorage.setItem("fadenfab_coupons", JSON.stringify(defaultCoupons));
      setCouponsData(defaultCoupons);
    } else {
      setCouponsData(JSON.parse(savedCoupons));
    }

    // Orders fallback
    setOrdersData([]);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    loadDataStores();

    // Query Supabase orders for real-time sales stats
    const fetchSupabaseOrders = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "order");
      if (data) {
        const mapped = data.map((lead: any) => {
          let companyObj: any = {};
          try {
            companyObj = JSON.parse(lead.company);
          } catch (e) {}
          return {
            id: lead.id.toString(),
            user_id: lead.email,
            created_at: lead.created_at,
            total: parseFloat(lead.quantity) || 0,
            status: lead.message,
            items: companyObj.items || [],
            shipping_address: companyObj.shipping_address || {},
            payment_method: companyObj.payment_method || "N/A",
            transaction_id: companyObj.transaction_id || null
          };
        });
        setOrdersData(mapped);
      } else {
        setOrdersData([]);
      }
    };
    fetchSupabaseOrders();
  }, [authorized, loadDataStores]);

  // ================= FETCH LEADS =================
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads", {
        method: "GET",
        cache: "no-store",
        headers: {
          "x-admin-secret": "fadenfab_secure_admin_2026"
        }
      });

      if (!res.ok) {
        setLeads([]);
        setFilteredLeads([]);
        setLastLeadCount(0);
        return;
      }

      const data: Lead[] = await res.json();

      // Separate contacts from registered users (status === "user")
      const contactLeads = data.filter(l => l.status !== "user");
      const userLeads = data.filter(l => l.status === "user");

      // Set user analytics from Supabase leads sync table
      const formattedUsers = userLeads.map((u: any) => {
        let usageSeconds = 120; // default placeholder
        if (u.message && u.message.includes("Usage: ")) {
          usageSeconds = parseInt(u.message.replace("Usage: ", "").replace("s", "")) || 120;
        }
        return {
          email: u.email || "N/A",
          name: u.name || "App User",
          mobile: u.phone || "N/A",
          registeredAt: u.created_at || new Date().toISOString(),
          purchaseCount: parseInt(u.quantity || "0"),
          usageTime: usageSeconds,
          mockPassword: u.company || "••••••••"
        };
      });
      setUsersAnalytics(formattedUsers);

      // New Lead Notification (contacts only)
      if (lastLeadCount > 0 && contactLeads.length > lastLeadCount) {
        const latestLead = contactLeads[0];

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚀 New Lead Received", {
            body: `${latestLead.name} from ${latestLead.company}`
          });
        }

        const audio = new Audio(
          "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
        );
        audio.play().catch(() => {});
      }

      setLastLeadCount(contactLeads.length);
      setLeads(contactLeads);
      setFilteredLeads(contactLeads);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLeads([]);
      setFilteredLeads([]);
      setLastLeadCount(0);
    } finally {
      setLoading(false);
    }
  }, [lastLeadCount]);

  // ================= FETCH ORDERS =================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "x-admin-secret": "fadenfab_secure_admin_2026"
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      setOrdersList(data || []);
      setFilteredOrdersList(data || []);
      setOrdersData(data || []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (!authorized) return;

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    fetchLeads();
    fetchOrders();

    const interval = setInterval(() => {
      fetchLeads();
      fetchOrders();
    }, 60000); // Check for new leads every minute

    return () => clearInterval(interval);
  }, [authorized, fetchLeads, fetchOrders]);

  // ================= FILTER LEADS =================
  useEffect(() => {
    let updatedLeads = [...leads];

    if (statusFilter !== "all") {
      updatedLeads = updatedLeads.filter((lead) => lead.status === statusFilter);
    }

    if (search.trim()) {
      updatedLeads = updatedLeads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          lead.company.toLowerCase().includes(search.toLowerCase()) ||
          lead.phone.includes(search)
      );
    }

    setFilteredLeads(updatedLeads);
  }, [search, statusFilter, leads]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "fadenfab_secure_admin_2026"
        },
        body: JSON.stringify({ id, status })
      });

      if (!res.ok) throw new Error("Update failed");
      
      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Status Updated",
        message: "Lead status updated successfully.",
        onConfirm: () => {
          setModalConfig(null);
          fetchLeads();
        }
      });
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Could not update lead status. Please try again.",
        onConfirm: () => setModalConfig(null)
      });
    }
  };

  // ================= DELETE LEAD =================
  const deleteLead = (id: number) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: "Delete Lead?",
      message: "Are you sure you want to permanently delete this lead? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onCancel: () => setModalConfig(null),
      onConfirm: async () => {
        try {
          const res = await fetch("/api/leads", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": "fadenfab_secure_admin_2026"
            },
            body: JSON.stringify({ id })
          });

          if (!res.ok) throw new Error("Delete failed");

          setModalConfig({
            isOpen: true,
            type: "success",
            title: "Deleted!",
            message: "Lead has been deleted permanently.",
            onConfirm: () => {
              setModalConfig(null);
              fetchLeads();
            }
          });
        } catch (err) {
          console.error(err);
          setModalConfig({
            isOpen: true,
            type: "error",
            title: "Deletion Failed",
            message: "Could not delete lead. Please try again.",
            onConfirm: () => setModalConfig(null)
          });
        }
      }
    });
  };



  // ================= UPDATE ORDER STATUS =================
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "fadenfab_secure_admin_2026"
        },
        body: JSON.stringify({ id, status })
      });

      if (!res.ok) throw new Error("Update failed");

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Order Updated",
        message: `Order status successfully changed to "${status}".`,
        onConfirm: () => {
          setModalConfig(null);
          fetchOrders();
        }
      });
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Could not update order status.",
        onConfirm: () => setModalConfig(null)
      });
    }
  };

  // ================= CANCEL/DELETE ORDER =================
  const cancelOrder = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: "Cancel Order?",
      message: `Are you sure you want to permanently cancel and delete order: "${id}"? This action cannot be undone.`,
      confirmText: "Cancel Order",
      cancelText: "Keep Order",
      onCancel: () => setModalConfig(null),
      onConfirm: async () => {
        try {
          const res = await fetch("/api/orders", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": "fadenfab_secure_admin_2026"
            },
            body: JSON.stringify({ id })
          });

          if (!res.ok) throw new Error("Cancel failed");

          setModalConfig({
            isOpen: true,
            type: "success",
            title: "Order Cancelled",
            message: "The order has been cancelled and deleted successfully.",
            onConfirm: () => {
              setModalConfig(null);
              fetchOrders();
            }
          });
        } catch (err) {
          console.error(err);
          setModalConfig({
            isOpen: true,
            type: "error",
            title: "Cancellation Failed",
            message: "Could not cancel order. Please try again.",
            onConfirm: () => setModalConfig(null)
          });
        }
      }
    });
  };

  // ================= FILTER ORDERS =================
  useEffect(() => {
    let updated = [...ordersList];

    if (ordersStatusFilter !== "all") {
      updated = updated.filter((o) => o.status === ordersStatusFilter);
    }

    if (ordersSearch.trim()) {
      const q = ordersSearch.toLowerCase();
      updated = updated.filter(
        (o) =>
          o.id.toString().toLowerCase().includes(q) ||
          (o.shipping_address?.fullName || "").toLowerCase().includes(q) ||
          (o.shipping_address?.mobile || "").includes(q) ||
          (o.payment_method || "").toLowerCase().includes(q) ||
          (o.transaction_id || "").toLowerCase().includes(q)
      );
    }

    setFilteredOrdersList(updated);
  }, [ordersSearch, ordersStatusFilter, ordersList]);

  // ================= ADD PRODUCT (CREATE) =================
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addStock.trim()) {
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Missing Fields",
        message: "Name and Stock are required fields.",
        onConfirm: () => setModalConfig(null)
      });
      return;
    }

    const updatedCatalog = { ...catalog };
    if (!updatedCatalog[addSlug]) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Target collection slug not found.",
        onConfirm: () => setModalConfig(null)
      });
      return;
    }

    const productsList = updatedCatalog[addSlug].products || [];
    const newId = productsList.length > 0 ? Math.max(...productsList.map(p => p.id)) + 1 : 1;

    const newProduct: Product = {
      id: newId,
      name: addName,
      image: addImage.trim() || "/classicneverdies.webp",
      color: addColor.trim() ? `Color: ${addColor}` : "",
      fabric: addFabric.trim() ? `Material: ${addFabric}` : "",
      gsm: addGsm.trim() ? `${addGsm} GSM` : "240–280 GSM",
      stock: Number(addStock)
    };

    updatedCatalog[addSlug].products.push(newProduct);
    saveCatalog(updatedCatalog);
    setCatalog(updatedCatalog);
    setIsAddOpen(false);

    setAddName("");
    setAddColor("");
    setAddFabric("");
    setAddGsm("");
    setAddStock("10");
    setAddImage("");

    setModalConfig({
      isOpen: true,
      type: "success",
      title: "Product Added",
      message: `${newProduct.name} successfully added to the catalog!`,
      onConfirm: () => setModalConfig(null)
    });
  };

  // ================= EDIT PRODUCT (UPDATE) =================
  const startEditProduct = (slug: string, product: Product) => {
    setEditingProduct({ slug, product });
    setEditName(product.name);
    setEditColor(product.color.replace("Color: ", ""));
    setEditFabric(product.fabric.replace("Material: ", ""));
    setEditGsm(product.gsm.replace(" GSM", ""));
    setEditStock(product.stock.toString());
    setEditImage(product.image);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const { slug, product } = editingProduct;
    if (!editName.trim() || !editStock.trim()) {
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Missing Fields",
        message: "Name and Stock are required fields.",
        onConfirm: () => setModalConfig(null)
      });
      return;
    }

    const updatedCatalog = { ...catalog };
    const productsList = updatedCatalog[slug].products;
    const index = productsList.findIndex(p => p.id === product.id);

    if (index > -1) {
      productsList[index] = {
        id: product.id,
        name: editName,
        image: editImage,
        color: editColor.trim() ? `Color: ${editColor}` : "",
        fabric: editFabric.trim() ? `Material: ${editFabric}` : "",
        gsm: editGsm.trim() ? `${editGsm} GSM` : "240–280 GSM",
        stock: Number(editStock)
      };

      saveCatalog(updatedCatalog);
      setCatalog(updatedCatalog);
      setEditingProduct(null);

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Product Updated",
        message: "Product specifications updated successfully.",
        onConfirm: () => setModalConfig(null)
      });
    }
  };

  // ================= REMOVE PRODUCT (DELETE) =================
  const handleRemoveProduct = (slug: string, product: Product) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: "Remove Product?",
      message: `Are you sure you want to permanently remove "${product.name}" from the collection?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onCancel: () => setModalConfig(null),
      onConfirm: () => {
        const updatedCatalog = { ...catalog };
        updatedCatalog[slug].products = updatedCatalog[slug].products.filter(p => p.id !== product.id);
        
        saveCatalog(updatedCatalog);
        setCatalog(updatedCatalog);
        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Removed Successfully",
          message: `${product.name} removed from the catalog.`,
          onConfirm: () => setModalConfig(null)
        });
      }
    });
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("fadenfab_admin");
    localStorage.removeItem("fadenfab_admin_name");
    window.location.href = "/login";
  };

  // ================= STATS =================
  const stats = useMemo(() => {
    return {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "new").length,
      totalUsers: usersAnalytics.length,
      totalSales: ordersData.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      usageHours: Math.round(usersAnalytics.reduce((sum: number, u: any) => sum + (u.usageTime || 0), 0) / 3600 * 10) / 10,
      totalCouponsUsed: couponsData.reduce((sum: number, c: any) => sum + (c.usageCount || 0), 0)
    };
  }, [leads, usersAnalytics, ordersData, couponsData]);

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1023] to-[#111827] text-white pb-24">
      {/* Background glows */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_left,_rgba(250,204,21,0.12),transparent_30%)]" />

      {/* Reusable Custom Modal */}
      {modalConfig && (
        <CustomModal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
        />
      )}

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b18]/80 backdrop-blur-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              FADENFAB
            </h1>
            <p className="text-sm text-gray-400 mt-1">Admin Management Dashboard</p>
          </div>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:scale-105 hover:from-red-500/30 hover:to-pink-500/30 text-red-200 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= CONTENT CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ================= TAB CONTROLS ================= */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === "leads"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Manage Contacts/Leads ({stats.totalLeads})</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === "inventory"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <CircleStackIcon className="w-5 h-5" />
            <span>🔐 Catalog Products (Confidential)</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === "users"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            <span>👤 Users & Telemetry Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === "coupons"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <TicketIcon className="w-5 h-5" />
            <span>🎟️ Coupon Redemptions</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>📦 Order Management ({ordersList.length})</span>
          </button>
        </div>

        {/* ================= STATS OVERVIEW CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#131c31] to-[#0b1220] border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <p className="text-sm text-gray-400">Total Registered Users</p>
            <h2 className="text-3xl font-bold mt-2 text-cyan-400">{stats.totalUsers}</h2>
          </div>
          <div className="bg-gradient-to-br from-[#131c31] to-[#0b1220] border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <p className="text-sm text-gray-400">Total Sales Volume</p>
            <h2 className="text-3xl font-bold mt-2 text-green-400">₹{stats.totalSales.toLocaleString()}</h2>
          </div>
          <div className="bg-gradient-to-br from-[#131c31] to-[#0b1220] border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <p className="text-sm text-gray-400">Active Site Usage</p>
            <h2 className="text-3xl font-bold mt-2 text-yellow-400">{stats.usageHours} hrs</h2>
          </div>
          <div className="bg-gradient-to-br from-[#131c31] to-[#0b1220] border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <p className="text-sm text-gray-400">Coupons Used</p>
            <h2 className="text-3xl font-bold mt-2 text-amber-400">{stats.totalCouponsUsed} times</h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "leads" ? (
            /* ================= LEADS TAB ================= */
            <motion.div
              key="leads-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* FILTERS */}
              <div className="bg-gradient-to-r from-[#111827] to-[#172033] border border-white/10 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
                <div className="flex flex-col lg:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search contact name, company or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                  >
                    <option value="all">All Contacts Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* TABLE HEADER */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-4 text-sm text-gray-400 border-b border-white/10 mb-3 font-semibold">
                <div className="col-span-2">Contact User</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-3">Message Details</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* LEADS LIST */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-20 text-gray-400 font-medium">Loading contacts...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-gray-400">
                    No leads or contact inquiries found
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    let isOrder = false;
                    let orderDetails: any = null;
                    if (lead.company && lead.company.trim().startsWith("{")) {
                      try {
                        orderDetails = JSON.parse(lead.company);
                        isOrder = true;
                      } catch (e) {
                        isOrder = false;
                      }
                    }

                    return (
                      <motion.div
                        key={lead.id}
                        className={`bg-gradient-to-br from-[#111827] to-[#0f172a] border rounded-2xl p-5 transition-all duration-300 ${
                          isOrder 
                            ? "border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]" 
                            : "border-white/10 hover:border-green-500/20 hover:shadow-[0_0_25px_rgba(34,197,94,0.1)]"
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Contact User */}
                          <div className="col-span-2">
                            <p className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-bold text-lg flex items-center gap-1.5">
                              {isOrder && <span className="text-sm shrink-0">🛒</span>}
                              {lead.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </p>
                            {lead.email && (
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{lead.email}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="col-span-2 text-sm text-slate-300 font-medium">
                            {lead.phone || "N/A"}
                          </div>

                          {/* Company / Items */}
                          <div className="col-span-2 text-sm">
                            {isOrder && orderDetails ? (
                              <div className="text-xs space-y-1 bg-white/5 border border-white/5 p-2 rounded-xl max-h-[140px] overflow-y-auto scrollbar-none">
                                <span className="font-bold text-cyan-400 block text-[9px] uppercase tracking-wider mb-1">📦 Order Items</span>
                                {orderDetails.items && orderDetails.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between gap-2 border-b border-white/5 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                                    <span className="truncate text-slate-300 text-xs" title={item.name}>{item.name}</span>
                                    <span className="shrink-0 font-bold text-slate-400 text-xs">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300">{lead.company || "N/A"}</span>
                            )}
                          </div>

                          {/* Quantity / Amount */}
                          <div className="col-span-1 text-center font-bold">
                            {isOrder ? (
                              <span className="text-green-400 text-sm">₹{lead.quantity}</span>
                            ) : (
                              <span className="text-slate-300 text-sm">{lead.quantity || 0}</span>
                            )}
                          </div>

                          {/* Message / Shipping Address */}
                          <div className="col-span-3 text-sm">
                            {isOrder && orderDetails ? (
                              <div className="text-[11px] space-y-1.5 bg-white/5 border border-white/5 p-2 rounded-xl max-h-[140px] overflow-y-auto scrollbar-none">
                                {orderDetails.shipping_address && (
                                  <div>
                                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">📍 Shipping Address</span>
                                    <p className="text-slate-300 leading-tight">
                                      {orderDetails.shipping_address.street}, {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} - {orderDetails.shipping_address.pincode}
                                    </p>
                                  </div>
                                )}
                                {orderDetails.payment_method && (
                                  <div className="pt-1 border-t border-white/5 text-[10px] text-slate-400 flex flex-wrap justify-between items-center gap-1">
                                    <span>Pay: <strong className="text-slate-300">{orderDetails.payment_method}</strong></span>
                                    {orderDetails.transaction_id && (
                                      <span className="text-cyan-400 font-mono">UTR: {orderDetails.transaction_id}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-300 truncate" title={lead.message || ""}>
                                {lead.message || "No message"}
                              </div>
                            )}
                          </div>

                          {/* Status Select */}
                          <div className="col-span-1">
                            {isOrder ? (
                              <select
                                value={lead.message || "Processing"}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const res = await fetch("/api/leads", {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                        "x-admin-secret": "fadenfab_secure_admin_2026"
                                      },
                                      body: JSON.stringify({ id: lead.id, message: newStatus })
                                    });
                                    if (!res.ok) throw new Error("Update failed");
                                    setModalConfig({
                                      isOpen: true,
                                      type: "success",
                                      title: "Order Status Updated",
                                      message: `Order tracking status successfully changed to "${newStatus}".`,
                                      onConfirm: () => {
                                        setModalConfig(null);
                                        fetchLeads();
                                      }
                                    });
                                  } catch (err) {
                                    console.error(err);
                                    setModalConfig({
                                      isOpen: true,
                                      type: "error",
                                      title: "Update Failed",
                                      message: "Could not update order status.",
                                      onConfirm: () => setModalConfig(null)
                                    });
                                  }
                                }}
                                className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-slate-300 font-semibold"
                              >
                                <option value="Processing" className="bg-[#111827] text-yellow-300">🟡 Processing</option>
                                <option value="Shipped" className="bg-[#111827] text-blue-300">🔵 Shipped</option>
                                <option value="Delivered" className="bg-[#111827] text-green-300">🟢 Delivered</option>
                              </select>
                            ) : (
                              <select
                                value={lead.status}
                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-2 py-2 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-slate-300"
                              >
                                <option value="new" className="bg-[#111827] text-yellow-300">🟡 New</option>
                                <option value="contacted" className="bg-[#111827] text-cyan-300">🔵 Contacted</option>
                                <option value="closed" className="bg-[#111827] text-green-300">🟢 Closed</option>
                              </select>
                            )}
                          </div>

                          {/* Action Delete */}
                          <div className="col-span-1">
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="w-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/20 hover:from-red-500/30 hover:to-orange-500/30 text-red-200 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : activeTab === "inventory" ? (
            /* ================= INVENTORY TAB ================= */
            <motion.div
              key="inventory-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="bg-gradient-to-r from-purple-900/10 to-indigo-950/20 border border-purple-500/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-10 h-10 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-purple-300">🔐 Confidential Catalog CRUD Panel</h3>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      Easily add new designs, edit specifications, modify stock levels, or remove products permanently from FADENFAB.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-2xl text-sm font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  <span>Add Product</span>
                </button>
              </div>

              {Object.keys(catalog).map((slug) => {
                const category = catalog[slug];
                return (
                  <div key={slug} className="space-y-5">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text uppercase tracking-wider">
                      {category.title} ({category.products ? category.products.length : 0} items)
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.products && category.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-[#111827] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300 flex items-center gap-4 relative group"
                        >
                          <div className="w-16 h-20 bg-white/5 border border-white/10 rounded-lg p-1 shrink-0 flex items-center justify-center relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <span className="text-2xl text-slate-500">👕</span>
                            )}
                          </div>

                          <div className="flex-grow min-w-0 pr-12">
                            <h4 className="font-bold text-sm truncate" title={product.name}>
                              {product.name}
                            </h4>
                            <p className="text-xs text-purple-400 mt-1 font-semibold">
                              {product.gsm} | {product.color ? product.color.replace("Color: ", "") : "No Color"}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5" title={product.fabric}>
                              {product.fabric ? product.fabric.replace("Material: ", "") : "Standard Fabric"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">Stock:</span>
                              <span className={`text-xs font-extrabold ${product.stock <= 5 ? "text-red-400 animate-pulse" : "text-green-400"}`}>
                                {product.stock} units
                              </span>
                            </div>
                          </div>

                          <div className="absolute right-4 top-4 flex flex-col gap-2">
                            <button
                              onClick={() => startEditProduct(slug, product)}
                              className="p-1.5 bg-slate-800 hover:bg-[#0D4A86] text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(slug, product)}
                              className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                              title="Delete Product"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : activeTab === "users" ? (
            /* ================= USERS ANALYTICS TAB ================= */
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-teal-300">👤 User Accounts & Telemetry Directory</h3>
              {usersAnalytics.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-gray-400">
                  No registered users or active telemetry logs found yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersAnalytics.map((u, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:border-teal-400/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-extrabold text-lg text-teal-400">{u.name || "App User"}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Active since: {new Date(u.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-1 rounded-full font-bold">Client</span>
                      </div>
                      
                      <div className="space-y-2.5 text-sm border-t border-white/5 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Email ID:</span>
                          <span className="font-medium text-slate-200 truncate max-w-[160px]" title={u.email}>{u.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Password:</span>
                          <span className="font-medium text-teal-300 font-mono tracking-wider">{u.mockPassword || "••••••••"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Phone Mobile:</span>
                          <span className="font-medium text-slate-200">{u.mobile || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session Usage:</span>
                          <span className="font-bold text-yellow-400">
                            {u.usageTime >= 60
                              ? `${Math.round(u.usageTime / 60)} mins`
                              : `${u.usageTime || 0} secs`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Purchase Count:</span>
                          <span className="font-bold text-green-400">{u.purchaseCount || 0} Orders placed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === "coupons" ? (
            /* ================= COUPONS TAB ================= */
            <motion.div
              key="coupons-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-amber-300">🎟️ Active Coupon Campaigns & Usage Logs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {couponsData.map((coupon, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:border-amber-400/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                      <h4 className="font-extrabold text-lg text-amber-400 font-mono tracking-widest uppercase">
                        {coupon.code}
                      </h4>
                      <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold">
                        {coupon.discount}% Discount
                      </span>
                    </div>

                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Redeem Count:</span>
                        <span className="font-bold text-slate-200">{coupon.usageCount || 0} times</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-gray-400 text-xs font-bold block mb-1">Applied By Users:</span>
                        {coupon.users && coupon.users.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                            {coupon.users.map((email: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-white/5 font-semibold"
                              >
                                {email}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic block">Not applied by any user yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ================= ORDERS TAB ================= */
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* FILTERS */}
              <div className="bg-gradient-to-r from-[#111827] to-[#172033] border border-white/10 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.08)]">
                <div className="flex flex-col lg:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by Order ID, Recipient name, mobile, payment method, or transaction ID..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="flex-1 bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none text-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-sm"
                  />
                  <select
                    value={ordersStatusFilter}
                    onChange={(e) => setOrdersStatusFilter(e.target.value)}
                    className="bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 outline-none text-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-sm font-semibold"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="Processing">🟡 Processing</option>
                    <option value="Shipped">🔵 Shipped</option>
                    <option value="Delivered">🟢 Delivered</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                </div>
              </div>

              <h3 className="text-xl font-bold text-green-300">📦 Order Management Directory</h3>
              {filteredOrdersList.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-gray-400">
                  No orders found.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrdersList.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 hover:border-green-400/20 transition-all duration-300"
                    >
                      {/* Order Info Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-white/5 pb-4 mb-4 text-sm">
                        <div>
                          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Order ID</span>
                          <span className="font-bold text-slate-200 block break-all text-xs font-mono">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Customer & Address</span>
                          <span className="font-bold text-slate-200 block">
                            {order.shipping_address?.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-gray-400 block mt-0.5 font-semibold">
                            Mobile: {order.shipping_address?.mobile || "N/A"}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-1 leading-relaxed">
                            {order.shipping_address?.street || "N/A"}, {order.shipping_address?.city || "N/A"}, {order.shipping_address?.state || "N/A"} - {order.shipping_address?.pincode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Payment & Total</span>
                          <span className="font-bold text-slate-200 block">
                            {order.payment_method || "N/A"}
                          </span>
                          {order.transaction_id && (
                            <span className="text-xs text-yellow-400 font-mono block mt-1 font-semibold">
                              UTR: {order.transaction_id}
                            </span>
                          )}
                          <span className="text-sm text-green-400 font-extrabold block mt-1">
                            Total Paid: ₹{order.total}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Status Management</span>
                          <div className="flex gap-2 items-center mt-1">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-[#0b1220] border border-white/10 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-slate-200 font-bold"
                            >
                              <option value="Processing">🟡 Processing</option>
                              <option value="Shipped">🔵 Shipped</option>
                              <option value="Delivered">🟢 Delivered</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition cursor-pointer"
                              title="Delete/Cancel Order"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3">
                        <span className="text-xs text-gray-400 font-bold uppercase block">Items Ordered</span>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {order.items && order.items.map((item: any, i: number) => (
                            <div key={i} className="flex gap-3 bg-white/5 border border-white/5 rounded-2xl p-3 items-center">
                              <div className="w-12 h-14 bg-white/5 border border-white/10 rounded-lg p-1 shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="object-contain w-full h-full"
                                  />
                                ) : (
                                  <span className="text-xl">👕</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-grow">
                                <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Qty: {item.quantity} | {item.fabric || "Premium Fabric"}
                                </p>
                                <p className="text-[10px] text-gray-500">{item.color || "Selected Color"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}`
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= ADD PRODUCT MODAL ================= */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl p-6 shadow-2xl border border-white/10"
            >
              <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                <PlusIcon className="w-6 h-6 text-purple-400" />
                <span>Add Product to Catalog</span>
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-bold">Select Collection</label>
                  <select
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                  >
                    <option value="oversized-tshirts">Oversized T-Shirts</option>
                    <option value="hoodies">Premium Hoodies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Never Dies"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Faded Black"
                      value={addColor}
                      onChange={(e) => setAddColor(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">GSM Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 240–280"
                      value={addGsm}
                      onChange={(e) => setAddGsm(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-bold">Fabric Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Premium Heavyweight Cotton"
                    value={addFabric}
                    onChange={(e) => setAddFabric(e.target.value)}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Initial Stock Level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={addStock}
                      onChange={(e) => setAddStock(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Image URL Path</label>
                    <input
                      type="text"
                      placeholder="e.g. /classicneverdies.webp"
                      value={addImage}
                      onChange={(e) => setAddImage(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="border border-white/10 hover:bg-white/5 text-gray-400 px-5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold transition cursor-pointer shadow shadow-purple-600/10"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0f172a] rounded-3xl p-6 shadow-2xl border border-white/10"
            >
              <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                <PencilIcon className="w-6 h-6 text-purple-400" />
                <span>Edit Product Specifications</span>
              </h3>

              <form onSubmit={handleUpdateProduct} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Never Dies"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Faded Black"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">GSM Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 240–280"
                      value={editGsm}
                      onChange={(e) => setEditGsm(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-bold">Fabric Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Premium Heavyweight Cotton"
                    value={editFabric}
                    onChange={(e) => setEditFabric(e.target.value)}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-bold">Image URL Path</label>
                    <input
                      type="text"
                      placeholder="e.g. /classicneverdies.webp"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="border border-white/10 hover:bg-white/5 text-gray-400 px-5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold transition cursor-pointer shadow shadow-purple-600/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}