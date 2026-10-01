"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Watch, 
  Disc, 
  Cpu, 
  Layers, 
  Tag, 
  Info, 
  Trash2
} from "lucide-react";
import type { Specification } from "@/db/actions";

const MATERIAL_PRESETS = [
  "Stainless steel",
  "Titanium",
  "Rose gold",
  "Yellow gold",
  "Ceramic",
  "Bronze",
  "Stainless steel and rose gold PVD bezel",
  "Stainless steel and ceramic bezel",
];

const GLASS_PRESETS = [
  "Sapphire crystal",
  "Scratch-resistant sapphire crystal",
  "Mineral crystal",
  "Acrylic / Hesalite",
];

const DIMENSION_PRESETS = [
  "34.00 mm",
  "36.00 mm",
  "38.00 mm",
  "39.00 mm",
  "40.00 mm",
  "41.00 mm",
  "42.00 mm",
  "43.00 mm",
  "44.00 mm",
  "45.00 mm",
];

const WATER_PRESETS = [
  "3 bar (30 m)",
  "5 bar (50 m)",
  "10 bar (100 m)",
  "20 bar (200 m)",
  "30 bar (300 m)",
];

const MOVEMENT_PRESETS = [
  "Quartz",
  "Automatic",
  "Manual winding",
  "Kinetic",
  "Solar",
];

const POWER_PRESETS = [
  "N/A (Quartz)",
  "~40 hours",
  "~70 hours",
  "~72 hours",
  "~80 hours",
  "3 days",
  "5 days",
];

function caseInsensitiveMatch(value: string, presets: string[]): string | null {
  const needle = value.trim().toLowerCase();
  if (!needle) return null;
  return presets.find((p) => p.toLowerCase() === needle) || null;
}

function parseMillimetres(value: string): number | null {
  const match = value.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(?:mm)?/i);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? n : null;
}

function parseWaterMetres(value: string): number | null {
  const lower = value.toLowerCase();
  const metres = lower.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)\b/);
  if (metres) {
    const n = parseFloat(metres[1]);
    return Number.isFinite(n) ? n : null;
  }
  const pressure = lower.match(/(\d+(?:\.\d+)?)\s*(?:atm|bar)\b/);
  if (pressure) {
    const n = parseFloat(pressure[1]);
    return Number.isFinite(n) ? n * 10 : null;
  }
  return null;
}

function matchDimension(value: string, presets: string[]): string {
  const exact = caseInsensitiveMatch(value, presets);
  if (exact) return exact;
  const mm = parseMillimetres(value);
  if (mm == null) return value;
  const hit = presets.find((p) => parseMillimetres(p) === mm);
  return hit || value;
}

function matchWater(value: string, presets: string[]): string {
  const exact = caseInsensitiveMatch(value, presets);
  if (exact) return exact;
  const metres = parseWaterMetres(value);
  if (metres == null) return value;
  const hit = presets.find((p) => parseWaterMetres(p) === metres);
  return hit || value;
}

function matchMaterial(value: string, presets: string[]): string {
  const exact = caseInsensitiveMatch(value, presets);
  if (exact) return exact;
  const n = value.trim().toLowerCase();
  if (!n) return value;
  if (n === "steel" || n === "ss") return "Stainless steel";
  if (n.includes("ceramic") && n.includes("steel")) {
    return (
      presets.find((p) => {
        const lower = p.toLowerCase();
        return lower.includes("ceramic") && lower.includes("steel");
      }) || value
    );
  }
  if (n.includes("rose") && n.includes("steel")) {
    return (
      presets.find((p) => {
        const lower = p.toLowerCase();
        return lower.includes("rose gold") && lower.includes("steel");
      }) || value
    );
  }
  return value;
}

function matchGeneric(value: string, presets: string[]): string {
  return caseInsensitiveMatch(value, presets) || value;
}

function uniqueOptions(presets: string[], extra: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const opt of [...presets, extra]) {
    const trimmed = opt.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

interface WatchSpecs {
  // Case
  caseMaterial: string;
  caseGlass: string;
  caseDimension: string;
  caseWaterResistance: string;
  caseThickness: string;
  caseLugWidth: string;

  // Dial & Hands
  dialColor: string;
  dialHands: string;
  dialHourMarkers: string;
  dialSpecificities: string;

  // Movement & Functions
  movementType: string;
  movementCaliber: string;
  movementPowerReserve: string;
  movementAccuracy: string;
  movementFunctions: string[];

  // Strap
  strapContent: string;

  // Style
  styleCategories: string[];

  // General
  generalContent: string;
}

function parseSpecs(value: Specification[]): WatchSpecs {
  const specs: WatchSpecs = {
    caseMaterial: "",
    caseGlass: "",
    caseDimension: "",
    caseWaterResistance: "",
    caseThickness: "",
    caseLugWidth: "",
    dialColor: "",
    dialHands: "",
    dialHourMarkers: "",
    dialSpecificities: "",
    movementType: "",
    movementCaliber: "",
    movementPowerReserve: "",
    movementAccuracy: "",
    movementFunctions: [],
    strapContent: "",
    styleCategories: [],
    generalContent: "",
  };

  if (!Array.isArray(value)) return specs;

  for (const sec of value) {
    const title = (sec.title || "").toLowerCase().trim();
    if (title === "case") {
      const items = sec.items || [];
      for (const item of items) {
        if (typeof item !== "string") continue;
        const idx = item.indexOf(":");
        if (idx === -1) continue;
        const key = item.substring(0, idx).toLowerCase().trim();
        const val = item.substring(idx + 1).trim();
        if (key === "material") specs.caseMaterial = matchMaterial(val, MATERIAL_PRESETS);
        else if (key === "glass") specs.caseGlass = matchGeneric(val, GLASS_PRESETS);
        else if (key === "dimension") specs.caseDimension = matchDimension(val, DIMENSION_PRESETS);
        else if (key === "water resistance") specs.caseWaterResistance = matchWater(val, WATER_PRESETS);
        else if (key === "thickness") specs.caseThickness = val;
        else if (key === "lug width") specs.caseLugWidth = val;
      }
    } else if (title === "dial & hands") {
      const items = sec.items || [];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const label = (item.label || "").toLowerCase().trim();
        const val = item.value || "";
        if (label === "dial color") specs.dialColor = val;
        else if (label === "hands") specs.dialHands = val;
        else if (label === "hour markers") specs.dialHourMarkers = val;
        else if (label === "specificities") specs.dialSpecificities = val;
      }
    } else if (title === "movement & functions") {
      const items = sec.items || [];
      for (const item of items) {
        if (typeof item !== "string") continue;
        const idx = item.indexOf(":");
        if (idx === -1) continue;
        const key = item.substring(0, idx).toLowerCase().trim();
        const val = item.substring(idx + 1).trim();
        if (key === "movement type") specs.movementType = matchGeneric(val, MOVEMENT_PRESETS);
        else if (key === "caliber") specs.movementCaliber = val;
        else if (key === "power reserve") specs.movementPowerReserve = matchGeneric(val, POWER_PRESETS);
        else if (key === "accuracy") specs.movementAccuracy = val;
        else if (key === "functions") {
          specs.movementFunctions = [
            ...new Set(
              val
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean),
            ),
          ];
        }
      }
    } else if (title === "strap") {
      specs.strapContent = sec.content || "";
    } else if (title === "general") {
      specs.generalContent = sec.content || "";
    } else if (title === "style") {
      const items = sec.items || [];
      const cats = items
        .map((item: any) => {
          if (typeof item !== "string") return "";
          return item.replace(/^Category:\s*/i, "").trim();
        })
        .filter(Boolean);
      specs.styleCategories = [...new Set(cats)];
    }
  }

  return specs;
}

function compileSpecs(specs: WatchSpecs, custom: Specification[]): Specification[] {
  const result: Specification[] = [];

  // Case
  const caseItems = [
    specs.caseMaterial && `Material: ${specs.caseMaterial}`,
    specs.caseGlass && `Glass: ${specs.caseGlass}`,
    specs.caseDimension && `Dimension: ${specs.caseDimension}`,
    specs.caseWaterResistance && `Water Resistance: ${specs.caseWaterResistance}`,
    specs.caseThickness && `Thickness: ${specs.caseThickness}`,
    specs.caseLugWidth && `Lug width: ${specs.caseLugWidth}`,
  ].filter(Boolean) as string[];

  if (caseItems.length > 0) {
    result.push({
      title: "Case",
      type: "details",
      items: caseItems,
    });
  }

  // Dial & Hands
  const dialItems = [
    specs.dialColor && { label: "Dial color", value: specs.dialColor },
    specs.dialHands && { label: "Hands", value: specs.dialHands },
    specs.dialHourMarkers && { label: "Hour markers", value: specs.dialHourMarkers },
    specs.dialSpecificities && { label: "Specificities", value: specs.dialSpecificities },
  ].filter(Boolean) as { label: string; value: string }[];

  if (dialItems.length > 0) {
    result.push({
      title: "Dial & Hands",
      type: "grid",
      items: dialItems,
    });
  }

  // Movement & Functions
  const movementItems = [
    specs.movementType && `Movement Type: ${specs.movementType}`,
    specs.movementCaliber && `Caliber: ${specs.movementCaliber}`,
    specs.movementPowerReserve && `Power Reserve: ${specs.movementPowerReserve}`,
    specs.movementAccuracy && `Accuracy: ${specs.movementAccuracy}`,
    specs.movementFunctions && specs.movementFunctions.length > 0 && `Functions: ${specs.movementFunctions.join(", ")}`,
  ].filter(Boolean) as string[];

  if (movementItems.length > 0) {
    result.push({
      title: "Movement & Functions",
      type: "details",
      items: movementItems,
    });
  }

  // Strap
  if (specs.strapContent) {
    result.push({
      title: "Strap",
      type: "text",
      content: specs.strapContent,
    });
  }

  // Style
  if (specs.styleCategories && specs.styleCategories.length > 0) {
    const cats = specs.styleCategories
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => `Category: ${c}`);

    if (cats.length > 0) {
      result.push({
        title: "Style",
        type: "details",
        items: cats,
      });
    }
  }

  // General
  if (specs.generalContent) {
    result.push({
      title: "General",
      type: "text",
      content: specs.generalContent,
    });
  }

  // Custom/Legacy sections
  result.push(...custom);

  return result;
}

export default function SpecificationBuilder({
  value,
  onChange,
}: {
  value: Specification[];
  onChange: (specs: Specification[]) => void;
}) {
  const [specs, setSpecs] = useState<WatchSpecs>(() => parseSpecs(value));
  const [customSections, setCustomSections] = useState<Specification[]>(() => {
    const recognizedTitles = ["case", "dial & hands", "movement & functions", "strap", "style", "general"];
    return value.filter(sec => !recognizedTitles.includes((sec.title || "").toLowerCase().trim()));
  });

  const isUpdatingFromProps = useRef(false);

  useEffect(() => {
    isUpdatingFromProps.current = true;
    setSpecs(parseSpecs(value));
    const recognizedTitles = ["case", "dial & hands", "movement & functions", "strap", "style", "general"];
    setCustomSections(value.filter(sec => !recognizedTitles.includes((sec.title || "").toLowerCase().trim())));
    isUpdatingFromProps.current = false;
  }, [value]);

  const handleChange = (field: keyof WatchSpecs, val: any) => {
    const nextSpecs = { ...specs, [field]: val };
    setSpecs(nextSpecs);
    onChange(compileSpecs(nextSpecs, customSections));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--admin-heading)]">Product Specifications</h2>
        <p className="text-sm text-[var(--admin-muted)] mt-1">
          Enter the specifications for the watch. Fields left empty will not be shown on the product page.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Section */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--admin-line)] pb-3 mb-2">
            <Watch className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-[var(--admin-heading)]">Case</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PresetDropdown
              label="Material"
              id="caseMaterial"
              value={specs.caseMaterial}
              presets={MATERIAL_PRESETS}
              onChange={(val) => handleChange("caseMaterial", val)}
            />
            <PresetDropdown
              label="Glass"
              id="caseGlass"
              value={specs.caseGlass}
              presets={GLASS_PRESETS}
              onChange={(val) => handleChange("caseGlass", val)}
            />
            <PresetDropdown
              label="Dimension"
              id="caseDimension"
              value={specs.caseDimension}
              presets={DIMENSION_PRESETS}
              onChange={(val) => handleChange("caseDimension", val)}
            />
            <PresetDropdown
              label="Water Resistance"
              id="caseWaterResistance"
              value={specs.caseWaterResistance}
              presets={WATER_PRESETS}
              onChange={(val) => handleChange("caseWaterResistance", val)}
            />
            <div>
              <label className="admin-label" htmlFor="caseThickness">Thickness</label>
              <input
                id="caseThickness"
                className="admin-input"
                value={specs.caseThickness}
                onChange={(e) => handleChange("caseThickness", e.target.value)}
                placeholder="12.50 mm"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="caseLugWidth">Lug Width</label>
              <input
                id="caseLugWidth"
                className="admin-input"
                value={specs.caseLugWidth}
                onChange={(e) => handleChange("caseLugWidth", e.target.value)}
                placeholder="21 mm"
              />
            </div>
          </div>
        </div>

        {/* Dial & Hands Section */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--admin-line)] pb-3 mb-2">
            <Disc className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-[var(--admin-heading)]">Dial & Hands</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label" htmlFor="dialColor">Dial Color</label>
              <input
                id="dialColor"
                className="admin-input"
                value={specs.dialColor}
                onChange={(e) => handleChange("dialColor", e.target.value)}
                placeholder="Rose gold sunray"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="dialHands">Hands</label>
              <input
                id="dialHands"
                className="admin-input"
                value={specs.dialHands}
                onChange={(e) => handleChange("dialHands", e.target.value)}
                placeholder="Rose gold leaf hands"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="dialHourMarkers">Hour Markers</label>
              <input
                id="dialHourMarkers"
                className="admin-input"
                value={specs.dialHourMarkers}
                onChange={(e) => handleChange("dialHourMarkers", e.target.value)}
                placeholder="Printed rose gold markers"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="dialSpecificities">Specificities</label>
              <input
                id="dialSpecificities"
                className="admin-input"
                value={specs.dialSpecificities}
                onChange={(e) => handleChange("dialSpecificities", e.target.value)}
                placeholder="Swiss Super-LumiNova®"
              />
            </div>
          </div>
        </div>

        {/* Movement & Functions Section */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--admin-line)] pb-3 mb-2">
            <Cpu className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-[var(--admin-heading)]">Movement & Functions</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PresetDropdown
              label="Movement Type"
              id="movementType"
              value={specs.movementType}
              presets={MOVEMENT_PRESETS}
              onChange={(val) => handleChange("movementType", val)}
            />
            <div>
              <label className="admin-label" htmlFor="movementCaliber">Caliber</label>
              <input
                id="movementCaliber"
                className="admin-input"
                value={specs.movementCaliber}
                onChange={(e) => handleChange("movementCaliber", e.target.value)}
                placeholder="L888"
              />
            </div>
            <PresetDropdown
              label="Power Reserve"
              id="movementPowerReserve"
              value={specs.movementPowerReserve}
              presets={POWER_PRESETS}
              onChange={(val) => handleChange("movementPowerReserve", val)}
            />
            <div>
              <label className="admin-label" htmlFor="movementAccuracy">Accuracy</label>
              <input
                id="movementAccuracy"
                className="admin-input"
                value={specs.movementAccuracy}
                onChange={(e) => handleChange("movementAccuracy", e.target.value)}
                placeholder="-5 to +5 seconds per day"
              />
            </div>
            <div className="sm:col-span-2">
              <ChipsEditor
                label="Functions"
                id="movementFunctions"
                values={specs.movementFunctions}
                onChange={(vals) => handleChange("movementFunctions", vals)}
                placeholder="Type a function (e.g. Hours, Date) and click Add"
              />
            </div>
          </div>
        </div>

        {/* Strap & Style Section */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--admin-line)] pb-3 mb-2">
            <Layers className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-[var(--admin-heading)]">Strap & Style</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="admin-label" htmlFor="strapContent">Strap Description</label>
              <textarea
                id="strapContent"
                className="admin-input min-h-[75px] py-2"
                value={specs.strapContent}
                onChange={(e) => handleChange("strapContent", e.target.value)}
                placeholder="Soft taupe leather strap with rose gold-tone pin buckle."
              />
            </div>
            <div>
              <ChipsEditor
                label="Style Categories"
                id="styleCategories"
                values={specs.styleCategories}
                onChange={(vals) => handleChange("styleCategories", vals)}
                placeholder="e.g. luxury, professional, classic"
              />
            </div>
          </div>
        </div>

        {/* General Info Section */}
        <div className="admin-card p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-[var(--admin-line)] pb-3 mb-2">
            <Tag className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-[var(--admin-heading)]">General Information</h3>
          </div>
          <div>
            <label className="admin-label" htmlFor="generalContent">General Info / Extra Notes</label>
            <textarea
              id="generalContent"
              className="admin-input min-h-[80px] py-2"
              value={specs.generalContent}
              onChange={(e) => handleChange("generalContent", e.target.value)}
              placeholder="Exclusive edition combining technical excellence with elegant design."
            />
          </div>
        </div>
      </div>

      {/* Custom/Legacy sections preservation */}
      {customSections.length > 0 && (
        <div className="admin-card border-amber-200 bg-amber-50/20 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-800">
                Legacy Custom Sections (Preserved)
              </h4>
              <p className="text-xs text-amber-700">
                This product contains custom specification sections that do not map to the standard fields above.
                They will be kept in the database unless you delete them here.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {customSections.map((sec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-amber-200 rounded text-xs text-amber-900 shadow-sm"
                  >
                    <span>
                      <strong>{sec.title}</strong> ({sec.type})
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 transition-colors p-0.5 rounded hover:bg-red-50"
                      onClick={() => {
                        const nextCustom = customSections.filter((_, idx) => idx !== i);
                        setCustomSections(nextCustom);
                        onChange(compileSpecs(specs, nextCustom));
                      }}
                      title="Delete section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PresetDropdown = ({
  label,
  id,
  value,
  presets,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  presets: string[];
  onChange: (val: string) => void;
}) => {
  const [extras, setExtras] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const options = uniqueOptions([...presets, ...extras], value);

  const commitCustom = () => {
    const cleaned = customVal.trim();
    if (!cleaned) return;
    const matched =
      caseInsensitiveMatch(cleaned, options) || cleaned;
    if (!options.some((opt) => opt.toLowerCase() === matched.toLowerCase())) {
      setExtras((prev) => uniqueOptions(prev, matched));
    }
    onChange(matched);
    setCustomVal("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div>
        <label className="admin-label" htmlFor={id}>
          {label}
        </label>
        <div className="flex gap-1.5">
          <input
            id={id}
            className="admin-input flex-1"
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            placeholder={`Enter custom ${label.toLowerCase()}...`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitCustom();
              }
            }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-primary px-3 text-xs shrink-0"
            onClick={commitCustom}
          >
            Add
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary px-3 text-xs shrink-0"
            onClick={() => {
              setIsAdding(false);
              setCustomVal("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id={id}
          className="admin-input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Select --</option>
          {options.map((opt, index) => (
            <option key={`${id}-${index}-${opt}`} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn admin-btn-secondary px-3 text-lg font-bold shrink-0"
          onClick={() => setIsAdding(true)}
          title={`Add custom ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

const ChipsEditor = ({
  label,
  id,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) => {
  const [input, setInput] = useState("");

  const addChip = () => {
    if (input.trim()) {
      // Split by comma if the user types commas to add multiple chips at once
      const items = input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      
      const newItems = [...values];
      let updated = false;

      for (const item of items) {
        if (!newItems.includes(item)) {
          newItems.push(item);
          updated = true;
        }
      }

      if (updated) {
        onChange(newItems);
      }
      setInput("");
    }
  };

  const removeChip = (valToRemove: string) => {
    onChange(values.filter((v) => v !== valToRemove));
  };

  return (
    <div>
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            id={id}
            className="admin-input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip();
              }
            }}
            placeholder={placeholder}
          />
          <button
            type="button"
            className="admin-btn admin-btn-secondary px-3 shrink-0"
            onClick={addChip}
          >
            Add
          </button>
        </div>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--admin-bg)] border border-[var(--admin-line)] rounded-lg min-h-[42px]">
            {values.map((v, index) => (
              <span
                key={`${id}-${index}-${v}`}
                className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {v}
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-700 font-bold ml-0.5 text-[10px]"
                  onClick={() => removeChip(v)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
