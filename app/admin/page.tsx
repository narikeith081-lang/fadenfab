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
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      
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

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white p-6 flex-col justify-between h-screen sticky top-0 shrink-0">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-widest text-[#0D4A86]" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
              FADENFAB
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Admin Dashboard</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeTab === "leads"
                  ? "bg-[#0D4A86]/10 text-[#0D4A86]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <EnvelopeIcon className="w-5 h-5 shrink-0" />
              <span>Inquiries & Leads</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-[#0D4A86]/10 text-[#0D4A86]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <CircleStackIcon className="w-5 h-5 shrink-0" />
              <span>Catalog Products</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#0D4A86]/10 text-[#0D4A86]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <UsersIcon className="w-5 h-5 shrink-0" />
              <span>User Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeTab === "coupons"
                  ? "bg-[#0D4A86]/10 text-[#0D4A86]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <TicketIcon className="w-5 h-5 shrink-0" />
              <span>Coupons Used</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#0D4A86]/10 text-[#0D4A86]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ShoppingBagIcon className="w-5 h-5 shrink-0" />
              <span>Order Management</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl text-sm font-bold transition duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          Logout Session
        </button>
      </aside>

      {/* ================= MOBILE HEADER & TAB BAR ================= */}
      <div className="lg:hidden flex flex-col w-full min-w-0 bg-white border-b border-slate-200 sticky top-0 z-40 overflow-hidden">
        <header className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-widest text-[#0D4A86]" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
              FADENFAB
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Admin Portal</p>
          </div>
          <button
            onClick={logout}
            className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold"
          >
            Logout
          </button>
        </header>

        {/* Scrollable Horizontal Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none w-full max-w-full">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
              activeTab === "leads" ? "bg-[#0D4A86] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Leads ({stats.totalLeads})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
              activeTab === "inventory" ? "bg-[#0D4A86] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
              activeTab === "users" ? "bg-[#0D4A86] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
              activeTab === "coupons" ? "bg-[#0D4A86] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition-all ${
              activeTab === "orders" ? "bg-[#0D4A86] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Orders ({ordersList.length})
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT WINDOW ================= */}
      <main className="flex-grow min-w-0 px-4 lg:px-8 py-5 lg:py-8 w-full max-w-7xl mx-auto">

        {/* ================= STATS CARD PANELS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Users</p>
            <h2 className="text-2xl font-black mt-2 text-[#0D4A86]">{stats.totalUsers}</h2>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Sales</p>
            <h2 className="text-2xl font-black mt-2 text-emerald-600">₹{stats.totalSales.toLocaleString()}</h2>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Site Usage</p>
            <h2 className="text-2xl font-black mt-2 text-amber-600">{stats.usageHours} hrs</h2>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Campaign Coupons</p>
            <h2 className="text-2xl font-black mt-2 text-indigo-600">{stats.totalCouponsUsed} times</h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "leads" ? (
            /* ================= INQUIRIES TAB ================= */
            <motion.div
              key="leads-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* FILTERS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search contact name, company or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0D4A86] focus:bg-white transition"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 font-semibold"
                  >
                    <option value="all">All Contacts Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* TABLE HEADER (Desktop Only) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2 text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                <div className="col-span-2">Contact User</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-3">Message Details</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* INQUIRIES LIST */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-2xl border border-slate-200 shadow-sm">Loading contacts...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
                    No leads or contact inquiries found.
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
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
                          isOrder ? "border-sky-200" : "border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* User Column */}
                          <div className="col-span-2">
                            <p className="font-bold text-slate-800 text-base flex items-center gap-1.5 truncate">
                              {isOrder && <span className="text-sm shrink-0">🛒</span>}
                              {lead.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </p>
                            {lead.email && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate select-all">{lead.email}</p>
                            )}
                          </div>

                          {/* Phone Column */}
                          <div className="col-span-2 text-sm text-slate-700 font-semibold select-all">
                            {lead.phone || "N/A"}
                          </div>

                          {/* Company / Items Column */}
                          <div className="col-span-2 text-sm">
                            {isOrder && orderDetails ? (
                              <div className="text-xs space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded-xl max-h-[140px] overflow-y-auto scrollbar-none">
                                <span className="font-bold text-sky-800 block text-[9px] uppercase tracking-wider mb-1">📦 Items</span>
                                {orderDetails.items && orderDetails.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between gap-2 border-b border-slate-200/40 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                                    <span className="truncate text-slate-600 text-xs" title={item.name}>{item.name}</span>
                                    <span className="shrink-0 font-bold text-[#0D4A86] text-xs">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600 font-medium">{lead.company || "N/A"}</span>
                            )}
                          </div>

                          {/* Quantity Column */}
                          <div className="col-span-1 text-center font-bold">
                            {isOrder ? (
                              <span className="text-emerald-600 text-sm">₹{lead.quantity}</span>
                            ) : (
                              <span className="text-slate-600 text-sm">{lead.quantity || 0}</span>
                            )}
                          </div>

                          {/* Message / Shipping Column */}
                          <div className="col-span-3 text-sm">
                            {isOrder && orderDetails ? (
                              <div className="text-[11px] space-y-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl max-h-[140px] overflow-y-auto scrollbar-none">
                                {orderDetails.shipping_address && (
                                  <div>
                                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">📍 Shipping Address</span>
                                    <p className="text-slate-600 leading-tight">
                                      {orderDetails.shipping_address.street}, {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} - {orderDetails.shipping_address.pincode}
                                    </p>
                                  </div>
                                )}
                                {orderDetails.payment_method && (
                                  <div className="pt-1 border-t border-slate-200/50 text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-1">
                                    <span>Pay: <strong className="text-slate-700">{orderDetails.payment_method}</strong></span>
                                    {orderDetails.transaction_id && (
                                      <span className="text-[#0D4A86] font-mono select-all">UTR: {orderDetails.transaction_id}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-600 text-xs line-clamp-3" title={lead.message || ""}>
                                {lead.message || "No message"}
                              </div>
                            )}
                          </div>

                          {/* Status Dropdown */}
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none text-slate-700 font-bold focus:border-[#0D4A86] focus:bg-white"
                              >
                                <option value="Processing" className="text-yellow-600">🟡 Processing</option>
                                <option value="Shipped" className="text-blue-600">🔵 Shipped</option>
                                <option value="Arriving" className="text-orange-600">🟠 Arriving</option>
                                <option value="Delivered" className="text-green-600">🟢 Delivered</option>
                              </select>
                            ) : (
                              <select
                                value={lead.status}
                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none text-slate-700 font-bold focus:border-[#0D4A86] focus:bg-white"
                              >
                                <option value="new" className="text-yellow-600">🟡 New</option>
                                <option value="contacted" className="text-sky-600">🔵 Contacted</option>
                                <option value="closed" className="text-green-600">🟢 Closed</option>
                              </select>
                            )}
                          </div>

                          {/* Action Delete */}
                          <div className="col-span-1">
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-xl text-xs font-bold transition duration-300 cursor-pointer"
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
              className="space-y-6"
            >
              {/* Header Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-10 h-10 text-[#0D4A86] shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">🔐 Confidential Catalog CRUD Panel</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-xl">
                      Easily add new designs, edit specifications, modify stock levels, or remove products permanently from FADENFAB.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-[#0D4A86]/10 transition cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  <span>Add Product</span>
                </button>
              </div>

              {Object.keys(catalog).map((slug) => {
                const category = catalog[slug];
                return (
                  <div key={slug} className="space-y-4">
                    <h3 className="text-base font-extrabold text-slate-500 uppercase tracking-widest pl-1 mt-4">
                      {category.title} ({category.products ? category.products.length : 0} items)
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.products && category.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex items-center gap-4 relative group"
                        >
                          <div className="w-16 h-20 bg-slate-50 border border-slate-100 rounded-lg p-1 shrink-0 flex items-center justify-center relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <span className="text-2xl text-slate-400">👕</span>
                            )}
                          </div>

                          <div className="flex-grow min-w-0 pr-12">
                            <h4 className="font-bold text-slate-800 text-sm truncate" title={product.name}>
                              {product.name}
                            </h4>
                            <p className="text-xs text-[#0D4A86] mt-1 font-bold">
                              {product.gsm} | {product.color ? product.color.replace("Color: ", "") : "No Color"}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-0.5" title={product.fabric}>
                              {product.fabric ? product.fabric.replace("Material: ", "") : "Standard Fabric"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-400">Stock:</span>
                              <span className={`text-xs font-extrabold ${product.stock <= 5 ? "text-red-500 animate-pulse font-black" : "text-emerald-600"}`}>
                                {product.stock} units
                              </span>
                            </div>
                          </div>

                          <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                            <button
                              onClick={() => startEditProduct(slug, product)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(slug, product)}
                              className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
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
              <h3 className="text-base font-extrabold text-slate-500 uppercase tracking-widest pl-1">👤 User Accounts & Telemetry Directory</h3>
              {usersAnalytics.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
                  No registered users or active telemetry logs found yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersAnalytics.map((u, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-extrabold text-base text-slate-800 truncate max-w-[150px]">{u.name || "App User"}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            Signup: {new Date(u.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-blue-50 text-[#0D4A86] text-[10px] px-2.5 py-1 rounded-full font-bold border border-blue-100">Client</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Email ID:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[150px] select-all" title={u.email}>{u.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Password:</span>
                          <span className="font-semibold text-[#0D4A86] font-mono tracking-wider">{u.mockPassword || "••••••••"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone Mobile:</span>
                          <span className="font-semibold text-slate-700 select-all">{u.mobile || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Session Usage:</span>
                          <span className="font-bold text-amber-600">
                            {u.usageTime >= 60
                              ? `${Math.round(u.usageTime / 60)} mins`
                              : `${u.usageTime || 0} secs`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Purchase Count:</span>
                          <span className="font-bold text-emerald-600">{u.purchaseCount || 0} Orders placed</span>
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
              <h3 className="text-base font-extrabold text-slate-500 uppercase tracking-widest pl-1">🎟️ Active Coupon Campaigns & Usage Logs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {couponsData.map((coupon, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                      <h4 className="font-extrabold text-base text-indigo-700 font-mono tracking-widest uppercase">
                        {coupon.code}
                      </h4>
                      <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-100">
                        {coupon.discount}% Off
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Redeem Count:</span>
                        <span className="font-bold text-slate-700">{coupon.usageCount || 0} times</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">Applied By Users:</span>
                        {coupon.users && coupon.users.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                            {coupon.users.map((email: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50 font-semibold"
                              >
                                {email}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic block">Not applied by any user yet.</span>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by Order ID, Recipient name, mobile, payment method, or transaction ID..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 focus:border-[#0D4A86] focus:bg-white transition text-sm"
                  />
                  <select
                    value={ordersStatusFilter}
                    onChange={(e) => setOrdersStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 focus:border-[#0D4A86] focus:bg-white transition text-sm font-semibold"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="Processing">🟡 Processing</option>
                    <option value="Shipped">🔵 Shipped</option>
                    <option value="Arriving">🟠 Arriving</option>
                    <option value="Delivered">🟢 Delivered</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-500 uppercase tracking-widest pl-1">📦 Order Management Directory</h3>
              {filteredOrdersList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
                  No orders found.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrdersList.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300"
                    >
                      {/* Order Info Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-100 pb-4 mb-4 text-xs text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Order ID</span>
                          <span className="font-bold text-slate-700 block break-all font-mono select-all">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Customer & Address</span>
                          <span className="font-bold text-slate-700 block select-all">
                            {order.shipping_address?.fullName || "N/A"}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-semibold select-all">
                            Mobile: {order.shipping_address?.mobile || "N/A"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed select-all">
                            {order.shipping_address?.street || "N/A"}, {order.shipping_address?.city || "N/A"}, {order.shipping_address?.state || "N/A"} - {order.shipping_address?.pincode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Payment & Total</span>
                          <span className="font-bold text-slate-700 block select-all">
                            {order.payment_method || "N/A"}
                          </span>
                          {order.transaction_id && (
                            <span className="text-[10px] text-[#0D4A86] font-mono block mt-1 font-semibold select-all">
                              UTR: {order.transaction_id}
                            </span>
                          )}
                          <span className="text-xs text-emerald-600 font-extrabold block mt-1">
                            Total Paid: ₹{order.total}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Status Management</span>
                          <div className="flex gap-2 items-center mt-1">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-green-400 focus:bg-white text-slate-700 font-bold"
                            >
                              <option value="Processing">🟡 Processing</option>
                              <option value="Shipped">🔵 Shipped</option>
                              <option value="Arriving">🟠 Arriving</option>
                              <option value="Delivered">🟢 Delivered</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition cursor-pointer"
                              title="Delete/Cancel Order"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Items Ordered</span>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {order.items && order.items.map((item: any, i: number) => (
                            <div key={i} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 items-center">
                              <div className="w-12 h-14 bg-white border border-slate-200/60 rounded-lg p-1 shrink-0 flex items-center justify-center">
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
                                <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Qty: {item.quantity} | Size: <span className="font-extrabold text-slate-600">{item.size || "L"}</span> | {item.fabric || "Premium Fabric"}
                                </p>
                                <p className="text-[10px] text-slate-500">{item.color || "Selected Color"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= ADD PRODUCT MODAL ================= */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PlusIcon className="w-6 h-6 text-[#0D4A86]" />
                <span>Add Product to Catalog</span>
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-bold">Select Collection</label>
                  <select
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:border-[#0D4A86] focus:bg-white"
                  >
                    <option value="oversized-tshirts">Oversized T-Shirts</option>
                    <option value="hoodies">Premium Hoodies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Never Dies"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Faded Black"
                      value={addColor}
                      onChange={(e) => setAddColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">GSM Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 240–280"
                      value={addGsm}
                      onChange={(e) => setAddGsm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-bold">Fabric Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Premium Heavyweight Cotton"
                    value={addFabric}
                    onChange={(e) => setAddFabric(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Initial Stock Level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={addStock}
                      onChange={(e) => setAddStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Image URL Path</label>
                    <input
                      type="text"
                      placeholder="e.g. /classicneverdies.webp"
                      value={addImage}
                      onChange={(e) => setAddImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-5 py-2 rounded-xl font-bold transition cursor-pointer shadow shadow-[#0D4A86]/10"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PencilIcon className="w-6 h-6 text-[#0D4A86]" />
                <span>Edit Product Specifications</span>
              </h3>

              <form onSubmit={handleUpdateProduct} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Never Dies"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Faded Black"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">GSM Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 240–280"
                      value={editGsm}
                      onChange={(e) => setEditGsm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-bold">Fabric Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Premium Heavyweight Cotton"
                    value={editFabric}
                    onChange={(e) => setEditFabric(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Image URL Path</label>
                    <input
                      type="text"
                      placeholder="e.g. /classicneverdies.webp"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 outline-none focus:border-[#0D4A86] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-500 px-5 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-5 py-2 rounded-xl font-bold transition cursor-pointer shadow shadow-[#0D4A86]/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}