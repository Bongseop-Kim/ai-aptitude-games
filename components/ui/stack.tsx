import { Spacing, type SpacingToken } from "@/constants/theme";
import { type ViewProps, type ViewStyle, View } from "react-native";

type StackAlignment = ViewStyle["alignItems"];
type StackJustify = ViewStyle["justifyContent"];
type StackWrap = ViewStyle["flexWrap"];

type StackProps = ViewProps & {
  spacing?: SpacingToken | number;
  align?: StackAlignment;
  justify?: StackJustify;
  wrap?: StackWrap;
  reverse?: boolean;
};

type ZStackProps = ViewProps & {
  align?: StackAlignment;
  justify?: StackJustify;
};

const resolveSpacing = (spacing?: StackProps["spacing"]) => {
  if (typeof spacing === "number") {
    return spacing;
  }
  if (!spacing) {
    return undefined;
  }
  return Spacing[spacing];
};

export function VStack({
  spacing,
  align,
  justify,
  wrap,
  reverse = false,
  style,
  ...rest
}: StackProps) {
  const gap = resolveSpacing(spacing);

  return (
    <View
      style={[
        {
          flexDirection: reverse ? "column-reverse" : "column",
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap,
          rowGap: gap,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export function HStack({
  spacing,
  align,
  justify,
  wrap,
  reverse = false,
  style,
  ...rest
}: StackProps) {
  const gap = resolveSpacing(spacing);

  return (
    <View
      style={[
        {
          flexDirection: reverse ? "row-reverse" : "row",
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap,
          columnGap: gap,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export function ZStack({
  align,
  justify,
  style,
  ...rest
}: ZStackProps) {
  return (
    <View
      style={[
        {
          position: "relative",
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    />
  );
}
