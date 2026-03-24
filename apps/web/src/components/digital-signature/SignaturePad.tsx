'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface SignaturePadProps {
  onSign?: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ onSign }, ref) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvas.current?.clear();
    },
    isEmpty: () => {
      return sigCanvas.current?.isEmpty() ?? true;
    },
    toDataURL: () => {
      return sigCanvas.current?.toDataURL() ?? '';
    },
  }));

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div className="space-y-3">
      <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 sm:h-64 touch-none',
            style: { touchAction: 'none' },
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={1}
          maxWidth={3}
          onEnd={onSign}
        />

        {/* Linha guia */}
        <div className="absolute bottom-16 left-0 right-0 border-b-2 border-dashed border-gray-300 pointer-events-none"></div>

        {/* Texto de instrução */}
        <div className="absolute top-2 left-2 text-xs text-gray-400 pointer-events-none select-none">
          Assine aqui ✍️
        </div>
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Limpar</span>
      </button>

      <p className="text-xs text-gray-500">
        💡 Use o dedo no celular ou o mouse no computador para desenhar sua assinatura
      </p>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
