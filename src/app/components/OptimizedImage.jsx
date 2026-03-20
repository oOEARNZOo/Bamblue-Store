"use client";
import { useState } from 'react';
import Image from 'next/image';

/**
 * 🖼️ OptimizedImage Component
 * - Lazy Loading อัตโนมัติ
 * - Blur Placeholder ขณะโหลด
 * - รองรับ External URLs (Supabase Storage)
 * - Fallback สำหรับรูปที่โหลดไม่ได้
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 75,
  objectFit = 'cover',
  placeholder = 'blur',
  fallbackSrc = '/Picture/placeholder.png',
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // ถ้าไม่มี src หรือ error ให้ใช้ fallback
  const imageSrc = error || !src ? fallbackSrc : src;

  // Blur placeholder data URL (สีเทาอ่อน)
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AzrS9Pu7q8ht4oJHkkYKqqpJJPwAVfbW1dTsLqW2ubSWKaJijo6EMrA9EEeqUoJYk9lTZBwYn/9k=';

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {fill ? (
        <Image
          src={imageSrc}
          alt={alt || 'Image'}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`
            object-${objectFit} 
            transition-opacity duration-500 
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          {...props}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt || 'Image'}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`
            object-${objectFit} 
            transition-opacity duration-500 
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * 🖼️ ProductImage Component
 * - สำหรับรูปสินค้าโดยเฉพาะ
 * - Aspect Ratio 3:4
 * - Hover Zoom Effect
 */
export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  showZoom = true,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AzrS9Pu7q8ht4oJHkkYKqqpJJPwAVfbW1dTsLqW2ubSWKaJijo6EMrA9EEeqUoJYk9lTZBwYn/9k=';

  const imageSrc = error || !src ? '/Picture/placeholder.png' : src;

  return (
    <div className={`relative aspect-[3/4] bg-gray-100 overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <Image
        src={imageSrc}
        alt={alt || 'Product Image'}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        quality={80}
        priority={priority}
        className={`
          object-cover object-center
          transition-all duration-500
          ${isLoading ? 'opacity-0 scale-100' : 'opacity-100'}
          ${showZoom ? 'group-hover:scale-105' : ''}
        `}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}

/**
 * 🖼️ BannerImage Component
 * - สำหรับ Hero Banner
 * - Full Width
 * - Priority Loading
 */
export function BannerImage({
  src,
  alt,
  className = '',
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);

  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECABEhMf/aAAwDAQACEQMRAD8AzrS9Pu7q8ht4oJHkkYKqqpJJPwAVfbW1dTsLqW2ubSWKaJijo6EMrA9EEeqUoJYk9lTZBwYn/9k=';

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt || 'Banner'}
        fill
        sizes="100vw"
        quality={85}
        priority={true}
        className={`
          object-cover object-top
          transition-opacity duration-700
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}
