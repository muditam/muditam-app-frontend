import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./diet";

export function parseHbA1cValue(rawValue) {
  if (rawValue == null) return null;

  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : null;
  }

  if (typeof rawValue === "string") {
    const cleaned = rawValue.trim().replace("%", "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getKitProductTitlesForHbA1c(rawHbA1c) {
  const hba1c = parseHbA1cValue(rawHbA1c);

  if (hba1c == null) {
    return ["Karela Jamun Fizz", "Sugar Defend Pro"];
  }

  if (hba1c <= 6.0) {
    return ["Karela Jamun Fizz"];
  }

  if (hba1c <= 9.0) {
    return ["Karela Jamun Fizz", "Sugar Defend Pro"];
  }

  return ["Sugar Defend Pro", "Vasant Kusmakar Ras"];
}

export async function resolveUserHbA1c() {
  const storedHbA1c = await AsyncStorage.getItem("hba1c");
  const parsedStoredHbA1c = parseHbA1cValue(
    storedHbA1c ? JSON.parse(storedHbA1c) : null
  );

  try {
    const storedUser = await AsyncStorage.getItem("userDetails");
    const phone = storedUser ? JSON.parse(storedUser)?.phone : null;

    if (!phone) {
      return parsedStoredHbA1c;
    }

    const response = await fetch(`${API_BASE}/api/quiz/${phone}`);
    if (!response.ok) {
      return parsedStoredHbA1c;
    }

    const data = await response.json();
    const backendHbA1c = parseHbA1cValue(data?.hba1c);

    if (backendHbA1c != null) {
      await AsyncStorage.setItem("hba1c", JSON.stringify(backendHbA1c));
      return backendHbA1c;
    }
  } catch (error) {
    console.error("Failed to resolve HbA1c for kit recommendation:", error);
  }

  return parsedStoredHbA1c;
}
