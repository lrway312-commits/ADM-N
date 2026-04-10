import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  LayoutGrid,
  Settings,
  Image as ImageIcon,
  DollarSign,
  Camera,
  Lock,
  Upload,
  Layers
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE = "https://dgbfhfr-jewelry-system-final-x.hf.space/api";

function App() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState("dashboard"); // dashboard, wizard, inventory
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "2026") {
      setIsAuthenticated(true);
      fetchInventory();
    } else {
      setMessage("⚠️ الرمز السري غير صحيح");
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/inventory`, {
        headers: { Authorization: `Bearer jewel2026` }
      });
      setInventory(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-vh-100 flex-col gap-8 pt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="control-card p-12 w-full max-w-sm text-center"
        >
          <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
          <p className="text-white/40 text-sm mb-8">نظام إدارة المخزون والتسويق الآلي</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="••••"
              className="input-flat text-center text-2xl tracking-[12px]"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
            />
            <button type="submit" className="btn-primary mt-2">دخول النظام</button>
            {message && <p className="text-red-400 text-sm mt-2">{message}</p>}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <nav className="flex justify-between items-center mb-16 px-4 py-4 control-card">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Layers size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">CONTROL <span className="text-primary">PANEL</span></h2>
        </div>
        <div className="flex gap-2">
          <NavBtn active={view === "dashboard"} icon={<LayoutGrid size={18}/>} label="الرئيسية" onClick={() => setView("dashboard")} />
          <NavBtn active={view === "inventory"} icon={<PlusCircle size={18}/>} label="إدارة المخزون" onClick={() => setView("inventory")} />
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === "dashboard" && <DashboardView inventory={inventory} setView={setView} />}
        {view === "wizard" && <WizardView setView={setView} fetchInventory={fetchInventory} />}
        {view === "inventory" && <InventoryView inventory={inventory} fetchInventory={fetchInventory} setView={setView} />}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTS ---

function NavBtn({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/40'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function DashboardView({ inventory, setView }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatBox label="إجمالي المخزون" value={inventory.length} color="text-blue-400" />
      <StatBox label="على الموقع" value={inventory.filter(i => i.ON_WEBSITE).length} color="text-green-400" />
      <StatBox label="منشور (أتمتة)" value={inventory.filter(i => i.LAST_POSTED).length} color="text-pink-400" />
      
      <div className="md:col-span-3 mt-4">
        <button 
          onClick={() => setView("wizard")}
          className="control-card w-full p-16 flex flex-col items-center gap-4 hover:border-primary/50 transition-all group"
        >
          <div className="bg-primary/10 p-5 rounded-full group-hover:bg-primary/20 transition-all">
            <Upload size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold">رفع منتج جديد</h3>
          <p className="text-white/30 text-sm">سيقوم النظام بتوليد 4 صور ونشرها آلياً</p>
        </button>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="control-card p-6">
      <p className="text-white/30 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function WizardView({ setView, fetchInventory }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "", category: "rings", price: "", post_ig: true, post_web: true
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("post_ig", formData.post_ig);
    data.append("post_web", formData.post_web);
    data.append("image", file);

    try {
      await axios.post(`${API_BASE}/inventory/upload`, data, {
        headers: { 
          Authorization: `Bearer jewel2026`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchInventory();
      setView("inventory");
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      setErrorMsg(`فشل الاتصال: ${errMsg}`);
      console.error("Upload Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto control-card p-10">
      <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <h2 className="text-xl font-bold">معالج الرفع الآلي</h2>
        <span className="text-xs text-white/20 uppercase">Step {step}/3</span>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <label className="text-sm text-white/40">اختر صورة المنتج الأصلية</label>
          <div 
            onClick={() => document.getElementById('fileInput').click()}
            className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all"
          >
            {preview ? (
              <img src={preview} className="h-full w-full object-contain p-4" />
            ) : (
              <>
                <Upload size={32} className="text-white/20" />
                <p className="text-sm text-white/20">اضغط للاختيار أو اسحب الصورة هنا</p>
              </>
            )}
          </div>
          <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
          <button 
            disabled={!file}
            onClick={() => setStep(2)} 
            className={`btn-primary flex items-center justify-center gap-2 ${!file && 'opacity-50 cursor-not-allowed'}`}
          >
            التالي <ArrowLeft size={16}/>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5 text-right" dir="rtl">
          <div>
            <label className="text-xs text-white/30 block mb-2">اسم المنتج</label>
            <input className="input-flat" placeholder="مثلاً: خاتم ذهب ملكي" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/30 block mb-2">السعر (اختياري)</label>
              <input className="input-flat" placeholder="₺" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-2">التصنيف</label>
              <select className="input-flat" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="rings">الخواتم</option>
                <option value="necklaces">القلادات</option>
                <option value="bracelets">الأساور</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-white/5">
            <Toggle label="النشر التلقائي على إنستغرام" checked={formData.post_ig} onChange={(v) => setFormData({...formData, post_ig: v})} />
            <Toggle label="المزامنة مع الموقع الإلكتروني" checked={formData.post_web} onChange={(v) => setFormData({...formData, post_web: v})} />
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={() => setStep(3)} className="btn-primary flex-1">مراجعة البيانات</button>
            <button onClick={() => setStep(1)} className="bg-white/5 px-6 rounded-lg"><ArrowRight size={18}/></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center flex flex-col gap-8">
          <div className="bg-primary/10 text-primary p-8 rounded-2xl flex flex-col items-center gap-2">
            <CheckCircle size={40} />
            <span className="font-bold">تأكيد الإرسال</span>
          </div>
          <div className="text-right p-6 control-card bg-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
              <span className="text-white/20 text-xs">قنوات النشر</span>
              <div className="flex gap-2">
                {formData.post_ig && <span className="bg-pink-500/20 text-pink-400 text-[10px] px-2 py-0.5 rounded">Instagram</span>}
                {formData.post_web && <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded">Website</span>}
              </div>
            </div>
            <p className="font-bold text-lg">{formData.name}</p>
            <p className="text-primary font-medium">{formData.price || 'بدون سعر'}</p>
          </div>
          {errorMsg && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-xl text-xs text-left" dir="ltr">
              <span className="font-bold block mb-1">Error Log:</span>
              <code>{errorMsg}</code>
            </div>
          )}
          <button 
            disabled={loading}
            onClick={handleSubmit} 
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'ابدأ المعالجة والنشر'}
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex justify-between items-center px-2">
      <span className="text-sm font-medium text-white/60">{label}</span>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider"></span>
      </label>
    </div>
  );
}

function InventoryView({ inventory, fetchInventory, setView }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">إدارة المنتجات</h2>
        <button onClick={() => setView("wizard")} className="bg-primary hover:bg-primary/80 transition-all text-white p-2 rounded-lg flex items-center gap-2 text-sm px-4">
          <PlusCircle size={18} /> منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventory.slice().reverse().map(item => (
          <div key={item.ID} className="control-card p-4 flex items-center gap-5">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
              <img src={item.IMAGE_URL || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{item.NAME}</h4>
              <p className="text-primary text-xs font-bold mt-1">{item.PRICE || '---'}</p>
            </div>
            <div className="flex gap-2">
              <div className={`p-1.5 rounded-md ${item.ON_WEBSITE ? 'text-green-400 bg-green-400/10' : 'text-white/10 bg-white/5'}`}>
                <Eye size={16} />
              </div>
              <div className={`p-1.5 rounded-md ${item.LAST_POSTED ? 'text-pink-400 bg-pink-400/10' : 'text-white/10 bg-white/5'}`}>
                <Camera size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;
