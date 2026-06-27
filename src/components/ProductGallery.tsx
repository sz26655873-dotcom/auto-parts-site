/**
 * ProductGallery — image gallery for the product detail page.
 *
 * Shows a large main image with a row of thumbnail images below.
 * Clicking a thumbnail swaps the main image. When only a single image
 * is available, the thumbnail strip is hidden.
 */

import { useState } from 'react';
import { Box } from '@mui/material';
import type { Product } from '../data/products';

interface ProductGalleryProps {
  /** The product whose images should be displayed. */
  product: Product;
}

/**
 * Renders a product image gallery with main image and thumbnail selector.
 */
function ProductGallery({ product }: ProductGalleryProps): JSX.Element {
  // Build the image list: always make the main image the first entry,
  // then append any extra gallery images (deduplicated from the main).
  const allImages: string[] = (() => {
    const main = product.image;
    const extras = (product.images || []).filter((img) => img && img !== main);
    return [main, ...extras];
  })();

  const [selectedImage, setSelectedImage] = useState<string>(allImages[0]);
  const hasMultipleImages = allImages.length > 1;

  return (
    <Box>
      {/* Main image */}
      <Box
        component="img"
        src={selectedImage}
        alt={product.name.en}
        sx={{
          width: '100%',
          maxHeight: 450,
          objectFit: 'cover',
          borderRadius: 2,
          border: '1px solid #E2E8F0',
        }}
      />

      {/* Thumbnail strip — only shown when multiple images exist */}
      {hasMultipleImages && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mt: 2,
            overflowX: 'auto',
            pb: 1,
          }}
        >
          {allImages.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img}
              alt={`${product.name.en} - ${index + 1}`}
              onClick={() => setSelectedImage(img)}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                border:
                  selectedImage === img
                    ? '3px solid'
                    : '2px solid transparent',
                borderColor: selectedImage === img ? 'secondary.main' : 'transparent',
                opacity: selectedImage === img ? 1 : 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                },
                flexShrink: 0,
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ProductGallery;
