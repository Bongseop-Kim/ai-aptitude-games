import { Box, type BoxProps } from '../../design-system/components/Box';

export type CardProps = BoxProps & {
  elevated?: boolean;
};

export function Card({ elevated = false, ...props }: CardProps) {
  return (
    <Box
      bg="bg.layerFloating"
      borderColor="stroke.neutralSubtle"
      borderRadius="r4"
      borderWidth="thin"
      boxShadow={elevated ? 'surface' : undefined}
      p="spacingX.globalGutter"
      {...props}
    />
  );
}
