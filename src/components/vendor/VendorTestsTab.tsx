import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Save,
  X,
  Clock,
  Sparkles,
  Tag,
  DollarSign,
  Droplet,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { TestItem } from '../../types';

export const VendorTestsTab: React.FC = () => {
  const { vendorTests, addVendorTest, updateVendorTest, deleteVendorTest } = useCms();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [deletingTest, setDeletingTest] = useState<TestItem | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [testForm, setTestForm] = useState<Omit<TestItem, 'id'>>({
    name: '',
    code: 'TST-101',
    category: 'Biochemistry',
    sampleType: 'Serum / Clot Activator',
    unit: 'mg/dL',
    normalRange: '70 - 110 mg/dL',
    priceINR: 250,
    tatHours: 4,
    description: 'Quantitative in-vitro diagnostic test',
    isPopular: false,
  });

  const categories = [
    'All',
    'Hematology',
    'Biochemistry',
    'Thyroid & Hormones',
    'Diabetes',
    'Urine Analysis',
    'Immunology',
    'Vitamins & Minerals',
  ];

  const filteredTests = vendorTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || test.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingTest(null);
    setTestForm({
      name: '',
      code: `TST-${(vendorTests.length + 101).toString()}`,
      category: 'Biochemistry',
      sampleType: 'Serum / Clot Activator',
      unit: 'mg/dL',
      normalRange: '70 - 110 mg/dL',
      priceINR: 300,
      tatHours: 4,
      description: 'Standard clinical pathology diagnostic test',
      isPopular: false,
    });
    setIsTestModalOpen(true);
  };

  const handleOpenEditModal = (test: TestItem) => {
    setEditingTest(test);
    setTestForm({
      name: test.name,
      code: test.code,
      category: test.category,
      sampleType: test.sampleType,
      unit: test.unit || 'mg/dL',
      normalRange: test.normalRange || 'Normal',
      priceINR: test.priceINR,
      tatHours: test.tatHours,
      description: test.description,
      isPopular: !!test.isPopular,
    });
    setIsTestModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTest) {
      updateVendorTest(editingTest.id, testForm);
      setToastMessage(`Test "${testForm.name}" updated successfully.`);
    } else {
      addVendorTest(testForm);
      setToastMessage(`New test "${testForm.name}" added successfully to diagnostic catalog.`);
    }
    setIsTestModalOpen(false);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTest) return;
    deleteVendorTest(deletingTest.id);
    setToastMessage(`Test "${deletingTest.name}" deleted.`);
    setDeletingTest(null);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-50 text-[#0F766E]">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-[#123B6D]">Diagnostic Tests Catalog (Add / Edit / Delete)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure all blood, urine, and biochemical tests with biological reference ranges, sample tube types, turnaround times, and INR pricing.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Test</span>
        </button>
      </div>

      {/* Success Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test by name, code, or category..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer text-[11px] ${
                categoryFilter === cat
                  ? 'bg-[#123B6D] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Code & Test Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Specimen & Unit</th>
                <th className="px-4 py-3">Biological Reference Interval</th>
                <th className="px-4 py-3">Turnaround Time</th>
                <th className="px-4 py-3">Price (INR)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-xs">
                    No matching diagnostic tests found.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{test.name}</span>
                        {test.isPopular && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{test.code}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {test.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div>{test.sampleType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Unit: {test.unit || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-mono text-[11px]">
                      {test.normalRange || 'Standard reference'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{test.tatHours} hrs</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-[#123B6D]">
                      ₹{test.priceINR}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(test)}
                        className="p-1.5 text-slate-600 hover:text-[#123B6D] hover:bg-slate-100 rounded-md transition cursor-pointer"
                        title="Edit test parameters"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingTest(test)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Delete test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT TEST MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
            <div className="bg-[#123B6D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black">
                  {editingTest ? `Edit Diagnostic Test: ${editingTest.name}` : 'Add New Diagnostic Test'}
                </span>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Test Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="e.g. Glycosylated Hemoglobin (HbA1c)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Code & Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Test Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. HBA1C"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Thyroid & Hormones">Thyroid & Hormones</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Vitamins & Minerals">Vitamins & Minerals</option>
                    <option value="General">General Clinical</option>
                  </select>
                </div>

                {/* Specimen & Unit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sample / Specimen Tube
                  </label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="e.g. EDTA Whole Blood"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    value={testForm.unit}
                    onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                    placeholder="e.g. mg/dL, %, g/dL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Normal Range */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Biological Reference Interval (Normal Range)
                  </label>
                  <input
                    type="text"
                    value={testForm.normalRange}
                    onChange={(e) => setTestForm({ ...testForm, normalRange: e.target.value })}
                    placeholder="e.g. Non-Diabetic: < 5.7 %, Pre-Diabetic: 5.7 - 6.4 %"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Price & TAT */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Price in INR (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={testForm.priceINR}
                    onChange={(e) => setTestForm({ ...testForm, priceINR: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Turnaround Time (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={testForm.tatHours}
                    onChange={(e) => setTestForm({ ...testForm, tatHours: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#123B6D] hover:bg-[#0e2c52] text-white px-5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingTest ? 'Save Changes' : 'Add Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-full bg-rose-50">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black">Confirm Test Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deletingTest.name}</strong> (
              {deletingTest.code}) from your lab catalog?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingTest(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
