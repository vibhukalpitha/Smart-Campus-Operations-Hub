import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { resourceService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { ArrowLeft, Save, Loader } from 'lucide-react';

// ── Type-rule sets ─────────────────────────────────────────────────────────────
// Availability times hidden for these types
const HIDE_AVAILABILITY = new Set([
  'LECTURE_HALL','LAB','MEETING_ROOM',
  'PROJECTOR','CAMERA','SMART_BOARD','EQUIPMENT',
  'PUBLIC_COMPUTERS','CRICKET','BADMINTON',
]);
// Capacity field hidden (auto-derived) for these types
const HIDE_CAPACITY = new Set(['PUBLIC_COMPUTERS','CRICKET','BADMINTON']);
// Location shown as store-room dropdown for these types
const STORE_ROOM_TYPES = new Set(['PROJECTOR','CAMERA','SMART_BOARD','EQUIPMENT']);
// Location shown as floor dropdown for Public Computers
const FLOOR_TYPES = new Set(['PUBLIC_COMPUTERS']);
// Sport types get their own dedicated form
const SPORT_TYPES = new Set(['CRICKET','BADMINTON']);

const STORE_ROOMS = ['Main Building Store Room', 'New Building Store Room'];

const getPanel = (type) => {
  if (type === 'PUBLIC_COMPUTERS') return 'publicComputers';
  if (type === 'CRICKET')          return 'cricket';
  if (type === 'BADMINTON')        return 'badminton';
  return 'standard';
};

const TYPE_LABELS = {
  LECTURE_HALL:'Lecture Hall', LAB:'Lab', MEETING_ROOM:'Meeting Room',
  PUBLIC_COMPUTERS:'Public Computers', PROJECTOR:'Projector', CAMERA:'Camera',
  SMART_BOARD:'Smart Board', EQUIPMENT:'Other Equipments',
  CRICKET:'Cricket Equipment', BADMINTON:'Badminton Equipment',
};

// ── Shared CSS ─────────────────────────────────────────────────────────────────
const inp = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all';
const sel = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all [&_option]:bg-slate-900 [&_option]:text-white';
const lbl = 'block text-sm font-semibold text-purple-300 mb-2';
const sec = 'text-xs font-bold text-purple-400/60 uppercase tracking-widest pb-2 border-b border-white/5 mb-5';

const Field = ({ label, required, children }) => (
  <div>
    <label className={lbl}>{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    {children}
  </div>
);

const ResourceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name:'', type: searchParams.get('type') || '',
    capacity:'', location:'', status:'ACTIVE',
    availableFrom:'', availableTo:'',
    deviceBrand:'', processor:'', ramCapacity:'', networkAccess:'',
    bats:'', balls:'', stumps:'',
    rackets:'', shuttlecocks:'',
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (isEditMode) fetchResourceData(); }, [id]);

  const fetchResourceData = async () => {
    setLoading(true); setError(null);
    try {
      const d = (await resourceService.getResourceById(id)).data;
      setFormData({
        name: d.name||'', type: d.type||'',
        capacity: d.capacity!=null ? String(d.capacity) : '',
        location: d.location||'', status: d.status||'ACTIVE',
        availableFrom: d.availableFrom||'', availableTo: d.availableTo||'',
        deviceBrand: d.deviceBrand||'', processor: d.processor||'',
        ramCapacity: d.ramCapacity||'', networkAccess: d.networkAccess||'',
        bats:   d.bats!=null   ? String(d.bats)   : '',
        balls:  d.balls!=null  ? String(d.balls)  : '',
        stumps: d.stumps!=null ? String(d.stumps) : '',
        rackets:      d.rackets!=null      ? String(d.rackets)      : '',
        shuttlecocks: d.shuttlecocks!=null ? String(d.shuttlecocks) : '',
      });
    } catch { setError('Failed to load resource. Please try again.'); }
    finally  { setLoading(false); }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const deriveCapacity = () => {
    const t = formData.type;
    if (t === 'CRICKET')
      return Math.max(1,(parseInt(formData.bats)||0)+(parseInt(formData.balls)||0)+(parseInt(formData.stumps)||0));
    if (t === 'BADMINTON')
      return Math.max(1,(parseInt(formData.rackets)||0)+(parseInt(formData.shuttlecocks)||0));
    if (t === 'PUBLIC_COMPUTERS') return 1;
    return parseInt(formData.capacity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    const panel       = getPanel(formData.type);
    const hideCapacity = HIDE_CAPACITY.has(formData.type);

    if (!formData.name || !formData.location) {
      setError('Please fill in all required fields.'); setSubmitting(false); return;
    }
    if (!hideCapacity && !formData.capacity) {
      setError('Please enter a capacity.'); setSubmitting(false); return;
    }
    if (panel === 'publicComputers' &&
        (!formData.deviceBrand||!formData.processor||!formData.ramCapacity||!formData.networkAccess)) {
      setError('Please fill in all Public Computer specification fields.'); setSubmitting(false); return;
    }
    if (panel === 'cricket' && (!formData.bats||!formData.balls||!formData.stumps)) {
      setError('Please enter all Cricket equipment quantities.'); setSubmitting(false); return;
    }
    if (panel === 'badminton' && (!formData.rackets||!formData.shuttlecocks)) {
      setError('Please enter all Badminton equipment quantities.'); setSubmitting(false); return;
    }

    try {
      const hideAvail = HIDE_AVAILABILITY.has(formData.type);
      const payload = {
        name: formData.name, type: formData.type,
        capacity: deriveCapacity(),
        location: formData.location, status: formData.status,
        availableFrom: hideAvail ? null : (formData.availableFrom||null),
        availableTo:   hideAvail ? null : (formData.availableTo||null),
        deviceBrand: formData.deviceBrand||null, processor: formData.processor||null,
        ramCapacity: formData.ramCapacity||null, networkAccess: formData.networkAccess||null,
        bats:   formData.bats   ? parseInt(formData.bats)   : null,
        balls:  formData.balls  ? parseInt(formData.balls)  : null,
        stumps: formData.stumps ? parseInt(formData.stumps) : null,
        rackets:      formData.rackets      ? parseInt(formData.rackets)      : null,
        shuttlecocks: formData.shuttlecocks ? parseInt(formData.shuttlecocks) : null,
      };
      if (isEditMode) await resourceService.updateResource(id, payload);
      else            await resourceService.createResource(payload);
      navigate('/admin/resources');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally { setSubmitting(false); }
  };

  const panel        = getPanel(formData.type);
  const isSport      = SPORT_TYPES.has(formData.type);
  const hideCapacity = HIDE_CAPACITY.has(formData.type);
  const hideAvail    = HIDE_AVAILABILITY.has(formData.type) || !formData.type;
  const useStoreRoom = STORE_ROOM_TYPES.has(formData.type);
  const useFloor     = FLOOR_TYPES.has(formData.type);
  const typeLabel    = TYPE_LABELS[formData.type] || formData.type || 'Resource';

  // ── Type badge (read-only, shown instead of a dropdown) ───────────────────
  const TypeBadge = () => formData.type ? (
    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit">
      <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Type</span>
      <span className="text-white font-bold">{typeLabel}</span>
    </div>
  ) : null;

  const StatusSelect = () => (
    <Field label="Status">
      <select name="status" value={formData.status} onChange={onChange} className={sel}>
        <option value="ACTIVE">Active</option>
        <option value="OUT_OF_SERVICE">Out of Service</option>
      </select>
    </Field>
  );

  const FormButtons = () => (
    <div className="flex gap-4 pt-2">
      <button type="submit" disabled={submitting}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-105 disabled:hover:scale-100">
        {submitting
          ? <><Loader className="w-5 h-5 animate-spin"/>Saving...</>
          : <><Save className="w-5 h-5"/>{isEditMode ? 'Update Resource' : 'Create Resource'}</>}
      </button>
      <button type="button" onClick={() => navigate('/admin/resources')} disabled={submitting}
        className="flex-1 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 rounded-xl font-semibold transition-all">
        Cancel
      </button>
    </div>
  );

  return (
    <AdminLayout activeSection="facilities">
      <div className="space-y-8">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/resources')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Go back">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 tracking-tight">
              {isEditMode ? `Edit — ${typeLabel}` : `Add New ${typeLabel}`}
            </h1>
            <p className="text-purple-200/60 mt-1">
              {isEditMode ? 'Update resource details below' : 'Fill in the details to create a new resource'}
            </p>
          </div>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/>
              <p className="text-purple-300">Loading resource...</p>
            </div>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ════════════════════════════════════════════════════════
                CRICKET FORM
            ════════════════════════════════════════════════════════ */}
            {panel === 'cricket' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <p className={sec + ' mb-0 border-0 pb-0'}>Cricket Resource Details</p>
                  <TypeBadge/>
                </div>
                <div className="border-b border-white/5"/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Resource Name" required>
                    <input type="text" name="name" value={formData.name} onChange={onChange}
                      placeholder="e.g., Cricket Equipment Set A" required className={inp}/>
                  </Field>
                  <StatusSelect/>
                </div>

                <Field label="Storage Location" required>
                  <input type="text" name="location" value={formData.location} onChange={onChange}
                    placeholder="e.g., Sports Complex Store Room" required className={inp}/>
                </Field>

                <div>
                  <p className={sec}>Equipment Inventory</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Field label="Number of Bats" required>
                      <input type="number" name="bats" value={formData.bats} onChange={onChange}
                        placeholder="0" min="0" className={inp}/>
                    </Field>
                    <Field label="Number of Balls" required>
                      <input type="number" name="balls" value={formData.balls} onChange={onChange}
                        placeholder="0" min="0" className={inp}/>
                    </Field>
                    <Field label="Number of Stumps" required>
                      <input type="number" name="stumps" value={formData.stumps} onChange={onChange}
                        placeholder="0" min="0" className={inp}/>
                    </Field>
                  </div>
                </div>

                <FormButtons/>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════
                BADMINTON FORM
            ════════════════════════════════════════════════════════ */}
            {panel === 'badminton' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <p className={sec + ' mb-0 border-0 pb-0'}>Badminton Resource Details</p>
                  <TypeBadge/>
                </div>
                <div className="border-b border-white/5"/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Resource Name" required>
                    <input type="text" name="name" value={formData.name} onChange={onChange}
                      placeholder="e.g., Badminton Equipment Set A" required className={inp}/>
                  </Field>
                  <StatusSelect/>
                </div>

                <Field label="Storage Location" required>
                  <input type="text" name="location" value={formData.location} onChange={onChange}
                    placeholder="e.g., Sports Complex Store Room" required className={inp}/>
                </Field>

                <div>
                  <p className={sec}>Equipment Inventory</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Number of Rackets" required>
                      <input type="number" name="rackets" value={formData.rackets} onChange={onChange}
                        placeholder="0" min="0" className={inp}/>
                    </Field>
                    <Field label="Number of Shuttlecocks" required>
                      <input type="number" name="shuttlecocks" value={formData.shuttlecocks} onChange={onChange}
                        placeholder="0" min="0" className={inp}/>
                    </Field>
                  </div>
                </div>

                <FormButtons/>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════
                ALL OTHER FORMS  (Lecture Hall, Lab, Meeting Room,
                Public Computers, Projector, Camera, Smart Board,
                Other Equipments)
            ════════════════════════════════════════════════════════ */}
            {!isSport && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <p className={sec + ' mb-0 border-0 pb-0'}>Resource Details</p>
                  <TypeBadge/>
                </div>
                <div className="border-b border-white/5"/>

                {/* Resource Name */}
                <Field label="Resource Name" required>
                  <input type="text" name="name" value={formData.name} onChange={onChange}
                    placeholder="e.g., Physics Lab 101" required className={inp}/>
                </Field>

                {/* Capacity (hidden for PUBLIC_COMPUTERS) */}
                {!hideCapacity && (
                  <Field label="Capacity" required>
                    <input type="number" name="capacity" value={formData.capacity} onChange={onChange}
                      placeholder="e.g., 30" min="1" required className={inp}/>
                  </Field>
                )}

                {/* Location — text / store-room dropdown / floor dropdown */}
                <Field label="Location" required>
                  {useStoreRoom ? (
                    <select name="location" value={formData.location} onChange={onChange} required className={sel}>
                      <option value="">Select Store Room</option>
                      {STORE_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : useFloor ? (
                    <select name="location" value={formData.location} onChange={onChange} required className={sel}>
                      <option value="">Select Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                    </select>
                  ) : (
                    <input type="text" name="location" value={formData.location} onChange={onChange}
                      placeholder="e.g., Building A, Floor 2" required className={inp}/>
                  )}
                </Field>

                {/* Status */}
                <StatusSelect/>

                {/* Availability — only shown when NOT in the hide-set (now all types hide it) */}
                {!hideAvail && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Available From">
                      <input type="time" name="availableFrom" value={formData.availableFrom} onChange={onChange} className={inp}/>
                    </Field>
                    <Field label="Available To">
                      <input type="time" name="availableTo" value={formData.availableTo} onChange={onChange} className={inp}/>
                    </Field>
                  </div>
                )}

                {/* ── Public Computers extra specs ────────────────────── */}
                {panel === 'publicComputers' && (
                  <>
                    <p className={sec}>Computer Specifications</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Device Brand" required>
                        <input type="text" name="deviceBrand" value={formData.deviceBrand} onChange={onChange}
                          placeholder="e.g., Dell, HP, Lenovo" className={inp}/>
                      </Field>
                      <Field label="Processor" required>
                        <input type="text" name="processor" value={formData.processor} onChange={onChange}
                          placeholder="e.g., Intel Core i5-12th Gen" className={inp}/>
                      </Field>
                      <Field label="RAM Capacity" required>
                        <select name="ramCapacity" value={formData.ramCapacity} onChange={onChange} className={sel}>
                          <option value="">Select RAM</option>
                          {['4 GB','8 GB','16 GB','32 GB','64 GB'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Network Access (WiFi)" required>
                        <select name="networkAccess" value={formData.networkAccess} onChange={onChange} className={sel}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </Field>
                    </div>
                  </>
                )}

                <FormButtons/>
              </div>
            )}

          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default ResourceFormPage;
