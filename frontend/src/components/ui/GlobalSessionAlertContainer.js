import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { GlobalSessionAlert } from './GlobalSessionAlert';
import { sessionAlertManager } from '../../utils/sessionAlert';
/**
 * Contenedor global para las alertas de sesión
 * Este componente se monta una vez en App.tsx y escucha los eventos globales
 */
export const GlobalSessionAlertContainer = () => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        // Suscribirse a los eventos del manager
        const unsubscribe = sessionAlertManager.subscribe((open) => {
            setIsOpen(open);
        });
        // Cleanup al desmontar
        return unsubscribe;
    }, []);
    const handleClose = () => {
        sessionAlertManager.hide();
    };
    return _jsx(GlobalSessionAlert, { isOpen: isOpen, onClose: handleClose });
};
