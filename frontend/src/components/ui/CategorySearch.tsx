import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Category {
  id: number;
  nombre: string;
}

interface CategorySearchProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
}

const CategorySearch: React.FC<CategorySearchProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  loading = false,
  error,
  placeholder = "Buscar categoría..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener la categoría seleccionada
  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de categoría
  const handleCategorySelect = (category: Category) => {
    onCategorySelect(category.id.toString(), category.nombre);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCategories[highlightedIndex]) {
          handleCategorySelect(filteredCategories[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resetear índice destacado cuando cambia la búsqueda
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selectedCategory?.nombre || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategory ? selectedCategory.nombre : placeholder}
          disabled={loading}
          className={`w-full h-10 pl-10 pr-10 rounded-md border transition-colors ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Cargando categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm ? `No se encontraron categorías para "${searchTerm}"` : 'No hay categorías disponibles'}
            </div>
          ) : (
            <div className="py-1">
              {filteredCategories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  } ${selectedCategoryId === category.id.toString() ? 'bg-blue-100' : ''}`}
                >
                  <span className={selectedCategoryId === category.id.toString() ? 'font-medium text-blue-900' : 'text-gray-900'}>
                    {category.nombre}
                  </span>
                  {selectedCategoryId === category.id.toString() && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default CategorySearch;
