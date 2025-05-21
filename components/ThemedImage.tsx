import { Image, ImageProps, useColorScheme } from "react-native";

type ThemedImageProps = ImageProps & {
  lightSource: any;
  darkSource: any;
};

export function ThemedImage({
  lightSource,
  darkSource,
  ...props
}: ThemedImageProps) {
  const theme = useColorScheme();

  return (
    <Image source={theme === "dark" ? darkSource : lightSource} {...props} />
  );
}
