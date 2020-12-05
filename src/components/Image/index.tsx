import React, { useState } from 'react';
import {
  ImageBaseProps,
  ImageProps,
} from '../../interfaces';

export const ImageBase: React.FC<ImageBaseProps> = ({
  fallbackAssetUrl = '',
  src = fallbackAssetUrl,
  onError,
  ...props
}) => {
  const [assetUrl, setAssetUrl] = useState<string>(src);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError && typeof onError === 'function') {
      onError(event);
    }
    setAssetUrl(fallbackAssetUrl);
  };

  return (
    <img src={assetUrl} {...props} onError={handleImageError} />
  );
};

export const AvatarImage: React.FC<ImageBaseProps> = props => {
  return <ImageBase {...props} fallbackAssetUrl="/assets/images/default_avatar.jpg" />;
};

const Image = ImageBase as ImageProps;
Image.AvatarImage = AvatarImage;

export default Image;
