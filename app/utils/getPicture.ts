import { apiUrl, PICTURE_SIZE } from '~/constants';

type ObjectWithPicture<T extends object> = {
  id: string;
  picture: string | { id: string } | null;
} & T;

const getSizes = (sizeType?: string) => {
  let sizes = {
    x: 300,
    y: 300,
  };

  if (sizeType === PICTURE_SIZE.medium) {
    sizes = {
      x: 200,
      y: 200,
    };
  }

  if (sizeType === PICTURE_SIZE.semiMedium) {
    sizes = {
      x: 96,
      y: 96,
    };
  }

  if (sizeType === PICTURE_SIZE.small) {
    sizes = {
      x: 64,
      y: 64,
    };
  }

  if (sizeType === PICTURE_SIZE.smallest) {
    sizes = {
      x: 36,
      y: 36,
    };
  }

  if (sizeType === PICTURE_SIZE.avatar) {
    sizes = {
      x: 80,
      y: 80,
    };
  }
  return sizes;
};

/**
 * if no picture - return no picture image anyway
 * size: small or default
 * @param item - object with picture parameter
 * @param forType - short url for getting picture for instance: ai-providers, chat-models, dolls, etc.
 * @param forSrcSet - get default picture or for src set
 * @param sizeType - one of size [default, small] = if param === undefined, return default
 */

// 1x 96 PPI (common desktop monitors).
// 2x iPhone 4/4S through iPhone 8 (~326 PPI).
// 3x iPhone X, XS, 11 Pro, 12 Pro, 13 Pro (~458 PPI).
// 4x Some premium 4K+ smartphones or tablets (~500-600+ PPI).

export const getPicture = <T extends object>(
  item: ObjectWithPicture<T | any>,
  forType?: string,
  forSrcSet?: boolean,
  sizeType?: string
) => {
  const sizes = getSizes(sizeType);

  if (item && item.picture && forType) {
    let images = `${apiUrl}/pictures/by/${forType}/${item.id}/picture.webp?x=${sizes.x}&y=${sizes.y}`;

    if (forSrcSet) {
      images += `
        ${apiUrl}/pictures/by/${forType}/${item.id}/picture.webp?x=${sizes.x}&y=${sizes.y} 1x, 
        ${apiUrl}/pictures/by/${forType}/${item.id}/picture.webp?x=${sizes.x * 2}&y=${sizes.y * 2} 2x,
        ${apiUrl}/pictures/by/${forType}/${item.id}/picture.webp?x=${sizes.x * 3}&y=${sizes.y * 3} 3x,
        ${apiUrl}/pictures/by/${forType}/${item.id}/picture.webp?x=${sizes.x * 4}&y=${sizes.y * 4} 4x,
      `;
    }
    return images;
  }
  if (!item || !item.picture) {
    let images = `https://placehold.co/${sizes.x}x${sizes.y}?text=No+Picture`;

    if (forSrcSet) {
      images += `
        https://placehold.co/${sizes.x}x${sizes.y}?text=No+Picture 1x, 
        https://placehold.co/${sizes.x * 2}x${sizes.y * 2}?text=No+Picture 2x,
        https://placehold.co/${sizes.x * 3}x${sizes.y * 3}?text=No+Picture 3x,
        https://placehold.co/${sizes.x * 4}x${sizes.y * 4}?text=No+Picture 4x,
      `;
    }

    return images;
  }
};
