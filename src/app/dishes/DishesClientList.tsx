"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Dish {
  id: number;
  name: string;
  description: string;
  quickPrep: boolean;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
}

export default function DishesClientList({ dishes }: { dishes: Dish[] }) {
  const [dishList, setDishList] = useState<Dish[]>(dishes);

  const handleDelete = async (id: number) => {
    await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    setDishList(dishList.filter(d => d.id !== id));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="dishes-grid">
      {dishList.map(dish => (
        <div key={dish.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl transition group border border-gray-100" data-testid="dish-card">
          <div className="relative mb-4" data-testid="dish-media">
            {dish.imageUrl ? (
              <Image src={dish.imageUrl} alt={dish.name} width={400} height={180} className="rounded-xl w-full h-44 object-cover group-hover:scale-105 transition" data-testid="dish-image" />
            ) : (
              <div className="bg-gray-200 rounded-xl w-full h-44 flex items-center justify-center text-gray-400" data-testid="dish-no-image">Sin imagen</div>
            )}
            <span className="absolute top-2 right-2 bg-green-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow tracking-wide uppercase" data-testid="dish-time-badge">{dish.quickPrep ? 'Rápido' : `${dish.prepTime + dish.cookTime} min`}</span>
          </div>
          <h2 className="font-extrabold text-xl mb-1 text-gray-800 truncate" title={dish.name} data-testid="dish-name">{dish.name}</h2>
          <p className="text-gray-600 mb-2 text-sm line-clamp-2" title={dish.description} data-testid="dish-description">{dish.description}</p>
          <div className="flex-1" />
          <div className="flex flex-col gap-2 mt-4" data-testid="dish-actions">
            <div className="flex gap-2" data-testid="dish-action-links">
              <Link href={`/dishes/${dish.id}/view`} className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold text-center hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-blue-300" title="Ver detalles" data-testid="dish-view-link">Ver</Link>
              <Link href={`/dishes/${dish.id}`} className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-semibold text-center hover:bg-yellow-200 transition focus:outline-none focus:ring-2 focus:ring-yellow-300" title="Editar platillo" data-testid="dish-edit-link">Editar</Link>
            </div>
            <button className="w-full bg-red-100 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-300" title="Eliminar platillo" onClick={() => handleDelete(dish.id)} data-testid="dish-delete-button">
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
