export function FormLabel({
  children,
  required = false,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-gray-text"
    >
      {children}
      {required ? <span className="ms-0.5 text-red">*</span> : null}
    </label>
  );
}
