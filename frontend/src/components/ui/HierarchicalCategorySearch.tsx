import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Check, FolderOpen } from 'lucide-react';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener la categoría seleccionada
  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);

  // Organizar categorías en estructura jerárquica
  const organizeCategories = (categories: Category[]) => {
    if (!categories || categories.length === 0) {
      return [];
    }

    const parents = categories.filter(cat => cat.nivel === 0).sort((a, b) => a.orden - b.orden);
    const children = categories.filter(cat => cat.nivel === 1);
    
    const organized = parents.map(parent => {
      const subcategorias = children
        .filter(child => child.categoria_padre_id === parent.id)
        .sort((a, b) => a.orden - b.orden);
      
      return {
        ...parent,
        subcategorias
      };
    });

    // Filtrar duplicados: agrupar por nombre y mantener solo las que tienen subcategorías
    // Si ninguna tiene subcategorías, mantener solo una (la de menor orden)
    const categoriesByName = new Map<string, typeof organized>();
    
    // Agrupar todas las categorías por nombre
    organized.forEach(cat => {
      if (!categoriesByName.has(cat.nombre)) {
        categoriesByName.set(cat.nombre, []);
      }
      categoriesByName.get(cat.nombre)!.push(cat);
    });
    
    // Procesar cada grupo de duplicados
    const finalFiltered: typeof organized = [];
    
    categoriesByName.forEach((duplicates) => {
      if (duplicates.length === 1) {
        // No hay duplicados - mantener todas las categorías (incluso sin subcategorías)
        finalFiltered.push(duplicates[0]);
      } else {
        // Hay duplicados - filtrar correctamente
        const withSubs = duplicates.filter(c => c.subcategorias && c.subcategorias.length > 0);
        const withoutSubs = duplicates.filter(c => !c.subcategorias || c.subcategorias.length === 0);
        
        if (withSubs.length > 0) {
          // Hay categorías con subcategorías - mantener SOLO estas
          finalFiltered.push(...withSubs);
        } else {
          // Ninguna tiene subcategorías - mantener solo una (la de menor orden)
          const sorted = duplicates.sort((a, b) => a.orden - b.orden);
          finalFiltered.push(sorted[0]);
        }
      }
    });
    
    // Ordenar por orden final
    finalFiltered.sort((a, b) => a.orden - b.orden);
    
    return finalFiltered;
  };

  // Obtener ruta completa de una categoría
  const getFullPath = (category: Category): string => {
    if (category.nivel === 0) {
      return category.nombre;
    }
    
    const parent = categories.find(cat => cat.id === category.categoria_padre_id);
    return parent ? `${parent.nombre} > ${category.nombre}` : category.nombre;
  };

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) {
      return organizeCategories(categories);
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingCategories = categories.filter(category =>
      category.nombre.toLowerCase().includes(searchLower) ||
      category.descripcion?.toLowerCase().includes(searchLower)
    );

    // Organizar resultados de búsqueda
    const result = [];
    const addedParents = new Set<number>();

    for (const category of matchingCategories) {
      if (category.nivel === 1) {
        // Es una subcategoría, agregar su padre si no está ya
        const parent = categories.find(cat => cat.id === category.categoria_padre_id);
        if (parent && !addedParents.has(parent.id)) {
          result.push({
            ...parent,
            subcategorias: matchingCategories.filter(cat => 
              cat.categoria_padre_id === parent.id
            ).sort((a, b) => a.orden - b.orden)
          });
          addedParents.add(parent.id);
        }
      } else if (category.nivel === 0 && !addedParents.has(category.id)) {
        // Es una categoría principal
        result.push({
          ...category,
          subcategorias: matchingCategories.filter(cat => 
            cat.categoria_padre_id === category.id
          ).sort((a, b) => a.orden - b.orden)
        });
        addedParents.add(category.id);
      }
    }

    return result;
  }, [categories, searchTerm]);

  // Crear lista plana para navegación con teclado
  const flatCategories = React.useMemo(() => {
    const flat: Array<{ category: Category; isParent: boolean; hasChildren: boolean; indent: number }> = [];
    
    filteredCategories.forEach(parent => {
      const hasSubcategories = parent.subcategorias && parent.subcategorias.length > 0;
      const isExpanded = expandedCategories.has(parent.id);
      
      // Las subcategorías SOLO se muestran si la categoría padre está expandida
      // O si hay búsqueda activa (para mostrar resultados de búsqueda)
      const shouldShowSubcategories = isExpanded || (searchTerm && searchTerm.trim() !== '');
      
      flat.push({ category: parent, isParent: true, hasChildren: hasSubcategories, indent: 0 });
      
      // Mostrar subcategorías SOLO si la categoría padre está expandida y tiene subcategorías
      if (shouldShowSubcategories && hasSubcategories) {
        parent.subcategorias.forEach(child => {
          flat.push({ category: child, isParent: false, hasChildren: false, indent: 1 });
        });
      }
    });
    
    return flat;
  }, [filteredCategories, expandedCategories, searchTerm]);

  // Manejar selección de categoría
  const handleCategorySelect = (category: Category) => {
    const fullPath = getFullPath(category);
    onCategorySelect(category.id.toString(), category.nombre, fullPath);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Manejar expansión/colapso de categorías
  const toggleExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
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
          prev < flatCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : flatCategories.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatCategories[highlightedIndex]) {
          const { category } = flatCategories[highlightedIndex];
          handleCategorySelect(category);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatCategories[highlightedIndex]?.isParent && flatCategories[highlightedIndex]?.hasChildren) {
          const category = flatCategories[highlightedIndex].category;
          setExpandedCategories(prev => new Set(prev).add(category.id));
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (highlightedIndex >= 0 && flatCategories[highlightedIndex]?.isParent) {
          const category = flatCategories[highlightedIndex].category;
          setExpandedCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(category.id);
            return newSet;
          });
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

  // Auto-expandir todas las categorías padre con subcategorías cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && !searchTerm && filteredCategories.length > 0) {
      // Expandir automáticamente TODAS las categorías padre que tienen subcategorías
      const parentIdsWithSubcategories = filteredCategories
        .filter(cat => {
          const hasSubs = cat.subcategorias && cat.subcategorias.length > 0;
          return hasSubs;
        })
        .map(cat => cat.id);
      
      // Si hay una categoría seleccionada, también expandir su categoría padre
      if (selectedCategory && selectedCategory.nivel === 1 && selectedCategory.categoria_padre_id) {
        const parentId = selectedCategory.categoria_padre_id;
        if (!parentIdsWithSubcategories.includes(parentId)) {
          parentIdsWithSubcategories.push(parentId);
        }
      }
      
      if (parentIdsWithSubcategories.length > 0) {
        setExpandedCategories(new Set(parentIdsWithSubcategories));
      }
    }
  }, [isOpen, searchTerm, filteredCategories, selectedCategory]);

  // Auto-expandir categorías cuando hay búsqueda
  useEffect(() => {
    if (searchTerm) {
      const parentIds = filteredCategories.map(cat => cat.id);
      setExpandedCategories(new Set(parentIds));
    }
  }, [searchTerm, filteredCategories]);

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
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Cargando categorías...
            </div>
          ) : flatCategories.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm ? `No se encontraron categorías para "${searchTerm}"` : 'No hay categorías disponibles'}
            </div>
          ) : (
            <div className="py-1">
              {flatCategories.map((item, index) => {
                const { category, isParent, hasChildren, indent } = item;
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedCategoryId === category.id.toString();
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div
                    key={`${category.id}-${index}`}
                    className={`flex items-center ${
                      isParent ? 'font-medium' : ''
                    } ${isHighlighted ? 'bg-blue-50' : ''}`}
                    style={{ paddingLeft: `${indent * 16 + 16}px` }}
                  >
                    {/* Botón de expandir/colapsar - SOLO para expandir, NO para seleccionar */}
                    {isParent && hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleExpansion(category.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0 mr-1"
                        aria-label={isExpanded ? 'Colapsar categoría' : 'Expandir categoría'}
                        title={isExpanded ? 'Colapsar categoría' : 'Expandir categoría'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    {isParent && !hasChildren && (
                      <div className="p-1.5 text-gray-400 flex-shrink-0 mr-1">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                    )}
                    {/* Botón de selección - ÁREA PRINCIPAL CLICKEABLE */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCategorySelect(category);
                      }}
                      className={`flex-1 px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between rounded transition-colors ${
                        isSelected ? 'bg-blue-100 font-semibold' : ''
                      }`}
                      title={`Seleccionar ${category.nombre}`}
                    >
                      <span className={isSelected ? 'text-blue-900' : 'text-gray-900'}>
                        {category.nombre}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
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
