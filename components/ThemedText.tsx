import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "titleDepartment"
    | "titlePhone"
    | "titleFooter"
    | "subtitleFooter";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "titleDepartment" ? styles.titleDepartment : undefined,
        type === "titlePhone" ? styles.titlePhone : undefined,
        type === "titleFooter" ? styles.titleFooter : undefined,
        type === "subtitleFooter" ? styles.subtitleFooter : undefined,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    color: "#0a7ea4",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
    textAlign: "center",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  titleDepartment: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    paddingTop: 5,
    textAlign: "center",
  },
  titlePhone: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    paddingTop: 15,
    paddingLeft: 5,
    textAlign: "center",
  },
  subtitleFooter: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    paddingLeft: 5,
    textTransform: "uppercase",
  },
  titleFooter: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    paddingLeft: 5,
  },
});
