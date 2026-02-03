import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// TypeScript interface for image items
export interface ImageItem {
  id: string;
  url: string;
  alt: string;
}

// localStorage key for persisting image order
const STORAGE_KEY = 'image-gallery-order';

// Initial set of 5 local images
// Place your images in the public/images folder with these names
const INITIAL_IMAGES: ImageItem[] = [
  {
    id: '1',
    url: '/images/photo1.jpg',
    alt: 'Photo 1',
  },
  {
    id: '2',
    url: '/images/photo2.jpg',
    alt: 'Photo 2',
  },
  {
    id: '3',
    url: '/images/photo3.jpg',
    alt: 'Photo 3',
  },
  {
    id: '4',
    url: '/images/photo4.jpg',
    alt: 'Photo 4',
  },
  {
    id: '5',
    url: '/images/photo5.jpg',
    alt: 'Photo 5',
  },
];

/**
 * Custom hook for managing image order with localStorage persistence
 * 
 * This hook handles:
 * - Loading saved image order from localStorage on mount
 * - Managing the current image order state
 * - Persisting changes to localStorage
 * - Handling drag-and-drop reordering events
 * 
 * @returns {Object} - images array and handleDragEnd function
 */
export function useImageOrder() {
  const [images, setImages] = useState<ImageItem[]>(INITIAL_IMAGES);

  // Load saved order from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(STORAGE_KEY);
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        // Validate that parsed data is an array
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading saved image order:', error);
      // If there's an error, just use the initial images
    }
  }, []);

  // Save to localStorage whenever the images array changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving image order:', error);
    }
  }, [images]);

  /**
   * Handle drag end event from dnd-kit
   * Reorders the images array based on the drag operation
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Only reorder if the item was dropped over a different position
    if (over && active.id !== over.id) {
      setImages((items) => {
        // Find the indices of the dragged item and the drop target
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Use arrayMove utility from dnd-kit to reorder the array
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  return {
    images,
    handleDragEnd,
  };
}
