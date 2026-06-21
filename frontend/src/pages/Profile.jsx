import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "@/lib/axios";
import { useShop } from "../context/ShopContext";

const TABS = ["Profile", "Orders", "Addresses", "Settings"];

const Profile = () => {
  const navigate = useNavigate();
  const { setCartItems } = useShop();
  const token = localStorage.getItem("token");

  /* ── tab ── */
  const [activeTab, setActiveTab] = useState("Profile");

  /* ── page state ── */
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  /* ── profile form ── */
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", dob: "", gender: "", role: "", isVerified: false,
  });
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  /* ── password ── */
  const [editingPw, setEditingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  /* ── orders ── */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* ── addresses ── */
  const [addresses, setAddresses] = useState([]);
  const [addrsLoading, setAddrsLoading] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addingAddr, setAddingAddr] = useState(false);
  const emptyAddr = { tag: "Home", name: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "", isDefault: false };
  const [newAddr, setNewAddr] = useState(emptyAddr);

  /* ── notifications ── */
  const [notifs, setNotifs] = useState({
    orderUpdates: true, promotions: false, newArrivals: true, sms: false,
  });

  /* ══════════ FETCH on mount ══════════ */
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "Orders" && orders.length === 0) fetchOrders();
    if (activeTab === "Addresses" && addresses.length === 0) fetchAddresses();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      const { data } = await API.get("/user/profile");
      if (data.success) {
        const u = data.user;
        setForm({
          firstName: u.firstName || "",
          lastName:  u.lastName  || "",
          email:     u.email     || "",
          phone:     u.phone     || "",
          dob:       u.dob ? u.dob.substring(0, 10) : "",
          gender:    u.gender    || "",
          role:      u.role      || "user",
          isVerified: u.isVerified || false,
        });
        localStorage.setItem("user", JSON.stringify(u));
      } else {
        setPageError(data.message || "Failed to load profile.");
      }
    } catch {
      // graceful fallback to localStorage while backend is being built
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setForm({
          firstName: u.firstName || "", lastName: u.lastName || "",
          email: u.email || "", phone: u.phone || "",
          dob: u.dob ? u.dob.substring(0, 10) : "",
          gender: u.gender || "", role: u.role || "user",
          isVerified: u.isVerified || false,
        });
      } else {
        setPageError("Could not load profile. Please log in again.");
      }
    } finally {
      setPageLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get("/order/my-orders");
      if (data.success) setOrders(data.orders || []);
    } catch {
      toast.error("Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddrsLoading(true);
      const { data } = await API.get("/user/addresses");
      if (data.success) setAddresses(data.addresses || []);
    } catch {
      toast.error("Could not load addresses.");
    } finally {
      setAddrsLoading(false);
    }
  };

  /* ══════════ SAVE profile ══════════ */
  const handleSaveInfo = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required."); return;
    }
    try {
      setInfoLoading(true);
      const { data } = await API.put(
        "/user/update-profile",
        { firstName: form.firstName, lastName: form.lastName, phone: form.phone, dob: form.dob, gender: form.gender }
      );
      if (data.success) {
        const u = data.user;
        const updated = {
          firstName: u.firstName || "",
          lastName:  u.lastName  || "",
          email:     u.email     || "",
          phone:     u.phone     || "",
          dob:       u.dob ? u.dob.substring(0, 10) : "",
          gender:    u.gender    || "",
          role:      u.role      || "user",
          isVerified: u.isVerified || false,
        };
        setForm(updated);
        localStorage.setItem("user", JSON.stringify(u));
        toast.success("Profile updated!");
        setEditingInfo(false);
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch {
      toast.error("Could not update profile. Try again.");
    } finally {
      setInfoLoading(false);
    }
  };

  /* ══════════ CHANGE password ══════════ */
  const handleSavePw = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      toast.error("All password fields are required."); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("New passwords do not match."); return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error("Password must be at least 8 characters."); return;
    }
    try {
      setPwLoading(true);
      const { data } = await API.put(
        "/user/change-password",
        { currentPassword: pwForm.current, newPassword: pwForm.newPw }
      );
      if (data.success) {
        toast.success("Password changed!");
        setPwForm({ current: "", newPw: "", confirm: "" });
        setEditingPw(false);
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch {
      toast.error("Could not change password. Try again.");
    } finally {
      setPwLoading(false);
    }
  };

  /* ══════════ ADDRESS helpers ══════════ */
  const saveNewAddress = async () => {
    if (!newAddr.name || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
      toast.error("Please fill required address fields."); return;
    }
    try {
      const { data } = await API.post("/user/addresses", newAddr);
      if (data.success) {
        setAddresses(data.addresses || [...addresses, { ...newAddr, _id: Date.now() }]);
        setNewAddr(emptyAddr);
        setAddingAddr(false);
        toast.success("Address added!");
      } else toast.error(data.message || "Failed to add address.");
    } catch { toast.error("Could not save address."); }
  };

  const saveEditedAddress = async () => {
    try {
      const { data } = await API.put(`/user/addresses/${editingAddr._id}`, editingAddr);
      if (data.success) {
        setAddresses(data.addresses || addresses.map((a) => (a._id === editingAddr._id ? editingAddr : a)));
        setEditingAddr(null);
        toast.success("Address updated!");
      } else toast.error(data.message || "Failed to update.");
    } catch { toast.error("Could not update address."); }
  };

  const setDefaultAddress = async (id) => {
    try {
      const { data } = await API.patch(`/user/addresses/${id}/default`, {});
      if (data.success)
        setAddresses(data.addresses || addresses.map((a) => ({ ...a, isDefault: a._id === id })));
    } catch { toast.error("Could not set default."); }
  };

  const removeAddress = async (id) => {
    try {
      const { data } = await API.delete(`/user/addresses/${id}`);
      if (data.success) {
        setAddresses(data.addresses || addresses.filter((a) => a._id !== id));
        toast.success("Address removed.");
      }
    } catch { toast.error("Could not remove address."); }
  };

  /* ══════════ LOGOUT ══════════ */
  const handleLogout = () => {
  setCartItems({});

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  toast.success("Logged out.");
  navigate("/login");
};

  /* ══════════ UI helpers ══════════ */
  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "U";

  const statusStyle = (s) => ({
    Delivered:  { background: "#f0fdf4", color: "#166534" },
    Shipped:    { background: "#eff6ff", color: "#1e40af" },
    Processing: { background: "#fffbeb", color: "#92400e" },
    Cancelled:  { background: "#fef2f2", color: "#991b1b" },
  }[s] || { background: "#f3f4f6", color: "#374151" });

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 bg-white";
  const lbl = "block text-xs font-medium text-gray-500 mb-1";
  const fc  = "flex flex-col gap-1";

  const Spinner = () => (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
    </div>
  );

  /* ══════════ PAGE STATES ══════════ */
  if (pageLoading) return <div className="max-w-3xl mx-auto px-4 py-16"><Spinner /></div>;
  if (pageError)   return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 text-sm">{pageError}</p>
      <button onClick={() => navigate("/login")} className="mt-4 text-sm underline text-gray-500">Go to login</button>
    </div>
  );

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{form.firstName} {form.lastName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.email}</p>
          <span className={`inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${form.isVerified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
            {form.isVerified ? "✓ Verified account" : "⚠ Unverified"}
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════ PROFILE TAB ══════════════ */}
      {activeTab === "Profile" && (
        <div className="space-y-4">

          {/* Personal info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Personal information</h2>
              {!editingInfo && (
                <button onClick={() => setEditingInfo(true)} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                  ✏ Edit
                </button>
              )}
            </div>

            {editingInfo ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={fc}><label className={lbl}>First name *</label><input className={inp} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div className={fc}><label className={lbl}>Last name *</label><input className={inp} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className={fc}><label className={lbl}>Email *</label><input className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className={fc}><label className={lbl}>Phone</label><input className={inp} value={form.phone} placeholder="+91 XXXXX XXXXX" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={fc}><label className={lbl}>Date of birth</label><input type="date" className={inp} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
                  <div className={fc}>
                    <label className={lbl}>Gender</label>
                    <select className={inp} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveInfo} disabled={infoLoading} className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-60">
                    {infoLoading ? "Saving…" : "Save changes"}
                  </button>
                  <button onClick={() => setEditingInfo(false)} className="text-sm text-gray-500 border border-gray-200 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                {[
                  ["First name",     form.firstName],
                  ["Last name",      form.lastName],
                  ["Email",          form.email],
                  ["Phone",          form.phone     || "—"],
                  ["Date of birth",  form.dob       || "—"],
                  ["Gender",         form.gender    || "—"],
                  ["Role",           form.role],
                  ["Account status", form.isVerified ? "Verified ✓" : "Unverified"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="text-gray-800 font-medium">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Password</h2>
              {!editingPw && (
                <button onClick={() => setEditingPw(true)} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                  ✏ Change
                </button>
              )}
            </div>
            {editingPw ? (
              <>
                <div className={`${fc} mb-3`}>
                  <label className={lbl}>Current password</label>
                  <input type="password" className={inp} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Enter current password" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={fc}><label className={lbl}>New password</label><input type="password" className={inp} value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Min. 8 characters" /></div>
                  <div className={fc}><label className={lbl}>Confirm new password</label><input type="password" className={inp} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat new password" /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSavePw} disabled={pwLoading} className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-60">
                    {pwLoading ? "Updating…" : "Update password"}
                  </button>
                  <button onClick={() => setEditingPw(false)} className="text-sm text-gray-500 border border-gray-200 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">•••••••••• <span className="text-xs text-gray-400">(hidden for security)</span></p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ ORDERS TAB ══════════════ */}
      {activeTab === "Orders" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Order history</h2>
          </div>
          {ordersLoading ? <Spinner /> : orders.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">No orders yet.</div>
          ) : (
            orders.map((o, i) => (
              <div key={o._id || i} className={`flex items-center gap-4 px-5 py-4 ${i !== orders.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {o.image
                    ? <img src={o.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-gray-300 text-xl">👕</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{o.item || o.name || o.productName || "Order item"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{o.orderId || o._id} · {o.date ? new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">₹{o.amount || o.price || "—"}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block" style={statusStyle(o.status)}>
                    {o.status || "Pending"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════ ADDRESSES TAB ══════════════ */}
      {activeTab === "Addresses" && (
        <div className="space-y-4">
          {addrsLoading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((a) => (
                <div key={a._id} className={`bg-white rounded-2xl p-4 border shadow-sm text-sm ${a.isDefault ? "border-gray-900" : "border-gray-100"}`}>
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.isDefault ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                      {a.tag}{a.isDefault ? " · Default" : ""}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{a.name}</p>
                  <p className="text-gray-500 leading-relaxed mt-1">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                    {a.city}{a.state ? `, ${a.state}` : ""} – {a.pincode}<br />
                    {a.phone}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setEditingAddr({ ...a })} className="text-xs text-gray-500 underline">Edit</button>
                    {!a.isDefault && (
                      <>
                        <button onClick={() => setDefaultAddress(a._id)} className="text-xs text-gray-500 underline">Set default</button>
                        <button onClick={() => removeAddress(a._id)} className="text-xs text-red-400 underline">Remove</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!addingAddr && (
                <button onClick={() => setAddingAddr(true)} className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition text-center min-h-[120px] flex items-center justify-center">
                  + Add new address
                </button>
              )}
            </div>
          )}

          {/* Add address form */}
          {addingAddr && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">New address</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={fc}><label className={lbl}>Full name *</label><input className={inp} value={newAddr.name} onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })} /></div>
                <div className={fc}>
                  <label className={lbl}>Tag</label>
                  <select className={inp} value={newAddr.tag} onChange={(e) => setNewAddr({ ...newAddr, tag: e.target.value })}>
                    <option>Home</option><option>Office</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className={`${fc} mb-3`}><label className={lbl}>Address line 1 *</label><input className={inp} value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} /></div>
              <div className={`${fc} mb-3`}><label className={lbl}>Address line 2</label><input className={inp} value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className={fc}><label className={lbl}>City *</label><input className={inp} value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                <div className={fc}><label className={lbl}>State</label><input className={inp} value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                <div className={fc}><label className={lbl}>Pincode *</label><input className={inp} value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
              </div>
              <div className={`${fc} mb-3`}><label className={lbl}>Phone</label><input className={inp} value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
                <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <div className="flex gap-2">
                <button onClick={saveNewAddress} className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition">Save address</button>
                <button onClick={() => setAddingAddr(false)} className="text-sm text-gray-500 border border-gray-200 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit address form */}
          {editingAddr && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Edit address</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={fc}><label className={lbl}>Full name</label><input className={inp} value={editingAddr.name} onChange={(e) => setEditingAddr({ ...editingAddr, name: e.target.value })} /></div>
                <div className={fc}>
                  <label className={lbl}>Tag</label>
                  <select className={inp} value={editingAddr.tag} onChange={(e) => setEditingAddr({ ...editingAddr, tag: e.target.value })}>
                    <option>Home</option><option>Office</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className={`${fc} mb-3`}><label className={lbl}>Address line 1</label><input className={inp} value={editingAddr.line1} onChange={(e) => setEditingAddr({ ...editingAddr, line1: e.target.value })} /></div>
              <div className={`${fc} mb-3`}><label className={lbl}>Address line 2</label><input className={inp} value={editingAddr.line2} onChange={(e) => setEditingAddr({ ...editingAddr, line2: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className={fc}><label className={lbl}>City</label><input className={inp} value={editingAddr.city} onChange={(e) => setEditingAddr({ ...editingAddr, city: e.target.value })} /></div>
                <div className={fc}><label className={lbl}>State</label><input className={inp} value={editingAddr.state} onChange={(e) => setEditingAddr({ ...editingAddr, state: e.target.value })} /></div>
                <div className={fc}><label className={lbl}>Pincode</label><input className={inp} value={editingAddr.pincode} onChange={(e) => setEditingAddr({ ...editingAddr, pincode: e.target.value })} /></div>
              </div>
              <div className={`${fc} mb-4`}><label className={lbl}>Phone</label><input className={inp} value={editingAddr.phone} onChange={(e) => setEditingAddr({ ...editingAddr, phone: e.target.value })} /></div>
              <div className="flex gap-2">
                <button onClick={saveEditedAddress} className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition">Save changes</button>
                <button onClick={() => setEditingAddr(null)} className="text-sm text-gray-500 border border-gray-200 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ SETTINGS TAB ══════════════ */}
      {activeTab === "Settings" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Notification preferences</h2>
            {[
              { key: "orderUpdates", label: "Order updates",      desc: "Shipping, delivery and return status" },
              { key: "promotions",   label: "Promotions & offers", desc: "Exclusive deals and seasonal sales" },
              { key: "newArrivals",  label: "New arrivals",        desc: "Be first to know about new collections" },
              { key: "sms",          label: "SMS notifications",   desc: "Receive updates via text message" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifs[key]} onChange={() => setNotifs({ ...notifs, [key]: !notifs[key] })} />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>

          <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-red-600 mb-4">Account actions</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-800">Log out</p>
                  <p className="text-xs text-gray-400">Sign out of your account on this device</p>
                </div>
                <button onClick={handleLogout} className="text-xs border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition">Log out</button>
              </div>
              <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-red-500">Delete account</p>
                  <p className="text-xs text-gray-400">Permanently remove your account and data</p>
                </div>
                <button
                  onClick={() => { if (window.confirm("Are you sure? This cannot be undone.")) toast.error("Contact support to delete your account."); }}
                  className="text-xs border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;