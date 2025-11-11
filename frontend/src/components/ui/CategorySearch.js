import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
const CategorySearch = ({ categories, selectedCategoryId, onCategorySelect, loading = false, error, placeholder = "Buscar categoría..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    // Obtener la categoría seleccionada
    const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);
    // Filtrar categorías basado en el término de búsqueda
    const filteredCategories = categories.filter(category => category.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    // Manejar selección de categoría
    const handleCategorySelect = (category) => {
        onCategorySelect(category.id.toString(), category.nombre);
        setSearchTerm('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };
    // Manejar teclado
    const handleKeyDown = (e) => {
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
                setHighlightedIndex(prev => prev < filteredCategories.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredCategories.length - 1);
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
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)) {
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
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-4 w-4 text-gray-400" }) }), _jsx("input", { ref: inputRef, type: "text", value: isOpen ? searchTerm : (selectedCategory?.nombre || ''), onChange: (e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }, onFocus: () => {
                            setIsOpen(true);
                            setSearchTerm('');
                        }, onKeyDown: handleKeyDown, placeholder: selectedCategory ? selectedCategory.nombre : placeholder, disabled: loading, className: `w-full h-10 pl-10 pr-10 rounded-md border transition-colors ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}` }), _jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: _jsx(ChevronDown, { className: `h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}` }) })] }), isOpen && (_jsx("div", { ref: dropdownRef, className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto", children: loading ? (_jsx("div", { className: "px-4 py-3 text-sm text-gray-500 text-center", children: "Cargando categor\u00EDas..." })) : filteredCategories.length === 0 ? (_jsx("div", { className: "px-4 py-3 text-sm text-gray-500 text-center", children: searchTerm ? `No se encontraron categorías para "${searchTerm}"` : 'No hay categorías disponibles' })) : (_jsx("div", { className: "py-1", children: filteredCategories.map((category, index) => (_jsxs("button", { type: "button", onClick: () => handleCategorySelect(category), className: `w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between ${index === highlightedIndex ? 'bg-blue-50' : ''} ${selectedCategoryId === category.id.toString() ? 'bg-blue-100' : ''}`, children: [_jsx("span", { className: selectedCategoryId === category.id.toString() ? 'font-medium text-blue-900' : 'text-gray-900', children: category.nombre }), selectedCategoryId === category.id.toString() && (_jsx(Check, { className: "h-4 w-4 text-blue-600" }))] }, category.id))) })) })), error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: error }))] }));
};
export default CategorySearch;
