/**
 * Lazy loading de componentes pesados
 * Melhora o First Load JS e code splitting
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Modals (carregam apenas quando abertos)
export const PlanChangeModal = dynamic(
  () => import('@/components/subscriptions/plan-change-modal').then(mod => ({ default: mod.PlanChangeModal })),
  {
    loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>,
    ssr: false,
  }
);

export const PlanComparisonModal = dynamic(
  () => import('@/components/subscriptions/plan-comparison-modal').then(mod => ({ default: mod.PlanComparisonModal })),
  {
    loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>,
    ssr: false,
  }
);

// Calendar (componente pesado - 80kb)
export const DnDCalendar = dynamic(
  () => import('react-big-calendar').then(mod => {
    const { Calendar } = mod;
    const withDragAndDrop = require('react-big-calendar/lib/addons/dragAndDrop').default;
    return { default: withDragAndDrop(Calendar) };
  }),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Componentes para lazy load futuro:
 *
 * // Charts
 * export const Chart = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false });
 *
 * // Rich Text Editor
 * export const RichTextEditor = dynamic(() => import('@/components/editor/rich-text-editor'), { ssr: false });
 *
 * // PDF Viewer
 * export const PDFViewer = dynamic(() => import('@/components/pdf/pdf-viewer'), { ssr: false });
 */
