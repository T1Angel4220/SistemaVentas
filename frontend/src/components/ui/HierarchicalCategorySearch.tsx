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
  expandWidth?: boolean; // Si es true, expande el dropdown un 20% más en pantallas pequeñas y superiores
}

const HierarchicalCategorySearch: React.FC<HierarchicalCategorySearchProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  loading = false,
  error,
  placeholder = "Buscar categoría...",
  expandWidth = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [categoryMode, setCategoryMode] = useState<'general' | 'subcategoria'>('subcategoria'); // Modo por defecto: subcategoría
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validar que categories sea un array válido
  const validCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    return categories.filter(cat => cat && cat.id && cat.nombre);
  }, [categories]);

  // Obtener la categoría seleccionada
  const selectedCategory = validCategories.find(cat => cat.id.toString() === selectedCategoryId);
  
  // Detectar automáticamente el modo basado en la categoría seleccionada
  useEffect(() => {
    if (selectedCategory) {
      // Si la categoría seleccionada es nivel 0, es general; si es nivel 1, es subcategoría
      setCategoryMode(selectedCategory.nivel === 0 ? 'general' : 'subcategoria');
    }
  }, [selectedCategory]);

  // Organizar categorías en estructura jerárquica
  const organizeCategories = (categories: Category[]) => {
    if (!categories || categories.length === 0) {
      return [];
    }

    // Filtrar categorías inválidas (sin nombre o sin ID)
    const validCategories = categories.filter(cat => cat && cat.id && cat.nombre);
    
    // Separar categorías por nivel
    // Categorías padre: nivel 0 o null/undefined (sin nivel definido)
    const parents = validCategories.filter(cat => {
      const nivel = cat.nivel;
      return nivel === 0 || nivel === null || nivel === undefined || (!cat.categoria_padre_id);
    })
      .sort((a, b) => {
        // Ordenar primero por orden, luego por nombre
        const orderA = a.orden || 0;
        const orderB = b.orden || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    
    // Categorías hijas: nivel 1 o con categoria_padre_id definido
    const children = validCategories.filter(cat => {
      const nivel = cat.nivel;
      return (nivel === 1 || (cat.categoria_padre_id && nivel !== 0));
    });
    
    // Crear un Map para agrupar subcategorías por categoría padre
    const childrenByParent = new Map<number, Category[]>();
    children.forEach(child => {
      if (child.categoria_padre_id) {
        if (!childrenByParent.has(child.categoria_padre_id)) {
          childrenByParent.set(child.categoria_padre_id, []);
        }
        childrenByParent.get(child.categoria_padre_id)!.push(child);
      }
    });
    
    // Ordenar las subcategorías de cada padre
    childrenByParent.forEach((subcats) => {
      subcats.sort((a, b) => {
        const orderA = a.orden || 0;
        const orderB = b.orden || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    });
    
    // Organizar todas las categorías padre con sus subcategorías
    // IMPORTANTE: Mostrar TODAS las categorías padre sin filtrar duplicados
    const organized = parents.map(parent => {
      const subcategorias = childrenByParent.get(parent.id) || [];
      return {
        ...parent,
        subcategorias
      };
    });
    
    // Devolver todas las categorías organizadas sin filtrar duplicados
    return organized;
  };

  // Obtener ruta completa de una categoría
  const getFullPath = (category: Category): string => {
    if (!category || !category.nombre) {
      return '';
    }
    
    const categoryName = category.nombre || '';
    
    if (category.nivel === 0) {
      return categoryName;
    }
    
    const parent = validCategories.find(cat => cat.id === category.categoria_padre_id);
    const parentName = parent?.nombre || '';
    return parentName ? `${parentName} > ${categoryName}` : categoryName;
  };

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) {
      return organizeCategories(validCategories);
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingCategories = validCategories.filter(category => {
      // Validar que category y category.nombre existan antes de usar métodos de string
      if (!category || !category.nombre) {
        return false;
      }
      return category.nombre.toLowerCase().includes(searchLower) ||
        (category.descripcion && category.descripcion.toLowerCase().includes(searchLower));
    });

    // Organizar resultados de búsqueda
    const result = [];
    const addedParents = new Set<number>();

    for (const category of matchingCategories) {
      const nivel = category.nivel;
      const hasParentId = category.categoria_padre_id;
      
      // Si es una subcategoría (nivel 1 o tiene categoria_padre_id)
      if (nivel === 1 || (hasParentId && nivel !== 0)) {
        // Es una subcategoría, agregar su padre si no está ya
        const parent = validCategories.find(cat => cat.id === category.categoria_padre_id);
        if (parent && !addedParents.has(parent.id)) {
          result.push({
            ...parent,
            subcategorias: matchingCategories.filter(cat => 
              cat.categoria_padre_id === parent.id
            ).sort((a, b) => {
              const orderA = a.orden || 0;
              const orderB = b.orden || 0;
              if (orderA !== orderB) {
                return orderA - orderB;
              }
              return (a.nombre || '').localeCompare(b.nombre || '');
            })
          });
          addedParents.add(parent.id);
        }
      } else if ((nivel === 0 || nivel === null || nivel === undefined || !hasParentId) && !addedParents.has(category.id)) {
        // Es una categoría principal
        result.push({
          ...category,
          subcategorias: matchingCategories.filter(cat => 
            cat.categoria_padre_id === category.id
          ).sort((a, b) => {
            const orderA = a.orden || 0;
            const orderB = b.orden || 0;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return (a.nombre || '').localeCompare(b.nombre || '');
          })
        });
        addedParents.add(category.id);
      }
    }

    return result;
  }, [validCategories, searchTerm]);

  // Crear lista plana para navegación con teclado
  const flatCategories = React.useMemo(() => {
    const flat: Array<{ category: Category; isParent: boolean; hasChildren: boolean; indent: number }> = [];
    
    // Si el modo es "general", solo mostrar categorías padre (nivel 0)
    if (categoryMode === 'general') {
      filteredCategories.forEach(parent => {
        flat.push({ category: parent, isParent: true, hasChildren: false, indent: 0 });
      });
      return flat;
    }
    
    // Modo "subcategoría": comportamiento normal con jerarquía
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
  }, [filteredCategories, expandedCategories, searchTerm, categoryMode]);

  // Manejar selección de categoría
  const handleCategorySelect = (category: Category) => {
    if (!category || !category.nombre) {
      return;
    }
    const fullPath = getFullPath(category);
    onCategorySelect(category.id.toString(), category.nombre || '', fullPath);
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

  // Auto-expandir todas las categorías padre con subcategorías cuando se abre el dropdown (solo en modo subcategoría)
  useEffect(() => {
    if (isOpen && !searchTerm && filteredCategories.length > 0 && categoryMode === 'subcategoria') {
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
    } else if (categoryMode === 'general') {
      // En modo general, no expandir nada
      setExpandedCategories(new Set());
    }
  }, [isOpen, searchTerm, filteredCategories, selectedCategory, categoryMode]);

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
          className={`w-full h-12 pl-10 pr-10 rounded-xl border-2 transition-all duration-200 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md'
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
          className={`absolute z-[9999] w-full ${expandWidth ? 'sm:w-[120%]' : ''} mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-[350px] flex flex-col overflow-hidden`}
          style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          {/* Selector de modo: Categoría General vs Subcategoría - SIEMPRE VISIBLE - STICKY */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-300 px-3 py-2 shadow-md z-10 flex-shrink-0">
            <div className="w-full">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Tipo de categoría:</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCategoryMode('general');
                    setSearchTerm('');
                    setExpandedCategories(new Set());
                    // Si la categoría seleccionada es una subcategoría (nivel 1), limpiar la selección
                    if (selectedCategory && selectedCategory.nivel === 1) {
                      onCategorySelect('', '', '');
                    }
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                    categoryMode === 'general'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                  title="Seleccionar solo categorías principales (sin subcategorías)"
                >
                  📦 General
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCategoryMode('subcategoria');
                    setSearchTerm('');
                    // No necesitamos limpiar la selección al cambiar a subcategoría
                    // porque las categorías generales también son válidas en este modo
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                    categoryMode === 'subcategoria'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                  title="Seleccionar subcategorías específicas (con jerarquía)"
                >
                  🔽 Subcategoría
                </button>
              </div>
              {categoryMode === 'general' && (
                <p className="text-xs text-gray-600 mt-1.5 font-medium leading-tight">
                  ℹ Solo categorías principales
                </p>
              )}
              {categoryMode === 'subcategoria' && (
                <p className="text-xs text-gray-600 mt-1.5 font-medium leading-tight">
                  ℹ Categorías principales o subcategorías específicas
                </p>
              )}
            </div>
          </div>
          
          {/* Lista de categorías con scroll */}
          <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(75vh - 140px)' }}>
            {loading ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                Cargando categorías...
              </div>
            ) : flatCategories.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                {searchTerm ? `No se encontraron categorías para "${searchTerm}"` : 'No hay categorías disponibles'}
              </div>
            ) : (
              <div className="py-0.5">
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
                      style={{ paddingLeft: `${indent * 16 + 12}px` }}
                    >
                      {/* Botón de expandir/colapsar - SOLO para expandir, NO para seleccionar - Solo en modo subcategoría */}
                      {categoryMode === 'subcategoria' && isParent && hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleExpansion(category.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0 mr-0.5 z-10 relative"
                          aria-label={isExpanded ? 'Colapsar categoría' : 'Expandir categoría'}
                          title={isExpanded ? 'Colapsar categoría' : 'Expandir categoría'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                      {categoryMode === 'subcategoria' && isParent && !hasChildren && (
                        <div className="p-1 text-gray-400 flex-shrink-0 mr-0.5">
                          <FolderOpen className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {categoryMode === 'general' && isParent && (
                        <div className="p-1 text-blue-500 flex-shrink-0 mr-0.5">
                          <FolderOpen className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {/* Botón de selección - ÁREA PRINCIPAL CLICKEABLE - Funciona para TODAS las categorías (padre e hijas) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleCategorySelect(category);
                        }}
                        onMouseDown={(e) => {
                          // Permitir que el evento se propague para asegurar que se seleccione
                          // pero prevenir el comportamiento por defecto
                          e.preventDefault();
                        }}
                        className={`flex-1 px-3 py-1.5 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between rounded transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-100 font-semibold' : ''
                        }`}
                        title={`Seleccionar ${category.nombre || 'categoría'}`}
                      >
                        <span className={isSelected ? 'text-blue-900' : 'text-gray-900'}>
                          {category.nombre || 'Sin nombre'}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
