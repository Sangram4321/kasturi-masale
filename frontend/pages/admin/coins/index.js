import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Search, Loader2, Coins, AlertTriangle, CheckCircle, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

// Helper for Tier Badge
const TierBadge = ({ tier }) => {
    const colors = { Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#FFD700" };
    return (
        <span style={{
            background: `${colors[tier]}20`,
            color: colors[tier] === "#FFD700" ? "#B45309" : colors[tier],
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            border: `1px solid ${colors[tier]}40`,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
        }}>
            {tier === "Gold" && "👑"} {tier}
        </span>
    );
};

export default function AdminCoinPanel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [walletData, setWalletData] = useState(null);

    // Action State
    const [actionType, setActionType] = useState("CREDIT"); // CREDIT or DEBIT
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("MANUAL_REWARD");
    const [description, setDescription] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [processing, setProcessing] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.replace("/admin/login");
        } else {
            setLoading(false);
        }
    }, []);

    // 1. Search Users
    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.length < 3) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/wallet/users/search?query=${searchTerm}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 2. Select User & Fetch Wallet
    const selectUser = async (user) => {
        setSelectedUser(user);
        setSearchResults([]);
        setSearchTerm(""); // Clear search
        await fetchWalletDetails(user._id);
    };

    const fetchWalletDetails = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`/api/admin/wallet/users/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setWalletData(data.wallet);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Submit Adjustment
    const handleAdjustment = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return alert("Enter valid amount");

        setProcessing(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/wallet/adjust", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    type: actionType,
                    amount: Number(amount),
                    reason,
                    description: description || (actionType === "CREDIT" ? "Admin Reward" : "Admin Correction"),
                    adminNote
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Success!");
                setAmount("");
                setDescription("");
                setAdminNote("");
                await fetchWalletDetails(selectedUser._id); // Refresh
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed");
        } finally {
            setProcessing(false);
        }
    };

    // 4. Resolve Pending
    const resolvePending = async (txnId, action) => {
        if (!confirm(`Are you sure you want to mark this as ${action}? This cannot be undone.`)) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/wallet/resolve-pending", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId: txnId,
                    action
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchWalletDetails(selectedUser._id);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Error resolving transaction");
        }
    };

    if (loading && !selectedUser) return <div className="p-10 text-center">Loading Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Head><title>Coin Manager | Kasturi Admin</title></Head>

            <div className="max-w-6xl mx-auto p-6">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Coin Adjustment Panel</h1>
                        <p className="text-sm text-gray-500">Secure Admin Access Only</p>
                    </div>
                    <button onClick={() => router.push("/admin")} className="text-sm font-medium text-gray-600 hover:text-black">
                        Back to Dashboard
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Search & User Info */}
                    <div className="space-y-6">
                        {/* Search Box */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Find User</h3>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search name, phone, email..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </form>

                            {/* Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {searchResults.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => selectUser(u)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                {u.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{u.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected User Card */}
                        {selectedUser && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={100} /></div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                                        {selectedUser.name?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">{selectedUser.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedUser.uid}</p>
                                        <div className="mt-1"><TierBadge tier={walletData?.tier || "Bronze"} /></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <div className="text-xs text-green-700 font-semibold uppercase">Active Coins</div>
                                        <div className="text-2xl font-bold text-green-800">{walletData?.balance || 0}</div>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <div className="text-xs text-yellow-700 font-semibold uppercase">Pending</div>
                                        <div className="text-2xl font-bold text-yellow-800">{walletData?.pendingBalance || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MIDDLE & RIGHT: Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {!selectedUser ? (
                            <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                                Select a user to view wallet details
                            </div>
                        ) : (
                            <>
                                {/* ADJUSTMENT FORM */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Coins size={20} className="text-gray-400" />
                                        Adjust Balance
                                    </h3>

                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6 flex gap-2">
                                        <AlertTriangle size={16} className="mt-0.5" />
                                        <span>
                                            <strong>Admin Note:</strong> All adjustments are logged in the immutable audit ledger.
                                            Do not use this for testing.
                                        </span>
                                    </div>

                                    <form onSubmit={handleAdjustment}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Action</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActionType("CREDIT")}
                                                        className={`flex-1 py-2 rounded-lg font-medium text-sm border ${actionType === "CREDIT" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200"}`}
                                                    >
                                                        + Add Coins
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActionType("DEBIT")}
                                                        className={`flex-1 py-2 rounded-lg font-medium text-sm border ${actionType === "DEBIT" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-200"}`}
                                                    >
                                                        - Deduct
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Amount</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Reason Code</label>
                                                <select
                                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                                    value={reason}
                                                    onChange={e => setReason(e.target.value)}
                                                >
                                                    <option value="MANUAL_REWARD">Manual Reward</option>
                                                    <option value="CUSTOMER_SUPPORT">Customer Support</option>
                                                    <option value="ORDER_CORRECTION">Order Correction</option>
                                                    <option value="REFUND_ADJUSTMENT">Refund Adjustment</option>
                                                    <option value="PROMOTIONAL_GRANT">Promotional Grant</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Public Description (User sees this)</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                                    value={description}
                                                    onChange={e => setDescription(e.target.value)}
                                                    placeholder={actionType === "CREDIT" ? "Loyalty Bonus" : "Order Cancellation"}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Internal Admin Note (Private)</label>
                                            <textarea
                                                className="w-full p-2 border border-gray-300 rounded-lg h-20 text-sm"
                                                value={adminNote}
                                                onChange={e => setAdminNote(e.target.value)}
                                                placeholder="Explain why this adjustment is being made..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {processing ? "Processing..." : `Confirm ${actionType} Adjustment`}
                                        </button>
                                    </form>
                                </div>

                                {/* LEDGER HISTORY */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">Audit Ledger</h3>
                                        <span className="text-xs text-gray-500">Read-only immutable record</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Description</th>
                                                    <th className="px-4 py-3">Type</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                    <th className="px-4 py-3">Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {walletData?.history?.map((txn) => (
                                                    <tr key={txn._id} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {new Date(txn.createdAt).toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900">{txn.description}</div>
                                                            {txn.adminNote && <div className="text-xs text-gray-400 italic">{txn.adminNote}</div>}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs font-bold px-2 py-1 rounded ${txn.type === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                                                            {txn.type === "CREDIT" ? "+" : "-"}{txn.amount}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {txn.status === "PENDING" ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className="text-yellow-600 font-bold text-xs uppercase">Pending</span>
                                                                    <button
                                                                        onClick={() => resolvePending(txn._id, "COMPLETED")}
                                                                        className="p-1 hover:bg-green-100 rounded text-green-600"
                                                                        title="Resolve as Complete"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => resolvePending(txn._id, "VOID")}
                                                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                                                        title="Void Transaction"
                                                                    >
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className={`text-xs font-bold ${txn.status === "COMPLETED" ? "text-green-600" : "text-gray-400"}`}>
                                                                    {txn.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">
                                                            {txn.adminId?.username || "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Tailwind JIT Polyfill for colors if needed, but existing setup should work */}
        </div>
    );
}
