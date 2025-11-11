import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { GlobalSuspendedAlert } from './GlobalSuspendedAlert';
import { suspendedAccountAlertManager } from '../../utils/suspendedAccountAlert';
/**
 * Contenedor global para las alertas de cuenta suspendida
 * Este componente se monta una vez en App.tsx y escucha los eventos globales
 */
export const GlobalSuspendedAlertContainer = () => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        // Suscribirse a los eventos del manager
        const unsubscribe = suspendedAccountAlertManager.subscribe((open) => {
            setIsOpen(open);
        });
        // Cleanup al desmontar
        return unsubscribe;
    }, []);
    const handleClose = () => {
        suspendedAccountAlertManager.hide();
    };
    return _jsx(GlobalSuspendedAlert, { isOpen: isOpen, onClose: handleClose });
};
