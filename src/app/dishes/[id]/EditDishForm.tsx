"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Dish {
  id: number;
  name: string;
  description: string;
  quickPrep: boolean;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
  steps: string[];
  calories?: number;
}

export default function EditDishForm({ id }: { id: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/dishes/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data.dish);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    } : prev);
  };
  const handleStepChange = (idx: number, value: string) => {
    setForm(prev => prev ? {
      ...prev,
      steps: prev.steps.map((step, i) => (i === idx ? value : step)),
    } : prev);
  };
  const addStep = () => setForm(prev => prev ? { ...prev, steps: [...(prev.steps || []), ''] } : prev);
  const removeStep = (idx: number) => setForm(prev => prev ? { ...prev, steps: prev.steps.filter((_, i) => i !== idx) } : prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/dishes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        calories: form?.calories ? Number(form.calories) : null,
        steps: form?.steps?.filter(s => s.trim() !== '') || [],
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/dishes');
    } else {
      setError(data.error || 'Error al editar el platillo');
    }
  };

  if (loading || !form) return <div className="p-8" data-testid="edit-dish-loading">Cargando...</div>;

  return (
    <div className="py-10 px-2 max-w-5xl mx-auto" data-testid="edit-dish-container">
      <div className="flex flex-col md:flex-row gap-8" data-testid="edit-dish-content">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center md:w-1/2" data-testid="edit-dish-preview">
          {form.imageUrl ? (
            <Image src={form.imageUrl} alt={form.name} width={600} height={256} className="rounded-xl w-full h-64 object-cover mb-4 shadow" data-testid="edit-dish-image" />
          ) : (
            <div className="bg-gray-200 rounded-xl w-full h-64 flex items-center justify-center text-gray-400 mb-4" data-testid="edit-dish-no-image">Sin imagen</div>
          )}
          <span className="bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow mb-4 tracking-wide uppercase" data-testid="edit-dish-time-badge">{form.quickPrep ? 'Rápido' : `${form.prepTime + form.cookTime} min`}</span>
          <h2 className="font-extrabold text-2xl mb-2 text-gray-800 text-center" data-testid="edit-dish-preview-name">{form.name}</h2>
          <p className="text-gray-600 mb-4 text-center" data-testid="edit-dish-preview-description">{form.description}</p>
        </div>
        <form data-testid="edit-dish-form" className="bg-white rounded-2xl shadow-lg p-8 flex-1 flex flex-col gap-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-bold mb-2 text-green-600" data-testid="edit-dish-form-title">Editar información</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="edit-dish-fields">
            <div>
              <label className="block mb-1 font-semibold" data-testid="edit-dish-name-label">Nombre</label>
              <input data-testid="edit-dish-name" name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-3 text-lg" required placeholder="Nombre del platillo" />
            </div>
            <div>
              <label className="block mb-1 font-semibold" data-testid="edit-dish-calories-label">Calorías totales</label>
              <input type="number" name="calories" value={form.calories || ''} onChange={handleChange} className="w-full border rounded p-3 text-lg" placeholder="Calorías" min="0" data-testid="edit-dish-calories" />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-semibold" data-testid="edit-dish-description-label">Descripción</label>
              <textarea data-testid="edit-dish-description" name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-3 text-lg" required placeholder="Descripción del platillo" />
            </div>
            <div>
              <label className="block mb-1 font-semibold" data-testid="edit-dish-preptime-label">Min. preparación</label>
              <input data-testid="edit-dish-preptime" type="number" name="prepTime" value={form.prepTime} onChange={handleChange} className="w-full border rounded p-3 text-lg" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold" data-testid="edit-dish-cooktime-label">Min. cocción</label>
              <input data-testid="edit-dish-cooktime" type="number" name="cookTime" value={form.cookTime} onChange={handleChange} className="w-full border rounded p-3 text-lg" required />
            </div>
            <div className="md:col-span-2 flex items-center gap-2" data-testid="edit-dish-quickprep-row">
              <input data-testid="edit-dish-quickprep" type="checkbox" name="quickPrep" checked={form.quickPrep} onChange={handleChange} />
              <label className="font-semibold" data-testid="edit-dish-quickprep-label">Preparación rápida</label>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-semibold" data-testid="edit-dish-image-label">URL de imagen</label>
              <input data-testid="edit-dish-image-url" name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} className="w-full border rounded p-3 text-lg" placeholder="URL de imagen" />
            </div>
          </div>
          <div className="mt-2" data-testid="edit-dish-steps-section">
            <label className="block font-bold mb-2 text-green-600" data-testid="edit-dish-steps-title">Pasos de preparación</label>
            {form.steps && form.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2" data-testid="edit-dish-step-row">
                <input
                  type="text"
                  value={step}
                  onChange={e => handleStepChange(idx, e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder={`Paso ${idx + 1}`}
                  required={idx === 0}
                  data-testid="edit-dish-step-input"
                />
                {form.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(idx)} className="text-red-500 font-bold" data-testid="edit-dish-step-remove">×</button>
                )}
              </div>
            ))}
            <button data-testid="edit-dish-add-step" type="button" onClick={addStep} className="text-blue-500 font-semibold mt-2">+ Agregar paso</button>
          </div>
          {error && <p className="text-red-500" data-testid="edit-dish-error">{error}</p>}
          <button data-testid="edit-dish-submit" type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition mt-4" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}
