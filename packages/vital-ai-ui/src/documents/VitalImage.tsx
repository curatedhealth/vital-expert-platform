'use client';

/**
 * VitalImage - AI Generated Image Display
 * 
 * Displays AI-generated images from the AI SDK. Accepts an 
 * `Experimental_GeneratedImage` object from the AI SDK's `generateImage` 
 * function and automatically renders it as an image.
 * 
 * Features:
 * - Accepts `Experimental_GeneratedImage` objects directly from the AI SDK
 * - Automatically creates proper data URLs from base64-encoded image data
 * - Supports all standard HTML image attributes
 * - Responsive by default with `max-w-full h-auto` styling
 * - Customizable with additional CSS classes
 * - Includes proper TypeScript types for AI SDK compatibility
 * - Handles both base64 and uint8Array formats
 * 
 * @example
 * ```tsx
 * // With AI SDK generated image (spread pattern)
 * const { image } = await experimental_generateImage({
 *   model: openai.image('dall-e-3'),
 *   prompt: prompt,
 * });
 * <VitalImage {...image} alt="Generated image" />
 * 
 * // With explicit props
 * <VitalImage 
 *   base64={image.base64} 
 *   mediaType="image/png" 
 *   alt="Generated image" 
 * />
 * ```
 */

import { cn } from '../lib/utils';
import { forwardRef, type ComponentProps } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Compatible with AI SDK's Experimental_GeneratedImage type
 * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-image
 */
export type Experimental_GeneratedImage = {
  /** Base64 encoded image data */
  base64?: string;
  /** Raw image data as Uint8Array */
  uint8Array?: Uint8Array;
  /** Image media type (e.g., 'image/png', 'image/jpeg') */
  mediaType?: string;
};

export type VitalImageProps = Omit<ComponentProps<'img'>, 'src'> & Experimental_GeneratedImage;

// ============================================================================
// Component
// ============================================================================

/**
 * AI Generated Image display
 * 
 * Automatically creates proper data URLs from base64-encoded image data
 * returned by AI SDK's generateImage function.
 */
export const VitalImage = forwardRef<HTMLImageElement, VitalImageProps>(
  ({ base64, uint8Array, mediaType = 'image/png', alt = 'Generated image', className, ...props }, ref) => {
    // Convert Uint8Array to base64 if provided (for AI SDK compatibility)
    let imageData = base64;
    
    if (!imageData && uint8Array) {
      // Handle Uint8Array conversion safely
      try {
        const binaryString = Array.from(uint8Array)
          .map(byte => String.fromCharCode(byte))
          .join('');
        imageData = btoa(binaryString);
      } catch {
        imageData = '';
      }
    }

    if (!imageData) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-muted rounded-md',
            'h-48 w-full text-muted-foreground text-sm',
            className
          )}
        >
          No image data
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={`data:${mediaType};base64,${imageData}`}
        alt={alt}
        className={cn(
          'h-auto max-w-full overflow-hidden rounded-md',
          className
        )}
        {...props}
      />
    );
  }
);

VitalImage.displayName = 'VitalImage';

// ============================================================================
// Variant: Image with caption
// ============================================================================

export type VitalImageWithCaptionProps = VitalImageProps & {
  /** Caption text */
  caption?: string;
};

export const VitalImageWithCaption = ({
  caption,
  className,
  ...props
}: VitalImageWithCaptionProps) => (
  <figure className={cn('space-y-2', className)}>
    <VitalImage {...props} />
    {caption && (
      <figcaption className="text-center text-muted-foreground text-sm">
        {caption}
      </figcaption>
    )}
  </figure>
);

VitalImageWithCaption.displayName = 'VitalImageWithCaption';

// ============================================================================
// Variant: Image gallery
// ============================================================================

export type VitalImageGalleryProps = ComponentProps<'div'> & {
  /** Array of images */
  images: VitalImageProps[];
  /** Number of columns */
  columns?: 2 | 3 | 4;
};

export const VitalImageGallery = ({
  images,
  columns = 3,
  className,
  ...props
}: VitalImageGalleryProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={cn('grid gap-4', gridCols[columns], className)}
      {...props}
    >
      {images.map((image, index) => (
        <VitalImage key={index} {...image} />
      ))}
    </div>
  );
};

VitalImageGallery.displayName = 'VitalImageGallery';

// ============================================================================
// Aliases
// ============================================================================

export const Image = VitalImage;
export const ImageWithCaption = VitalImageWithCaption;
export const ImageGallery = VitalImageGallery;

export default VitalImage;
