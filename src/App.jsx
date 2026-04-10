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
  Instagram,
  Lock
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE = "http://localhost:7864/api"; // Replace with HF Space root URL when deployed

function App() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState("dashboard"); // dashboard, wizard, inventory
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- AUTHENTICATION ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "2026") { // Shared PIN
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
        headers: { Authorization: `Bearer jewel2026` } // Matches default server secret
      });
      setInventory(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateItem = async (id, updates) => {
    try {
      await axios.post(`${API_BASE}/inventory/update`, { id, updates }, {
        headers: { Authorization: `Bearer jewel2026` }
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-vh-100 flex-col gap-8 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 w-full max-w-md text-center gold-glow"
        >
          <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-gold w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم الفاخرة</h1>
          <p className="text-white/60 mb-8">يرجى إدخال الرمز السري للدخول</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="••••"
              className="input-field text-center text-3xl tracking-widest"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
            />
            <button type="submit" className="btn-gold">دخول</button>
            {message && <p className="text-red-400 mt-2">{message}</p>}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-gold text-black p-2 rounded-lg">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-bold italic tracking-tighter">VELLURE <span className="text-gold">ADMIN</span></h2>
        </div>
        <div className="flex gap-4">
          <NavBtn active={view === "dashboard"} icon={<LayoutGrid size={20}/>} label="الرئيسية" onClick={() => setView("dashboard")} />
          <NavBtn active={view === "inventory"} icon={<PlusCircle size={20}/>} label="المخزون" onClick={() => setView("inventory")} />
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === "dashboard" && <DashboardView inventory={inventory} setView={setView} />}
        {view === "wizard" && <WizardView setView={setView} fetchInventory={fetchInventory} />}
        {view === "inventory" && <InventoryView inventory={inventory} updateItem={updateItem} setView={setView} />}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavBtn({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active ? 'bg-gold text-black font-bold' : 'hover:bg-white/10 text-white/60'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function DashboardView({ inventory, setView }) {
  const onSite = inventory.filter(i => i.ON_WEBSITE).length;
  const posted = inventory.filter(i => i.LAST_POSTED).length;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <StatCard label="إجمالي المخزون" value={inventory.length} icon={<LayoutGrid className="text-blue-400" />} />
      <StatCard label="المعروض على الموقع" value={onSite} icon={<Eye className="text-green-400" />} />
      <StatCard label="منشور على إنستا" value={posted} icon={<Instagram className="text-pink-400" />} />
      
      <div className="md:col-span-3 mt-8">
        <button 
          onClick={() => setView("wizard")}
          className="glass-panel w-full p-12 flex flex-col items-center gap-4 hover:bg-gold/10 transition-all border-dashed border-gold/30 gold-glow"
        >
          <PlusCircle size={48} className="text-gold" />
          <h3 className="text-2xl font-bold text-gold">إضافة منتج جديد (المعالج الذكي)</h3>
          <p className="text-white/40">ابدأ بإضافة قطعة جديدة إلى المخزون، الموقع، أو إنستغرام</p>
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="glass-panel p-8 flex items-center justify-between">
      <div>
        <p className="text-white/40 text-sm mb-1">{label}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
    </div>
  );
}

function WizardView({ setView, fetchInventory }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", category: "Rings", price: "", image_url: "", on_website: true, web_section: "rings"
  });

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE}/inventory/add`, formData, {
        headers: { Authorization: `Bearer jewel2026` }
      });
      fetchInventory();
      setView("inventory");
    } catch (err) {
      alert("خطأ أثناء الإضافة");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto glass-panel p-10 gold-glow"
    >
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-gold">معالج الإضافة الذكي</h2>
        <div className="text-white/30 text-sm">خطوة {step} من 3</div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <label className="text-white/60">رابط صورة المنتج (أو اتركها فارغة للتوليد لاحقاً)</label>
          <div className="flex gap-4">
             <div className="bg-white/5 border border-dashed border-white/20 w-32 h-32 rounded-xl flex items-center justify-center">
               <ImageIcon size={32} className="text-white/20" />
             </div>
             <input 
              className="input-field flex-1" 
              placeholder="https://cloudinary.com/..." 
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>
          <button onClick={() => setStep(2)} className="btn-gold flex items-center justify-center gap-2">التالي <ArrowLeft size={18}/></button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 text-right" dir="rtl">
          <input className="input-field" placeholder="اسم المنتج (مثال: خاتم السلطان)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="السعر (مثال: ₺20,000)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <select className="input-field" value={formData.web_section} onChange={(e) => setFormData({...formData, web_section: e.target.value})}>
              <option value="rings">الخواتم</option>
              <option value="necklaces">القلادات</option>
              <option value="bracelets">الأساور</option>
            </select>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => setStep(3)} className="btn-gold flex-1">مراجعة ونشر</button>
            <button onClick={() => setStep(1)} className="bg-white/5 p-4 rounded-lg"><ArrowRight/></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center flex flex-col gap-8">
          <div className="bg-green-500/20 text-green-400 p-6 rounded-2xl flex flex-col items-center gap-2">
            <CheckCircle size={48} />
            <span className="font-bold">جاهز للإضافة!</span>
          </div>
          <div className="text-right glass-panel p-6 bg-white/5">
            <p className="text-gold font-bold">{formData.name}</p>
            <p className="text-white/60">{formData.price}</p>
            <p className="text-xs text-white/30 mt-2">سيتم النشر تلقائياً على الموقع</p>
          </div>
          <button onClick={handleSubmit} className="btn-gold">تأكيد الحفظ النهائي</button>
        </div>
      )}
    </motion.div>
  );
}

function InventoryView({ inventory, updateItem, setView }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة المخزون</h2>
        <button onClick={() => setView("wizard")} className="bg-gold text-black p-2 rounded-full"><PlusCircle/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventory.map(item => (
          <div key={item.ID} className="glass-panel p-4 flex items-center gap-6">
            <img src={item.GEN_IMAGES?.[0] || item.IMAGE_URL || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-lg object-cover bg-white/5" />
            <div className="flex-1">
              <h4 className="font-bold text-lg">{item.NAME}</h4>
              <p className="text-gold text-sm font-bold">{item.PRICE || '---'}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => updateItem(item.ID, { ON_WEBSITE: !item.ON_WEBSITE })}
                className={`p-2 rounded-lg transition-all ${item.ON_WEBSITE ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}
              >
                {item.ON_WEBSITE ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button className="p-2 rounded-lg bg-white/5 text-pink-400 hover:bg-pink-400/20">
                <Instagram size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;
