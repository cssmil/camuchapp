"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoriasService } from '@/services/categorias.service';
import { Categoria } from '@/types';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface CategoryFormProps {
  onSuccess: () => void;
  editingCategory: Categoria | null;
}

export function CategoryForm({ onSuccess, editingCategory }: CategoryFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setNombre(editingCategory.nombre);
      setDescripcion(editingCategory.descripcion || '');
      setEmoji(editingCategory.emoji || null);
    } else {
      setNombre('');
      setDescripcion('');
      setEmoji(null);
    }
  }, [editingCategory]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = { nombre, descripcion, emoji };

    try {
      if (editingCategory) {
        await categoriasService.actualizar(editingCategory.id, data);
      } else {
        await categoriasService.crear(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error guardando la categoría', error);
      setError('No se pudo guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      <div>
        <Label>Emoji</Label>
        <div className="flex items-center gap-4">
          <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            {emoji ? emoji : 'Seleccionar Emoji'}
          </Button>
          {showEmojiPicker && (
            <div className="absolute z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
      </Button>
    </form>
  );
}
