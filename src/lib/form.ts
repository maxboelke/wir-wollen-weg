/** String value of a form field ("" for missing fields or files). */
export function formString(source: HTMLFormElement | FormData, field: string): string {
  const data = source instanceof FormData ? source : new FormData(source);
  const value = data.get(field);
  return typeof value === "string" ? value : "";
}
