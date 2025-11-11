import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../../lib/utils';
const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (_jsx("select", { className: cn('flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50', className), ref: ref, ...props, children: children }));
});
Select.displayName = 'Select';
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    return (_jsx("button", { ref: ref, className: cn('flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50', className), ...props, children: children }));
});
SelectTrigger.displayName = 'SelectTrigger';
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg', className), ...props, children: children }));
});
SelectContent.displayName = 'SelectContent';
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100', className), "data-value": value, ...props, children: children }));
});
SelectItem.displayName = 'SelectItem';
const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
    return (_jsx("span", { ref: ref, className: cn('block truncate', className), ...props, children: placeholder }));
});
SelectValue.displayName = 'SelectValue';
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
