import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Check, FolderOpen, Box } from 'lucide-react';

interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria_padre_id?: number;
  nivel: number;
  orden: number;
}

interface HierarchicalCategorySearchProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string, categoryName: string, fullPath: string) => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
}

type CategoryType = 'general' | 'subcategoria';

const HierarchicalCategorySearch: React.FC<HierarchicalCategorySearchProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  loading = false,
  error,
  placeholder = "Buscar categoría..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('general');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener la categoría seleccionada
  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);

  // Filtrar categorías según el tipo seleccionado
  const getFilteredCategories = () => {
    if (categoryType === 'general') {
      // Solo categorías generales (nivel 0)
      return categories
        .filter(cat => cat.nivel === 0)
        .sort((a, b) => a.orden - b.orden);
    } else {
      // Solo subcategorías (nivel 1)
      return categories
        .filter(cat => cat.nivel === 1)
        .sort((a, b) => a.orden - b.orden);
    }
  };

  // Filtrar por término de búsqueda
  const filteredCategories = React.useMemo(() => {
    const typeFiltered = getFilteredCategories();
    
    if (!searchTerm) {
      return typeFiltered;
    }

    const searchLower = searchTerm.toLowerCase();
    return typeFiltered.filter(category =>
      category.nombre.toLowerCase().includes(searchLower) ||
      category.descripcion?.toLowerCase().includes(searchLower)
    );
  }, [categories, searchTerm, categoryType]);

  // Obtener ruta completa de una categoría
  const getFullPath = (category: Category): string => {
    if (category.nivel === 0) {
      return category.nombre;
    }
    
    const parent = categories.find(cat => cat.id === category.categoria_padre_id);
    return parent ? `${parent.nombre} > ${category.nombre}` : category.nombre;
  };

  // Manejar selección de categoría
  const handleCategorySelect = (category: Category) => {
    const fullPath = getFullPath(category);
    onCategorySelect(category.id.toString(), category.nombre, fullPath);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Manejar cambio de tipo de categoría
  const handleCategoryTypeChange = (type: CategoryType) => {
    setCategoryType(type);
    setSearchTerm('');
    setHighlightedIndex(-1);
    // Si hay una categoría seleccionada que no coincide con el nuevo tipo, limpiar selección
    if (selectedCategory) {
      if (type === 'general' && selectedCategory.nivel !== 0) {
        onCategorySelect('', '', '');
      } else if (type === 'subcategoria' && selectedCategory.nivel !== 1) {
        onCategorySelect('', '', '');
      }
    }
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

  // Resetear índice destacado cuando cambia la búsqueda o el tipo
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm, categoryType]);

  // Determinar el tipo de categoría basado en la selección actual
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.nivel === 0 && categoryType !== 'general') {
        setCategoryType('general');
      } else if (selectedCategory.nivel === 1 && categoryType !== 'subcategoria') {
        setCategoryType('subcategoria');
      }
    }
  }, [selectedCategory]);

  return (
    <div className="relative">
      {/* Título */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
          <Box className="h-3 w-3 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Categoría</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Selecciona la categoría más apropiada</p>

      {/* Input de búsqueda */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selectedCategory ? getFullPath(selectedCategory) : '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategory ? getFullPath(selectedCategory) : placeholder}
          disabled={loading}
          className={`w-full h-10 pl-10 pr-10 rounded-lg border transition-colors ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Selector de tipo de categoría */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar tipo de categoría:
        </label>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => handleCategoryTypeChange('general')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              categoryType === 'general'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <Box className={`h-4 w-4 ${categoryType === 'general' ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className="font-medium">Categoría General</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryTypeChange('subcategoria')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              categoryType === 'subcategoria'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <ChevronDown className={`h-4 w-4 ${categoryType === 'subcategoria' ? 'text-white' : 'text-gray-500'}`} />
            <span className="font-medium">Subcategoría</span>
          </button>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-800">
          Categorías principales o subcategorías específicas (ej: "Electrónicos &gt; Computadoras")
        </p>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Cargando categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm 
                ? `No se encontraron ${categoryType === 'general' ? 'categorías generales' : 'subcategorías'} para "${searchTerm}"`
                : `No hay ${categoryType === 'general' ? 'categorías generales' : 'subcategorías'} disponibles`}
            </div>
          ) : (
            <div className="py-1">
              {filteredCategories.map((category, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedCategoryId === category.id.toString();
                
                return (
                  <div
                    key={category.id}
                    className={`${isHighlighted ? 'bg-blue-50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between ${
                        isSelected ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                        <span className={isSelected ? 'text-blue-900 font-medium' : 'text-gray-900'}>
                          {category.nombre}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                );
              })}
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

export default HierarchicalCategorySearch;
