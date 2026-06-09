import { Flex, type FlexProps } from './Flex';

export type StackProps = Omit<FlexProps, 'direction' | 'flexDirection'>;

export function VStack({ ref, ...props }: StackProps) {
  return <Flex ref={ref} direction="column" {...props} />;
}

export function HStack({ ref, ...props }: StackProps) {
  return <Flex ref={ref} direction="row" {...props} />;
}
