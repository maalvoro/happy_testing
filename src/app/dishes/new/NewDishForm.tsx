"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDishForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    quickPrep: false,
    prepTime: 0,
    cookTime: 0,
    imageUrl: '',
    calories: '',
    steps: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handles input changes and ensures numeric fields are parsed as numbers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (name === 'prepTime' || name === 'cookTime' || name === 'calories')
          ? value === '' ? '' : Number(value)
          : value,
    }));
  };

  const handleStepChange = (idx: number, value: string) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === idx ? value : step)),
    }));
  };

  const addStep = () => setForm(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  const removeStep = (idx: number) => setForm(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/dishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        calories: form.calories ? Number(form.calories) : null,
        steps: form.steps.filter(s => s.trim() !== ''),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push('/dishes');
    } else {
      setError(data.error || 'Error al crear el platillo');
    }
  };

  return (
    <form
      className="bg-white rounded-2xl shadow-2xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border border-gray-100"
      onSubmit={handleSubmit}
      autoComplete="on"
      data-testid="new-dish-form"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-green-600 mb-2" data-testid="new-dish-info-title">Información básica</h2>
        <div>
          <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-name-label">Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
            required
            autoFocus
            placeholder="Ej: Ensalada de quinoa"
            data-testid="new-dish-name-input"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-description-label">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
            required
            placeholder="Describe el platillo, ingredientes principales, etc."
            data-testid="new-dish-description-input"
          />
        </div>
        <div className="flex items-center gap-2" data-testid="new-dish-quickprep-row">
          <input
            type="checkbox"
            name="quickPrep"
            checked={form.quickPrep}
            onChange={handleChange}
            id="quickPrep"
            className="accent-green-500 w-5 h-5"
            data-testid="new-dish-quickprep-checkbox"
          />
          <label htmlFor="quickPrep" className="font-semibold text-gray-700" data-testid="new-dish-quickprep-label">Preparación rápida</label>
          <span className="text-xs text-gray-400 ml-2" data-testid="new-dish-quickprep-hint">Menos de 20 min</span>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-green-600 mb-2" data-testid="new-dish-details-title">Detalles</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-preptime-label">Min. preparación</label>
            <input
              type="number"
              name="prepTime"
              value={form.prepTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
              required
              min="0"
              placeholder="Ej: 10"
              data-testid="new-dish-preptime-input"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-cooktime-label">Min. cocción</label>
            <input
              type="number"
              name="cookTime"
              value={form.cookTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
              required
              min="0"
              placeholder="Ej: 15"
              data-testid="new-dish-cooktime-input"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-calories-label">Calorías totales</label>
          <input
            type="number"
            name="calories"
            value={form.calories}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
            min="0"
            placeholder="Ej: 350"
            data-testid="new-dish-calories-input"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700" data-testid="new-dish-image-url-label">URL de imagen</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-green-200 focus:outline-none"
            placeholder="https://..."
            data-testid="new-dish-image-url-input"
          />
        </div>
      </div>
      <div className="md:col-span-2 mt-4" data-testid="new-dish-steps-section">
        <h2 className="text-xl font-bold text-green-600 mb-2" data-testid="new-dish-steps-title">Pasos de preparación</h2>
        <p className="text-gray-500 mb-2 text-sm" data-testid="new-dish-steps-hint">Agrega los pasos uno a uno para guiar la preparación del platillo.</p>
        {form.steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 mb-2" data-testid="new-dish-step-row">
            <input
              type="text"
              value={step}
              onChange={e => handleStepChange(idx, e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-green-200 focus:outline-none"
              placeholder={`Paso ${idx + 1}`}
              required={idx === 0}
              data-testid="new-dish-step-input"
            />
            {form.steps.length > 1 && (
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="text-red-500 font-bold text-xl px-2"
                data-testid="new-dish-step-remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="text-blue-500 font-semibold mt-2"
          data-testid="new-dish-add-step-button"
        >
          + Agregar paso
        </button>
      </div>
      <div className="md:col-span-2 mt-4" data-testid="new-dish-submit-section">
        {error && <p className="text-red-500 mb-2" data-testid="new-dish-error">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow focus:outline-none focus:ring-2 focus:ring-green-300"
          disabled={loading}
          data-testid="new-dish-submit-button"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
