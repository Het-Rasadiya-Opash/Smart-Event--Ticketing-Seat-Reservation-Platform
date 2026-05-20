import { useState } from "react";
import { useNavigate } from "react-router";
import apiRequest from "../utils/apiRequest";
import {
  Ticket,
  CalendarDays,
  Clock,
  MapPin,
  Tag,
  Upload,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Image,
  Armchair,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = [
  "CONCERT",
  "SPORTS",
  "THEATER",
  "CONFERENCE",
  "FESTIVAL",
  "OTHER",
];
const TIERS = ["VIP", "PREMIUM", "STANDARD"];
const defaultTier = { tier: "", price: "", label: "", color: "#16a34a" };

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [pricingTiers, setPricingTiers] = useState([{ ...defaultTier }]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "CONCERT",
    city: "",
    venue: "",
    bannerUrl: "",
    startDate: "",
    endDate: "",
    saleWindowStart: "",
    saleWindowEnd: "",
    rows: "",
    seatsPerRow: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleBannerFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, bannerUrl: "" }));
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
  };

  const handleTierChange = (index, field, value) =>
    setPricingTiers(
      pricingTiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );

  const addTier = () => setPricingTiers([...pricingTiers, { ...defaultTier }]);
  const removeTier = (index) =>
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "bannerUrl" && bannerFile) return;
        if (val !== "") data.append(key, val);
      });
      if (bannerFile) data.append("bannerUrl", bannerFile);
      const validTiers = pricingTiers.filter((t) => t.tier && t.price);
      if (validTiers.length > 0)
        data.append("pricingTiers", JSON.stringify(validTiers));
      await apiRequest.post("/events/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative bg-slate-900 overflow-hidden py-12 shadow-inner">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-600/30">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
                Create New Event
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-1 pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <Card>
            <SectionHeader
              icon={<Tag className="w-4 h-4 text-green-500" />}
              title="Basic Information"
            />

            <Field label="Event Title" required>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Summer Music Festival 2026"
                className={inputCls}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" required>
                <div className="relative">
                  <select
                    name="category"
                    required
                    value={form.category}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="City" required>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Los Angeles"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Venue" required>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="venue"
                  required
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Starlight Arena"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>
          </Card>

          <Card>
            <SectionHeader
              icon={<Image className="w-4 h-4 text-green-500" />}
              title="Banner Image"
            />

            {bannerPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 border border-white/10 text-white p-1.5 rounded-full transition-all backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl py-10 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all group">
                <div className="bg-slate-100 group-hover:bg-green-100 p-3 rounded-xl transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-600 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  Click to upload banner image
                </span>
                <span className="text-xs text-slate-400">
                  PNG, JPG, WEBP supported
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerFile}
                />
              </label>
            )}

            {!bannerFile && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">
                    or paste a URL
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <Field label="Banner URL">
                  <input
                    name="bannerUrl"
                    value={form.bannerUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>
              </>
            )}
          </Card>

          <Card>
            <SectionHeader
              icon={<CalendarDays className="w-4 h-4 text-green-500" />}
              title="Event Dates"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date & Time" required>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="startDate"
                    type="datetime-local"
                    required
                    value={form.startDate}
                    onChange={handleChange}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
              <Field label="End Date & Time">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sale Window Start">
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="saleWindowStart"
                    type="datetime-local"
                    value={form.saleWindowStart}
                    onChange={handleChange}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Sale Window End">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="saleWindowEnd"
                    type="datetime-local"
                    value={form.saleWindowEnd}
                    onChange={handleChange}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader
              icon={<Armchair className="w-4 h-4 text-green-500" />}
              title="Seating Configuration"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Rows (1–26)" required>
                <input
                  name="rows"
                  type="number"
                  required
                  min={1}
                  max={26}
                  value={form.rows}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className={inputCls}
                />
              </Field>
              <Field label="Seats Per Row (1–500)" required>
                <input
                  name="seatsPerRow"
                  type="number"
                  required
                  min={1}
                  max={500}
                  value={form.seatsPerRow}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  className={inputCls}
                />
              </Field>
            </div>

            {form.rows && form.seatsPerRow && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-800 font-semibold">
                  Total capacity:{" "}
                  <span className="font-extrabold">
                    {parseInt(form.rows || 0) * parseInt(form.seatsPerRow || 0)}{" "}
                    seats
                  </span>
                </p>
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              icon={<Tag className="w-4 h-4 text-green-500" />}
              title="Pricing Tiers"
            />

            <div className="space-y-3">
              {pricingTiers.map((tier, index) => {
                const tierStyle =
                  tier.tier === "VIP"
                    ? "border-rose-100 bg-rose-50/40"
                    : tier.tier === "PREMIUM"
                      ? "border-amber-100 bg-amber-50/40"
                      : "border-slate-200 bg-slate-50/60";

                return (
                  <div
                    key={index}
                    className={`border rounded-2xl p-4 space-y-3 transition-colors ${tierStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tier {index + 1}
                        {tier.tier && (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              tier.tier === "VIP"
                                ? "bg-rose-600 text-white"
                                : tier.tier === "PREMIUM"
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-700 text-white"
                            }`}
                          >
                            {tier.tier}
                          </span>
                        )}
                      </span>
                      {pricingTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Tier Type" required>
                        <div className="relative">
                          <select
                            required
                            value={tier.tier}
                            onChange={(e) =>
                              handleTierChange(index, "tier", e.target.value)
                            }
                            className={`${inputCls} appearance-none pr-10`}
                          >
                            <option value="">Select tier</option>
                            {TIERS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="Price (₹)" required>
                        <input
                          type="number"
                          required
                          min={0}
                          value={tier.price}
                          onChange={(e) =>
                            handleTierChange(index, "price", e.target.value)
                          }
                          placeholder="e.g. 5000"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Label">
                        <input
                          value={tier.label}
                          onChange={(e) =>
                            handleTierChange(index, "label", e.target.value)
                          }
                          placeholder="e.g. VIP Front Row Access"
                          className={inputCls}
                        />
                      </Field>

                      <Field label="Seat Color">
                        <div className="flex items-center gap-3 border border-slate-300 rounded-xl px-3 py-2.5 bg-white">
                          <input
                            type="color"
                            value={tier.color}
                            onChange={(e) =>
                              handleTierChange(index, "color", e.target.value)
                            }
                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-transparent"
                          />
                          <span className="text-sm text-slate-500 font-mono">
                            {tier.color}
                          </span>
                        </div>
                      </Field>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addTier}
                className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-800 px-3 py-2 rounded-xl hover:bg-green-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Another Tier
              </button>
            </div>
          </Card>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                Publish Event
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const inputCls =
  "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all";

const Card = ({ children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
    {children}
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
    {icon}
    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

export default CreateEvent;
