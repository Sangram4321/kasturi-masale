import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    Package, Plus, TrendingDown, TrendingUp, ClipboardList,
    Search, Filter, AlertTriangle, CheckCircle, History, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "";

const Inventory = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeductModal, setShowDeductModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    // Forms
    const [newBatch, setNewBatch] = useState({ variantName: "", costPerUnit: "", initialQuantity: "", mfgDate: "" });
    const [deductForm, setDeductForm] = useState({ quantity: "", reason: "Offline Sale" });
    const [addStockForm, setAddStockForm] = useState({ quantity: "", reason: "Stock Correction" });
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showLedgerModal, setShowLedgerModal] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setBatches(data.batches);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newBatch)
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewBatch({ variantName: "", costPerUnit: "", initialQuantity: "", mfgDate: "" });
                fetchBatches();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Create Error:", err);
        }
    };

    const handleDeductStock = async (e) => {
        e.preventDefault();
        if (!selectedBatch) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches/${selectedBatch._id}/out`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...deductForm,
                    quantity: parseInt(deductForm.quantity)
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowDeductModal(false);
                setDeductForm({ quantity: "", reason: "Offline Sale" });
                fetchBatches();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Deduct Error:", err);
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!selectedBatch) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches/${selectedBatch._id}/in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...addStockForm,
                    quantity: parseInt(addStockForm.quantity)
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowAddStockModal(false);
                setAddStockForm({ quantity: "", reason: "Stock Correction" });
                fetchBatches();
                // Optionally verify ledger update
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Add Stock Error:", err);
        }
    };



    const handleVoidEntry = async (batchId, entryId) => {
        if (!confirm("Void this entry? This will reverse the stock change but keep the record.")) return;
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches/${batchId}/history/${entryId}/void`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.success) {
                // Update local state to reflect change immediately
                setSelectedBatch(data.batch);
                fetchBatches();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Void Entry Error:", err);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!confirm("Are you sure you want to permanently delete this batch?")) return;

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API}/api/batches/${batchId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchBatches();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    // Filter
    const filteredBatches = batches.filter(b =>
        b.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.variantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Inventory Management</h1>
                    <p style={styles.subtitle}>Track Batches, Costs, and Stock Levels</p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
                    <Plus size={20} /> Add New Batch
                </button>
            </div>

            {/* SEARCH & STATS */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={styles.searchBox}>
                    <Search size={20} color="#6B7280" />
                    <input
                        placeholder="Search Batch ID or Product..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* BATCH TABLE */}
            <div style={styles.tableContainer}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={styles.th}>BATCH CODE</th>
                                <th style={styles.th}>VARIANT</th>
                                <th style={styles.th}>MFG DATE</th>
                                <th style={styles.th}>UNIT COST</th>
                                <th style={styles.th}>INITIAL</th>
                                <th style={styles.th}>REMAINING</th>
                                <th style={styles.th}>STATUS</th>
                                <th style={styles.th}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ ...styles.td, textAlign: 'center' }}>Loading Inventory...</td></tr>
                            ) : filteredBatches.length === 0 ? (
                                <tr><td colSpan="8" style={{ ...styles.td, textAlign: 'center' }}>No Batches Found</td></tr>
                            ) : (
                                filteredBatches.map(batch => (
                                    <tr key={batch._id}>
                                        <td style={{ ...styles.td, fontFamily: 'monospace', color: '#A855F7' }}>{batch.batchCode}</td>
                                        <td style={styles.td}>{batch.variantName}</td>
                                        <td style={styles.td}>{new Date(batch.mfgDate).toLocaleDateString()}</td>
                                        <td style={styles.td}>₹{batch.costPerUnit}</td>
                                        <td style={styles.td}>{batch.initialQuantity}</td>
                                        <td style={styles.td}>
                                            <span style={{ color: batch.remainingQuantity < 10 ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                                                {batch.remainingQuantity}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4,
                                                background: batch.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                color: batch.isActive ? '#34D399' : '#9CA3AF',
                                                fontSize: 12
                                            }}>
                                                {batch.isActive ? 'ACTIVE' : 'CLOSED'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {batch.isActive && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => { setSelectedBatch(batch); setShowDeductModal(true); }}
                                                        title="Manual Stock Out"
                                                    >
                                                        <TrendingDown size={14} /> Out
                                                    </button>
                                                    <button
                                                        style={{ ...styles.actionBtn, borderColor: '#059669', color: '#34D399' }}
                                                        onClick={() => { setSelectedBatch(batch); setShowAddStockModal(true); }}
                                                        title="Manual Stock In"
                                                    >
                                                        <TrendingUp size={14} /> In
                                                    </button>
                                                    <button
                                                        style={{ ...styles.actionBtn, borderColor: '#6366f1', color: '#818cf8' }}
                                                        onClick={() => { setSelectedBatch(batch); setShowLedgerModal(true); }}
                                                        title="View Ledger"
                                                    >
                                                        <History size={14} />
                                                    </button>
                                                    <button
                                                        style={{ ...styles.actionBtn, borderColor: '#EF4444', color: '#EF4444' }}
                                                        onClick={() => handleDeleteBatch(batch._id)}
                                                        title="Delete Batch"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD BATCH MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={styles.modal}
                        >
                            <h2 style={styles.modalTitle}>Add Production Batch</h2>
                            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input
                                    style={styles.input}
                                    placeholder="Variant Name (e.g. Kasturi_200G)"
                                    value={newBatch.variantName}
                                    onChange={e => setNewBatch({ ...newBatch, variantName: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input
                                        type="number" style={styles.input}
                                        placeholder="Cost Per Unit (₹)"
                                        value={newBatch.costPerUnit}
                                        onChange={e => setNewBatch({ ...newBatch, costPerUnit: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number" style={styles.input}
                                        placeholder="Quantity"
                                        value={newBatch.initialQuantity}
                                        onChange={e => setNewBatch({ ...newBatch, initialQuantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <label style={{ color: '#9CA3AF', fontSize: 12 }}>Manufacturing Date</label>
                                <input
                                    type="date" style={styles.input}
                                    value={newBatch.mfgDate}
                                    onChange={e => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                                    <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" style={styles.confirmBtn}>Create Batch</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DEDUCT STOCK MODAL */}
            <AnimatePresence>
                {showDeductModal && selectedBatch && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={styles.modal}
                        >
                            <h2 style={styles.modalTitle}>Stock Out (Offline/Damage)</h2>
                            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 16 }}>
                                Deducting from <strong>{selectedBatch.batchCode}</strong><br />
                                Current Stock: {selectedBatch.remainingQuantity} units
                            </p>
                            <form onSubmit={handleDeductStock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input
                                    type="number" style={styles.input}
                                    placeholder="Quantity to Remove"
                                    value={deductForm.quantity}
                                    max={selectedBatch.remainingQuantity}
                                    onChange={e => setDeductForm({ ...deductForm, quantity: e.target.value })}
                                    required
                                />
                                <select
                                    style={styles.input}
                                    value={deductForm.reason}
                                    onChange={e => setDeductForm({ ...deductForm, reason: e.target.value })}
                                >
                                    <option value="Offline Sale">Offline Sale</option>
                                    <option value="Distributor">Distributor / Wholesale</option>
                                    <option value="Damaged/Expired">Damaged / Expired</option>
                                    <option value="Internal Use">Internal Use (Sample)</option>
                                </select>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                                    <button type="button" onClick={() => setShowDeductModal(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" style={{ ...styles.confirmBtn, background: '#EF4444' }}>Deduct Stock</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD STOCK MODAL */}
            <AnimatePresence>
                {showAddStockModal && selectedBatch && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={styles.modal}
                        >
                            <h2 style={styles.modalTitle}>Stock In (Return / Correction)</h2>
                            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 16 }}>
                                Adding to <strong>{selectedBatch.batchCode}</strong><br />
                                Current Stock: {selectedBatch.remainingQuantity} units
                            </p>
                            <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input
                                    type="number" style={styles.input}
                                    placeholder="Quantity to Add"
                                    value={addStockForm.quantity}
                                    min="1"
                                    onChange={e => setAddStockForm({ ...addStockForm, quantity: e.target.value })}
                                    required
                                />
                                <select
                                    style={styles.input}
                                    value={addStockForm.reason}
                                    onChange={e => setAddStockForm({ ...addStockForm, reason: e.target.value })}
                                >
                                    <option value="Stock Correction">Stock Correction (Audit)</option>
                                    <option value="Return Restock">Return Restock</option>
                                    <option value="Manual Addition">Manual Addition</option>
                                </select>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                                    <button type="button" onClick={() => setShowAddStockModal(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" style={{ ...styles.confirmBtn, background: '#10B981' }}>Add Stock</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LEDGER MODAL */}
            <AnimatePresence>
                {showLedgerModal && selectedBatch && (
                    <div style={styles.modalOverlay}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ ...styles.modal, width: "100%", maxWidth: 600 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={styles.modalTitle}>Batch Ledger: {selectedBatch.batchCode}</h2>
                                <button onClick={() => setShowLedgerModal(false)} style={styles.cancelBtn}>Close</button>
                            </div>

                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ ...styles.th, padding: '8px 12px' }}>DATE</th>
                                            <th style={{ ...styles.th, padding: '8px 12px' }}>ACTION</th>
                                            <th style={{ ...styles.th, padding: '8px 12px' }}>QTY</th>
                                            <th style={{ ...styles.th, padding: '8px 12px' }}>REASON</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedBatch.history || []).slice().reverse().map((entry, idx) => (
                                            <tr key={entry._id || idx} style={{
                                                borderBottom: '1px solid #374151',
                                                opacity: entry.isVoided ? 0.5 : 1,
                                                background: entry.isVoided ? 'rgba(0,0,0,0.2)' : 'transparent'
                                            }}>
                                                <td style={{ ...styles.td, padding: '8px 12px', fontSize: 13, textDecoration: entry.isVoided ? 'line-through' : 'none' }}>
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </td>
                                                <td style={{ ...styles.td, padding: '8px 12px', fontSize: 12 }}>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: 4,
                                                        background: entry.isVoided ? '#374151' : (entry.action.includes('DEDUCT') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                                                        color: entry.isVoided ? '#9CA3AF' : (entry.action.includes('DEDUCT') ? '#F87171' : '#34D399'),
                                                        fontWeight: 600
                                                    }}>
                                                        {entry.isVoided ? 'VOIDED' : entry.action}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    ...styles.td, padding: '8px 12px', fontWeight: 600,
                                                    color: '#fff',
                                                    textDecoration: entry.isVoided ? 'line-through' : 'none'
                                                }}>
                                                    {entry.action.includes('DEDUCT') ? '-' : '+'}{entry.quantity}
                                                </td>
                                                <td style={{ ...styles.td, padding: '8px 12px', color: '#9CA3AF', fontSize: 13 }}>
                                                    {entry.reason}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                                {(selectedBatch.history || []).length === 0 && (
                                    <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>No history found</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >

        </AdminLayout >
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 },
    subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
    addBtn: { background: '#7C3AED', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },

    // Search
    searchBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#111827', padding: '10px 16px', borderRadius: 8, border: '1px solid #1F2937', flex: 1, minWidth: 250, maxWidth: 400 },
    searchInput: { background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' },

    // Table
    tableContainer: { background: '#111827', borderRadius: 16, border: '1px solid #1F2937', overflow: 'hidden' },
    th: { padding: '16px 24px', textAlign: 'left', color: '#9CA3AF', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #1F2937' },
    td: { padding: '16px 24px', color: '#E5E7EB', fontSize: 14, borderBottom: '1px solid #1F2937' },

    actionBtn: { background: '#374151', color: '#fff', border: '1px solid #4B5563', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)', padding: 16 },
    modal: { background: '#1F2937', padding: 24, borderRadius: 16, width: "100%", maxWidth: 400, border: '1px solid #374151', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 20 },
    input: { background: '#111827', border: '1px solid #374151', padding: 12, borderRadius: 8, color: '#fff', width: '100%', outline: 'none' },
    cancelBtn: { background: 'transparent', color: '#9CA3AF', border: 'none', padding: '10px', cursor: 'pointer' },
    confirmBtn: { background: '#10B981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }
};

export default Inventory;
