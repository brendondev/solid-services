import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
  showLoader?: boolean;
}

/**
 * Wrapper otimizado do next/image com loading state e fallback
 */
export function OptimizedImage({
  fallbackSrc = '/images/placeholder.png',
  showLoader = true,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error && fallbackSrc) {
    return (
      <Image
        {...props}
        src={fallbackSrc}
        alt={alt || 'Imagem não disponível'}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse rounded">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
        </div>
      )}
      <Image
        {...props}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${props.className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
}

/**
 * Avatar otimizado com fallback de iniciais
 */
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function OptimizedAvatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-primary text-primary-foreground font-semibold rounded-full ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
