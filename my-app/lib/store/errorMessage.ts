/** Extract a readable message from an RTK Query / SerializedError */
export function rtkErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (!error || typeof error !== "object") return fallback;

  if ("data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "error" in data) {
      return String((data as { error: string }).error);
    }
  }

  if ("error" in error && typeof (error as { error: unknown }).error === "string") {
    return (error as { error: string }).error;
  }

  if ("message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return fallback;
}
