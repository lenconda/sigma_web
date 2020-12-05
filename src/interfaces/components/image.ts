import React from 'react';

export interface ImageBaseProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  fallbackAssetUrl?: string;
}

export type ImageProps = React.FC<ImageBaseProps> & {
  AvatarImage: React.FC<ImageBaseProps>;
};
